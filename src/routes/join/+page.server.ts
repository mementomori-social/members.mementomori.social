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
import { m } from '$lib/paraglide/messages.js';

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
	default: async ({ request, locals, platform, cookies }) => {
		const db = getDb(platform!.env.DB);
		const form = await request.formData();
		const pending = readPending(cookies.get('join_masto'));

		const fullName = String(form.get('fullName') ?? '').trim();
		const homeMunicipality = String(form.get('homeMunicipality') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const memberClass = String(form.get('memberClass') ?? 'member') as MemberClass;
		const billingInterval = form.get('billingInterval') === 'month' ? 'month' : 'year';
		const listedConsent = form.get('listedConsent') === 'on';

		const values = { fullName, homeMunicipality, email, memberClass, billingInterval };
		if (!fullName || !homeMunicipality)
			return fail(400, { ...values, error: m.err_name_municipality_required() });
		if (!(memberClass in FEES)) return fail(400, { ...values, error: m.err_unknown_class() });

		let userId = locals.user?.id;
		if (!userId && pending) {
			// Mastodon path: the account is created with a random password and the
			// verified Mastodon account is linked for sign-in. No password exists.
			if (!email) return fail(400, { ...values, error: m.err_email_required() });
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
					listedConsent
				});
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
			await db.insert(account).values({
				id: crypto.randomUUID(),
				accountId: pending.accountId,
				providerId: 'mastodon',
				userId: userId!,
				accessToken: pending.accessToken,
				scope: 'profile'
			});
			cookies.delete('join_masto', { path: '/join' });
		}

		// A register row may already exist without a login: founding members and
		// anyone entered by the board. Claim it by email instead of duplicating.
		const claimEmail = email || locals.user?.email || '';
		const unclaimed = claimEmail
			? await db.query.member.findFirst({
					where: and(eq(member.email, claimEmail), isNull(member.userId))
				})
			: undefined;

		if (unclaimed) {
			await db
				.update(member)
				.set({
					userId: userId!,
					billingInterval,
					listedConsent,
					mastodonAcct: pending?.acct ?? unclaimed.mastodonAcct,
					mastodonAvatarUrl: pending?.avatar ?? unclaimed.mastodonAvatarUrl
				})
				.where(eq(member.id, unclaimed.id));
		} else {
			await db.insert(member).values({
				userId: userId!,
				fullName,
				homeMunicipality,
				email: claimEmail,
				memberClass,
				billingInterval,
				listedConsent,
				mastodonAcct: pending?.acct ?? null,
				mastodonAvatarUrl: pending?.avatar ?? null
			});
		}

		redirect(303, '/dashboard');
	}
};
