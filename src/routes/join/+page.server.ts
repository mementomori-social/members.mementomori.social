import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import { and, eq, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { account, member, user } from '$lib/server/db/schema';
import { getMemberByUserId } from '$lib/server/members';
import { FEES, type MemberClass } from '$lib/fees';
import type { PendingMastodon } from '$lib/server/mastodon-oauth';
import { localizeHref } from '$lib/paraglide/runtime';
import { tooManyRequests } from '$lib/server/rate-limit';
import { m } from '$lib/paraglide/messages.js';
import { boardMessage, isTestAddress, notifyBoard } from '$lib/server/notify';

const readPending = (raw: string | undefined): PendingMastodon | null => {
	if (!raw) return null;
	try {
		return JSON.parse(raw) as PendingMastodon;
	} catch {
		return null;
	}
};

export const load: PageServerLoad = async ({ locals, platform, cookies }) => {
	if (locals.user) {
		const existing = await getMemberByUserId(getDb(platform!.env.DB), locals.user.id);
		if (existing) redirect(303, '/dashboard');
	}
	const pending = readPending(cookies.get('join_masto'));
	return {
		signedIn: Boolean(locals.user),
		pendingMasto: pending ? { acct: pending.acct, name: pending.name } : null
	};
};

const applyBootstrapRole = async (db: ReturnType<typeof getDb>, email: string) => {
	// BOOTSTRAP_ROLES="a@b.fi=chair,c@d.fi=vice"
	const entry = (env.BOOTSTRAP_ROLES ?? '')
		.split(',')
		.map((s) => s.trim().split('='))
		.find(([e]) => e?.toLowerCase() === email.toLowerCase());
	if (entry?.[1]) await db.update(user).set({ role: entry[1] }).where(eq(user.email, email));
};

export const actions: Actions = {
	cancel: async ({ cookies }) => {
		cookies.delete('join_masto', { path: '/' });
		redirect(303, localizeHref('/join'));
	},

	apply: async ({ request, locals, platform, cookies, getClientAddress }) => {
		const db = getDb(platform!.env.DB);
		const form = await request.formData();
		const pending = readPending(cookies.get('join_masto'));

		const fullName = String(form.get('fullName') ?? '').trim();
		const homeMunicipality = String(form.get('homeMunicipality') ?? '').trim();
		// Addresses are case-insensitive in practice: "O@" and "o@" are one
		// mailbox, and treating them as two created duplicate applications.
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const memberClass = String(form.get('memberClass') ?? 'member') as MemberClass;
		const billingInterval = form.get('billingInterval') === 'year' ? 'year' : 'month';
		const listedConsent = form.get('listedConsent') === 'on';
		const publicConsent = form.get('publicConsent') === 'on';

		const values = { fullName, homeMunicipality, email, memberClass, billingInterval };
		if (!fullName || !homeMunicipality)
			return fail(400, { ...values, error: m.err_name_municipality_required() });
		if (!(memberClass in FEES)) return fail(400, { ...values, error: m.err_unknown_class() });

		// This action sends mail, so it is a flooding tool until it is capped.
		if (!locals.user) {
			const ip = getClientAddress();
			if (
				(await tooManyRequests(db, `join|ip|${ip}`, { window: 3600, max: 25 })) ||
				(email &&
					(await tooManyRequests(db, `join|email|${email.toLowerCase()}`, {
						window: 3600,
						max: 3
					})))
			)
				return fail(429, { ...values, error: m.err_too_many() });
		}

		let userId = locals.user?.id;
		let createdViaMastodon = !userId && Boolean(pending);
		if (!userId && pending) {
			// Mastodon path: the account is created with a random password and the
			// verified Mastodon account is linked for sign-in. No password exists.
			if (!email) return fail(400, { ...values, error: m.err_email_required() });

			// Someone applying a second time already has an account. Creating another
			// one throws, and linking this Mastodon account to an address the visitor
			// merely typed would hand over a login, so the flow ends the safe way it
			// always ends: a link to the address itself.
			const existingUser = await db.query.user.findFirst({ where: eq(user.email, email) });
			if (existingUser) {
				cookies.delete('join_masto', { path: '/' });
				try {
					await locals.auth.api.signInMagicLink({
						body: { email, name: fullName, callbackURL: '/dashboard' },
						headers: request.headers
					});
				} catch (e) {
					const msg = e instanceof APIError ? e.message : m.err_account_create();
					return fail(500, { ...values, error: msg });
				}
				return { magicSent: true, email };
			}

			try {
				const res = await locals.auth.api.signUpEmail({
					body: { name: fullName, email, password: crypto.randomUUID() + crypto.randomUUID() }
				});
				userId = res.user.id;
			} catch (e) {
				const msg = e instanceof APIError ? e.message : m.err_account_create();
				return fail(400, { ...values, error: msg });
			}
			await applyBootstrapRole(db, email);
			createdViaMastodon = true;
		}

		if (!userId && !pending) {
			if (!email) return fail(400, { ...values, error: m.err_email_required() });
			// Store the application without a login. The row is claimed when the
			// magic link is used and the dashboard matches the verified email.
			const existing = await db.query.member.findFirst({
				where: and(eq(member.email, email), isNull(member.userId))
			});
			if (!existing) {
				await db.insert(member).values({
					fullName,
					homeMunicipality,
					email,
					memberClass,
					billingInterval,
					listedConsent,
					publicConsent
				});
				const msg = boardMessage(
					'📝 New Mementomori ry membership application',
					[
						['Name', fullName],
						['Municipality', homeMunicipality],
						['Class', memberClass === 'member' ? 'member' : 'supporting member'],
						['Billing', billingInterval === 'year' ? 'annual' : 'monthly']
					],
					{ label: 'Review and approve', url: 'https://members.mementomori.social/admin' }
				);
				if (!isTestAddress(email)) await notifyBoard(msg.plain, msg.html);
			}
			try {
				await locals.auth.api.signInMagicLink({
					body: { email, name: fullName, callbackURL: '/dashboard' },
					headers: request.headers
				});
			} catch (e) {
				const msg = e instanceof APIError ? e.message : m.err_account_create();
				return fail(500, { ...values, error: msg });
			}
			await applyBootstrapRole(db, email);
			return { magicSent: true };
		}

		if (pending) {
			// Re-applying sends the same Mastodon account through again; the link
			// already exists and must not turn a resubmit into a 500.
			await db
				.insert(account)
				.values({
					id: crypto.randomUUID(),
					accountId: pending.accountId,
					providerId: 'mastodon',
					userId: userId!,
					accessToken: pending.accessToken,
					scope: 'profile'
				})
				.onConflictDoNothing();
			cookies.delete('join_masto', { path: '/' });
		}

		// A register row may already exist without a login: founding members and
		// anyone entered by the board. Claiming one takes the identity behind it,
		// so it is only ever done for an address the session has already proven.
		// A typed address proves nothing; that path claims later, on the
		// dashboard, once the magic link has verified it.
		const claimEmail = email || locals.user?.email || '';
		const verifiedEmail = locals.user?.emailVerified ? (locals.user.email ?? '') : '';
		const unclaimed =
			verifiedEmail && verifiedEmail.toLowerCase() === claimEmail.toLowerCase()
				? await db.query.member.findFirst({
						where: and(eq(member.email, verifiedEmail), isNull(member.userId))
					})
				: undefined;

		// Applying twice must update the existing row, never insert a second one:
		// member.userId is unique, so a duplicate insert would fail as a 500.
		const mine = await getMemberByUserId(db, userId!);
		if (mine) {
			await db
				.update(member)
				.set({
					fullName,
					homeMunicipality,
					memberClass,
					billingInterval,
					listedConsent,
					publicConsent,
					mastodonAcct: pending?.acct ?? mine.mastodonAcct,
					mastodonAvatarUrl: pending?.avatar ?? mine.mastodonAvatarUrl
				})
				.where(eq(member.id, mine.id));
			if (createdViaMastodon) {
				try {
					await locals.auth.api.signInMagicLink({
						body: { email: email || mine.email || '', name: fullName, callbackURL: '/dashboard' },
						headers: request.headers
					});
				} catch {
					// The application is saved either way; sign-in can be retried.
				}
				return { magicSent: true, email: email || mine.email || '' };
			}
			redirect(303, '/dashboard');
		}

		let isNewApplication = false;
		if (unclaimed) {
			await db
				.update(member)
				.set({
					userId: userId!,
					billingInterval,
					listedConsent,
					publicConsent,
					mastodonAcct: pending?.acct ?? unclaimed.mastodonAcct,
					mastodonAvatarUrl: pending?.avatar ?? unclaimed.mastodonAvatarUrl
				})
				.where(eq(member.id, unclaimed.id));
			isNewApplication = unclaimed.status === 'applied';
		} else {
			await db.insert(member).values({
				userId: userId!,
				fullName,
				homeMunicipality,
				email: claimEmail,
				memberClass,
				billingInterval,
				listedConsent,
				publicConsent,
				mastodonAcct: pending?.acct ?? null,
				mastodonAvatarUrl: pending?.avatar ?? null
			});
			isNewApplication = true;
		}

		if (isNewApplication) {
			const fields: Array<[string, string]> = [
				['Name', fullName],
				['Municipality', homeMunicipality],
				['Class', memberClass === 'member' ? 'member' : 'supporting member'],
				['Billing', billingInterval === 'year' ? 'annual' : 'monthly']
			];
			if (pending?.acct) fields.push(['Mastodon', `@${pending.acct}`]);
			const msg = boardMessage('📝 New Mementomori ry membership application', fields, {
				label: 'Review and approve',
				url: 'https://members.mementomori.social/admin'
			});
			if (!isTestAddress(email)) await notifyBoard(msg.plain, msg.html);
		}

		// A fresh Mastodon-path account has no session yet (sign-ups require a
		// verified email), so the application ends with a sign-in link. Using it
		// verifies the typed address, keeping the member register trustworthy.
		if (createdViaMastodon) {
			try {
				await locals.auth.api.signInMagicLink({
					body: { email: claimEmail, name: fullName, callbackURL: '/dashboard' },
					headers: request.headers
				});
			} catch (e) {
				const msg = e instanceof APIError ? e.message : m.err_account_create();
				return fail(500, { ...values, error: msg });
			}
			return { magicSent: true };
		}

		redirect(303, '/dashboard');
	}
};
