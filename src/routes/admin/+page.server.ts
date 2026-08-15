import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approval, member, payment } from '$lib/server/db/schema';
import { isBoard } from '$lib/server/members';
import { m } from '$lib/paraglide/messages.js';

const requireBoard = (locals: App.Locals) => {
	if (!locals.user) redirect(303, '/login');
	const role = (locals.user as { role?: string }).role ?? 'member';
	if (!isBoard(role)) error(403, 'Board members only.');
	return { userId: locals.user.id, role };
};

export const load: PageServerLoad = async ({ locals, platform }) => {
	requireBoard(locals);
	const db = getDb(platform!.env.DB);

	const members = await db.query.member.findMany({
		orderBy: (r, { desc }) => [desc(r.appliedAt)]
	});
	const approvals = await db.query.approval.findMany();
	const payments = await db.query.payment.findMany({
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});

	const nameById = new Map(members.map((r) => [r.id, r.fullName]));
	return {
		applied: members
			.filter((r) => r.status === 'applied')
			.map((r) => ({
				...r,
				approvals: approvals
					.filter((a) => a.memberId === r.id)
					.map((a) => ({ approverUserId: a.approverUserId, approverRole: a.approverRole }))
			})),
		roster: members.filter((r) => r.status !== 'applied'),
		ledger: payments.map((p) => ({ ...p, memberName: nameById.get(p.memberId) ?? '?' }))
	};
};

export const actions: Actions = {
	approve: async ({ request, locals, platform }) => {
		const { userId, role } = requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const form = await request.formData();
		const memberId = String(form.get('memberId') ?? '');

		const row = await db.query.member.findFirst({ where: eq(member.id, memberId) });
		if (!row || row.status !== 'applied') return fail(400, { adminError: m.err_not_open() });
		// Yhdistyslaki 37 §: no one takes part in deciding their own matter.
		if (row.userId === userId) return fail(403, { adminError: m.err_own_application() });

		const existing = await db.query.approval.findMany({
			where: eq(approval.memberId, memberId)
		});
		if (existing.some((a) => a.approverUserId === userId))
			return fail(400, { adminError: m.err_already_approved() });

		await db.insert(approval).values({ memberId, approverUserId: userId, approverRole: role });

		// Board decision 21.7.2026: two approvers, at least one chair or vice chair.
		const all = [...existing, { approverUserId: userId, approverRole: role }];
		const hasLead = all.some((a) => a.approverRole === 'chair' || a.approverRole === 'vice');
		if (all.length >= 2 && hasLead) {
			await db
				.update(member)
				.set({ status: 'approved', decidedAt: new Date() })
				.where(eq(member.id, memberId));
		}
		return { adminOk: true };
	},

	reject: async ({ request, locals, platform }) => {
		const { userId } = requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const form = await request.formData();
		const memberId = String(form.get('memberId') ?? '');
		const row = await db.query.member.findFirst({ where: eq(member.id, memberId) });
		if (!row || row.status !== 'applied') return fail(400, { adminError: m.err_not_open() });
		if (row.userId === userId) return fail(403, { adminError: m.err_own_application() });
		await db
			.update(member)
			.set({ status: 'rejected', decidedAt: new Date() })
			.where(eq(member.id, memberId));
		return { adminOk: true, refundNote: true };
	},

	recordPayment: async ({ request, locals, platform }) => {
		const { userId } = requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const form = await request.formData();

		const memberId = String(form.get('memberId') ?? '');
		const amountEur = Number(form.get('amountEur'));
		// Finnish d.M.yyyy from the form; ISO accepted as a fallback.
		const rawDate = String(form.get('paidAt') ?? '').trim();
		const fiMatch = rawDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
		const paidAt = fiMatch
			? new Date(Date.UTC(Number(fiMatch[3]), Number(fiMatch[2]) - 1, Number(fiMatch[1])))
			: new Date(rawDate);
		const reference = String(form.get('reference') ?? '').trim() || null;

		if (!memberId || !Number.isFinite(amountEur) || amountEur <= 0 || isNaN(paidAt.getTime()))
			return fail(400, { adminError: m.err_payment_fields() });

		const row = await db.query.member.findFirst({ where: eq(member.id, memberId) });
		if (!row) return fail(400, { adminError: m.err_unknown_member() });

		const periodStart = paidAt;
		const periodEnd = new Date(paidAt);
		if (row.billingInterval === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
		else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

		await db.insert(payment).values({
			memberId,
			amountEur,
			method: 'bank',
			reference,
			paidAt,
			periodStart,
			periodEnd,
			recordedBy: userId
		});
		return { adminOk: true };
	}
};
