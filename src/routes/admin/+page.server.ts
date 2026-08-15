import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approval, income, member, payment } from '$lib/server/db/schema';
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
	const payments = await db.query.payment.findMany({
		orderBy: (p, { desc }) => [desc(p.paidAt)]
	});

	const nameById = new Map(members.map((r) => [r.id, r.fullName]));
	// The board's first question about any row is whether the fee is in.
	const now = Date.now();
	const withPaid = <T extends { id: string }>(r: T) => ({
		...r,
		paidUntil: payments
			.filter((p) => p.memberId === r.id)
			.reduce<Date | null>((max, p) => (!max || p.periodEnd > max ? p.periodEnd : max), null)
	});
	return {
		applied: members.filter((r) => r.status === 'applied').map(withPaid),
		roster: members.filter((r) => r.status !== 'applied').map(withPaid),
		ledger: payments.map((p) => ({ ...p, memberName: nameById.get(p.memberId) ?? '?' })),
		incomeRows: await db.query.income.findMany({ orderBy: (i, { desc }) => [desc(i.paidAt)] })
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

		// Board decision 15.8.2026: one board member approves. The approval row
		// keeps the audit trail of who decided.
		await db.insert(approval).values({ memberId, approverUserId: userId, approverRole: role });
		await db
			.update(member)
			.set({ status: 'approved', decidedAt: new Date() })
			.where(eq(member.id, memberId));
		return { adminOk: true };
	},

	reject: async ({ request, locals, platform }) => {
		const { userId } = requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const form = await request.formData();
		const memberId = String(form.get('memberId') ?? '');
		const row = await db.query.member.findFirst({ where: eq(member.id, memberId) });
		if (!row || row.status !== 'applied') return fail(400, { adminError: m.err_not_open() });
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
	},

	recordIncome: async ({ request, locals, platform }) => {
		const { userId } = requireBoard(locals);
		const db = getDb(platform!.env.DB);
		const form = await request.formData();

		const source = String(form.get('source') ?? '');
		const payer = String(form.get('payer') ?? '').trim();
		const amountEur = Number(form.get('amountEur'));
		const rawDate = String(form.get('paidAt') ?? '').trim();
		const fiMatch = rawDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
		const paidAt = fiMatch
			? new Date(Date.UTC(Number(fiMatch[3]), Number(fiMatch[2]) - 1, Number(fiMatch[1])))
			: new Date(rawDate);
		const note = String(form.get('note') ?? '').trim() || null;

		if (
			!['sponsorship', 'grant', 'other'].includes(source) ||
			!payer ||
			!Number.isFinite(amountEur) ||
			amountEur <= 0 ||
			isNaN(paidAt.getTime())
		)
			return fail(400, { incomeError: m.err_payment_fields() });

		await db.insert(income).values({
			source: source as 'sponsorship' | 'grant' | 'other',
			payer,
			amountEur,
			paidAt,
			note,
			recordedBy: userId
		});
		return { adminOk: true };
	}
};
