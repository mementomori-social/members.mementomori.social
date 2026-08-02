import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { account, member, payment } from '$lib/server/db/schema';
import { collectedThisYearEur, getMemberByUserId } from '$lib/server/members';
import { FEES } from '$lib/fees';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	const m = await getMemberByUserId(db, locals.user.id);
	if (!m) redirect(303, '/join');

	const payments = await db.query.payment.findMany({
		where: eq(payment.memberId, m.id),
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});
	const linked = await db.query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon'))
	});

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
		fee: FEES[m.memberClass],
		collectedEur: await collectedThisYearEur(db)
	};
};

export const actions: Actions = {
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
