import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { account, member, payment } from '$lib/server/db/schema';
import { collectedThisYearEur, getMemberByUserId } from '$lib/server/members';
import { FEES } from '$lib/fees';
import { getStripe, priceIdFor, stripeEnabled } from '$lib/server/stripe';
import { assignViite, formatViite } from '$lib/server/viite';
import { lookupAccount } from '$lib/server/mastodon';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	let m = await getMemberByUserId(db, locals.user.id);
	if (!m) {
		// Magic-link signups store the application before the login exists.
		// The email is verified by the link, so the row can be claimed now.
		const unclaimed = await db.query.member.findFirst({
			where: and(eq(member.email, locals.user.email), isNull(member.userId))
		});
		if (unclaimed) {
			await db.update(member).set({ userId: locals.user.id }).where(eq(member.id, unclaimed.id));
			m = await getMemberByUserId(db, locals.user.id);
		}
	}
	if (!m) redirect(303, '/join');

	const payments = await db.query.payment.findMany({
		where: eq(payment.memberId, m.id),
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});
	const linked = await db.query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon'))
	});

	const now = Date.now();
	const covered = payments.some((p) => p.periodEnd.getTime() > now);

	let viite = m.viite;
	if (!viite && m.status === 'approved') viite = await assignViite(db, m.id);

	return {
		m,
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
		collectedEur: await collectedThisYearEur(db),
		canPay: stripeEnabled() && !covered && Boolean(priceIdFor(m.memberClass, m.billingInterval)),
		bank:
			m.status === 'approved' && !covered && env.BANK_IBAN
				? { iban: env.BANK_IBAN, viite: formatViite(viite ?? ''), amount: FEES[m.memberClass] }
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
			success_url: `${env.ORIGIN}/dashboard?paid=1`,
			cancel_url: `${env.ORIGIN}/dashboard`
		});
		if (!session.url) return fail(502, { payError: 'Could not start the payment.' });
		redirect(303, session.url);
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
