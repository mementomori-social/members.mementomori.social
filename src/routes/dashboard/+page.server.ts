import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { account, member, payment } from '$lib/server/db/schema';
import {
	collectedThisYearEur,
	collectedTotalEur,
	getMemberByUserId,
	recurringSummary
} from '$lib/server/members';
import { FEES } from '$lib/fees';
import { isFullName } from '$lib/name';
import {
	ensureBillingPortalConfig,
	getStripe,
	intervalForPriceId,
	priceIdFor,
	stripeEnabled
} from '$lib/server/stripe';
import { assignViite, formatViite } from '$lib/server/viite';
import { lookupAccount } from '$lib/server/mastodon';
import { virtualBarcode } from '$lib/server/barcode';
import { getLocale, localizeHref } from '$lib/paraglide/runtime';
import { env } from '$env/dynamic/private';
import { m as msg } from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	let m = await getMemberByUserId(db, locals.user.id);
	if (!m) {
		// Magic-link signups store the application before the login exists.
		// The email is verified by the link, so the row can be claimed now.
		const unclaimed = await db.query.member.findFirst({
			where: and(
				sql`lower(${member.email}) = ${locals.user.email.toLowerCase()}`,
				isNull(member.userId)
			)
		});
		if (unclaimed) {
			await db.update(member).set({ userId: locals.user.id }).where(eq(member.id, unclaimed.id));
			m = await getMemberByUserId(db, locals.user.id);
		}
	}
	if (!m) redirect(303, '/join');

	// Yhdistyslaki 11 § needs a complete name; without it the register is not
	// valid, so the member area stays closed until it is corrected.
	if (!isFullName(m.fullName, m.mastodonAcct)) redirect(303, localizeHref('/profile'));

	// Portal changes arrive without a webhook, so a subscriber's row is synced
	// from Stripe on load: cancellation clears the id, a price switch updates
	// the schedule.
	if (m.stripeSubscriptionId && stripeEnabled()) {
		try {
			const sub = await getStripe().subscriptions.retrieve(m.stripeSubscriptionId);
			const priceId = sub.items.data[0]?.price?.id;
			const interval = priceId ? intervalForPriceId(priceId) : null;
			const gone = sub.status === 'canceled' || sub.status === 'incomplete_expired';
			if (gone || (interval && interval !== m.billingInterval)) {
				await db
					.update(member)
					.set(gone ? { stripeSubscriptionId: null } : { billingInterval: interval! })
					.where(eq(member.id, m.id));
				m = (await getMemberByUserId(db, locals.user.id))!;
			}
		} catch {
			// Stripe being unreachable must not take the dashboard down.
		}
	}

	const payments = await db.query.payment.findMany({
		where: eq(payment.memberId, m.id),
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});
	const linked = await db.query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon'))
	});

	const now = Date.now();
	const covered = payments.some((p) => p.periodEnd.getTime() > now);
	const paidUntil = payments.reduce(
		(max, p) => (p.periodEnd.getTime() > max ? p.periodEnd.getTime() : max),
		0
	);

	let viite = m.viite;
	if (!viite && m.status === 'approved') viite = await assignViite(db, m.id);

	return {
		m,
		nameIncomplete: !isFullName(m.fullName, m.mastodonAcct),
		payments: payments.map((p) => ({
			amountEur: p.amountEur,
			method: p.method,
			paidAt: p.paidAt,
			periodStart: p.periodStart,
			periodEnd: p.periodEnd
		})),
		mastodonLinked: Boolean(linked),
		mastoProfile: linked && m.mastodonAcct ? await lookupAccount(m.mastodonAcct) : null,
		fee: FEES[m.memberClass],
		covered,
		paidUntil: covered ? new Date(paidUntil) : null,
		dueAmountEur:
			m.billingInterval === 'month' ? FEES[m.memberClass].month : FEES[m.memberClass].year,
		collectedEur: await collectedThisYearEur(db),
		collectedAll: await collectedTotalEur(db),
		recurring: await recurringSummary(db),
		canPay: stripeEnabled() && !covered && Boolean(priceIdFor(m.memberClass, m.billingInterval)),
		bank:
			m.status === 'approved' && !covered && env.BANK_IBAN
				? {
						iban: env.BANK_IBAN,
						ibanCompact: env.BANK_IBAN.replace(/\s/g, ''),
						viite: formatViite(viite ?? ''),
						viiteRaw: viite ?? '',
						amountEur:
							m.billingInterval === 'month' ? FEES[m.memberClass].month : FEES[m.memberClass].year,
						barcode: viite
							? virtualBarcode(
									env.BANK_IBAN,
									m.billingInterval === 'month'
										? FEES[m.memberClass].month
										: FEES[m.memberClass].year,
									viite
								)
							: null
					}
				: null
	};
};

export const actions: Actions = {
	/** Start a Stripe Checkout for the fixed membership fee. */
	pay: async ({ locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const m = await getMemberByUserId(db, locals.user.id);
		if (!m) redirect(303, '/join');
		if (!stripeEnabled()) return fail(503, { payError: 'Payments are not available yet.' });

		const priceId = priceIdFor(m.memberClass, m.billingInterval);
		if (!priceId) return fail(503, { payError: 'Payments are not available yet.' });

		const stripe = getStripe();
		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			line_items: [{ price: priceId, quantity: 1 }],
			customer_email: m.email ?? locals.user.email,
			metadata: { memberId: m.id },
			subscription_data: { metadata: { memberId: m.id } },
			success_url: `${env.ORIGIN}${getLocale() === 'fi' ? '/fi' : ''}/dashboard?paid=1`,
			cancel_url: `${env.ORIGIN}${getLocale() === 'fi' ? '/fi' : ''}/dashboard`
		});
		if (!session.url) return fail(502, { payError: 'Could not start the payment.' });
		redirect(303, session.url);
	},

	/** Both list consents, editable so they can be withdrawn at any time. */
	saveVisibility: async ({ request, locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const m = await getMemberByUserId(db, locals.user.id);
		if (!m) redirect(303, '/join');
		const form = await request.formData();
		await db
			.update(member)
			.set({
				listedConsent: form.get('listedConsent') === 'on',
				publicConsent: form.get('publicConsent') === 'on'
			})
			.where(eq(member.id, m.id));
		return { visibilitySaved: true };
	},

	/** Stripe's own portal handles card, schedule and cancellation for
	 * subscribers; the configuration is provisioned on first use. */
	manageBilling: async ({ locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const me = await getMemberByUserId(db, locals.user.id);
		if (!me) redirect(303, '/join');
		if (!stripeEnabled() || !me.stripeCustomerId)
			return fail(400, { billingError: 'No billing account.' });

		const stripe = getStripe();
		const configuration = await ensureBillingPortalConfig(stripe);
		const session = await stripe.billingPortal.sessions.create({
			customer: me.stripeCustomerId,
			configuration,
			return_url: `${env.ORIGIN}${getLocale() === 'fi' ? '/fi' : ''}/dashboard`
		});
		redirect(303, session.url);
	},

	/**
	 * The fee is the same either way, so switching only changes the schedule of
	 * what is still unpaid. An active card subscription keeps its own cadence
	 * until it is cancelled, so it is refused here rather than silently ignored.
	 */
	saveBilling: async ({ request, locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const me = await getMemberByUserId(db, locals.user.id);
		if (!me) redirect(303, '/join');
		if (me.stripeSubscriptionId) return fail(400, { billingError: msg.billing_locked() });

		const billingInterval =
			(await request.formData()).get('billingInterval') === 'year' ? 'year' : 'month';
		await db.update(member).set({ billingInterval }).where(eq(member.id, me.id));
		return { billingSaved: true };
	},

	/**
	 * Pull acct + avatar from Mastodon using the token stored at link time.
	 * Explicit rather than automatic so the member controls when data updates.
	 */
	syncMastodon: async ({ locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const m = await getMemberByUserId(db, locals.user.id);
		if (!m) redirect(303, '/join');

		const linked = await db.query.account.findFirst({
			where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon'))
		});
		if (!linked?.accessToken) return fail(400, { syncError: 'No linked Mastodon account.' });

		const res = await fetch('https://mementomori.social/api/v1/accounts/verify_credentials', {
			headers: { Authorization: `Bearer ${linked.accessToken}` }
		});
		if (!res.ok) return fail(502, { syncError: `Mastodon returned ${res.status}.` });
		const profile = (await res.json()) as { acct: string; avatar_static?: string; avatar?: string };

		await db
			.update(member)
			.set({
				mastodonAcct: profile.acct,
				mastodonAvatarUrl: profile.avatar_static || profile.avatar || null
			})
			.where(eq(member.id, m.id));
		return { synced: true };
	}
};
