import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approval, member, payment, user } from '$lib/server/db/schema';
import { isBoard } from '$lib/server/members';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	if (!isBoard((locals.user as { role?: string }).role)) error(403, 'Board members only.');
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
		approvals: approvals.map((a) => ({
			name: approvers.get(a.approverUserId) ?? a.approverUserId,
			role: a.approverRole,
			at: a.createdAt
		}))
	};
};
