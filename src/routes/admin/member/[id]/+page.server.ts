import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approval, member, payment, user } from '$lib/server/db/schema';
import { requireBoard } from '$lib/server/members';
import { getStripe, resumeSubscription, stopSubscription, stripeEnabled } from '$lib/server/stripe';
import { m } from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	requireBoard(locals);
	const db = getDb(platform!.env.DB);

	const row = await db.query.member.findFirst({ where: eq(member.id, params.id) });
	if (!row) error(404, 'No such member.');

	const payments = await db.query.payment.findMany({
		where: eq(payment.memberId, row.id),
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});
	const approvals = await db.query.approval.findMany({
		where: eq(approval.memberId, row.id),
		orderBy: (a, { asc }) => [asc(a.createdAt)]
	});
	const approvers = new Map<string, string>();
	for (const a of approvals) {
		if (!approvers.has(a.approverUserId)) {
			const u = await db.query.user.findFirst({ where: eq(user.id, a.approverUserId) });
			approvers.set(a.approverUserId, u?.name ?? a.approverUserId);
		}
	}

	return {
		member: row,
		payments,
		// The paid period is the natural end date when someone resigns
		paidUntil: payments.reduce<Date | null>(
			(max, p) => (!max || p.periodEnd > max ? p.periodEnd : max),
			null
		),
		approvals: approvals.map((a) => ({
			name: approvers.get(a.approverUserId) ?? a.approverUserId,
			role: a.approverRole,
			at: a.createdAt
		}))
	};
};

export const actions: Actions = {
	/**
	 * Ends a membership on the given date. Nothing is deleted: the register
	 * keeps the row and payments for the books, and the member can come back.
	 */
	deactivate: async ({ params, request, locals, platform }) => {
		requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const row = await db.query.member.findFirst({ where: eq(member.id, params.id) });
		if (!row || row.status !== 'approved') return fail(400, { error: m.err_not_active() });

		const date = String((await request.formData()).get('endDate') ?? '');
		const endedAt = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T23:59:59`) : null;
		if (!endedAt || isNaN(endedAt.getTime())) return fail(400, { error: m.err_end_date() });
		const endsNow = endedAt.getTime() <= Date.now();

		// Stop the card renewing; the webhook clears the subscription id once Stripe ends it
		if (row.stripeSubscriptionId && stripeEnabled()) {
			await stopSubscription(getStripe(), row.stripeSubscriptionId, endedAt);
		}

		await db
			.update(member)
			.set({ endedAt, status: endsNow ? 'ended' : 'approved' })
			.where(eq(member.id, row.id));
		return { ok: true };
	},

	reactivate: async ({ params, locals, platform }) => {
		requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const row = await db.query.member.findFirst({ where: eq(member.id, params.id) });
		if (!row || (row.status !== 'ended' && !row.endedAt))
			return fail(400, { error: m.err_not_ended() });

		// A scheduled card cancellation would otherwise still end the membership
		if (row.stripeSubscriptionId && stripeEnabled() && row.status === 'approved') {
			await resumeSubscription(getStripe(), row.stripeSubscriptionId);
		}

		await db.update(member).set({ endedAt: null, status: 'approved' }).where(eq(member.id, row.id));
		return { ok: true };
	}
};
