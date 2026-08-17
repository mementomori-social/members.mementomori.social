import { and, eq, gte, sum } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { income, member, payment } from '$lib/server/db/schema';
import { FEES } from '$lib/fees';

export const BOARD_ROLES = ['board', 'vice', 'chair'] as const;
export const isBoard = (role?: string) => BOARD_ROLES.includes(role as never);

export type Db = ReturnType<typeof getDb>;

export const getMemberByUserId = (db: Db, userId: string) =>
	db.query.member.findFirst({ where: eq(member.userId, userId) });

/** Sum of membership payments received during the current calendar year. */
export async function collectedThisYearEur(db: Db): Promise<{ fees: number; income: number }> {
	const yearStart = new Date(new Date().getFullYear(), 0, 1);
	const fees = await db
		.select({ total: sum(payment.amountEur) })
		.from(payment)
		.where(gte(payment.paidAt, yearStart));
	const other = await db
		.select({ total: sum(income.amountEur) })
		.from(income)
		.where(gte(income.paidAt, yearStart));
	return { fees: Number(fees[0]?.total ?? 0), income: Number(other[0]?.total ?? 0) };
}

/**
 * Members whose fee is currently paid, by schedule. Bank transfers count the
 * same as cards here: the money is in the account either way. Only the future
 * projection separates them, because a card renews itself and a transfer does
 * not.
 */
export async function recurringSummary(db: Db) {
	const rows = await db.query.member.findMany({
		where: eq(member.status, 'approved'),
		columns: { id: true, billingInterval: true, memberClass: true, stripeSubscriptionId: true }
	});
	const payments = await db
		.select({ memberId: payment.memberId, periodEnd: payment.periodEnd })
		.from(payment);
	const coveredUntil = new Map<string, number>();
	for (const p of payments) {
		const end = p.periodEnd.getTime();
		if (end > (coveredUntil.get(p.memberId) ?? 0)) coveredUntil.set(p.memberId, end);
	}

	const now = Date.now();
	let monthlyCount = 0;
	let monthlyEur = 0;
	let yearlyCount = 0;
	let yearlyEur = 0;
	let cardMonthlyEur = 0;
	let cardYearlyEur = 0;
	for (const r of rows) {
		if ((coveredUntil.get(r.id) ?? 0) <= now) continue;
		const card = Boolean(r.stripeSubscriptionId);
		if (r.billingInterval === 'month') {
			monthlyCount++;
			monthlyEur += FEES[r.memberClass].month;
			if (card) cardMonthlyEur += FEES[r.memberClass].month;
		} else {
			yearlyCount++;
			yearlyEur += FEES[r.memberClass].year;
			if (card) cardYearlyEur += FEES[r.memberClass].year;
		}
	}
	return {
		monthlyCount,
		monthlyEur,
		yearlyCount,
		yearlyEur,
		cardMonthlyEur,
		cardYearlyEur
	};
}

/** Everything ever collected; the coverage balance must survive New Year. */
export async function collectedTotalEur(db: Db): Promise<{ fees: number; income: number }> {
	const fees = await db.select({ total: sum(payment.amountEur) }).from(payment);
	const other = await db.select({ total: sum(income.amountEur) }).from(income);
	return { fees: Number(fees[0]?.total ?? 0), income: Number(other[0]?.total ?? 0) };
}

export const approvedMemberCount = async (db: Db) =>
	(await db.select({ id: member.id }).from(member).where(eq(member.status, 'approved'))).length;

export const publicMembers = (db: Db) =>
	db.query.member.findMany({
		where: and(eq(member.status, 'approved'), eq(member.publicConsent, true)),
		columns: {
			id: true,
			fullName: true,
			displayName: true,
			mastodonAcct: true,
			mastodonAvatarUrl: true
		},
		orderBy: (m, { desc }) => [desc(m.appliedAt)]
	});

export const listedMembers = (db: Db) =>
	db.query.member.findMany({
		where: and(eq(member.status, 'approved'), eq(member.listedConsent, true)),
		columns: {
			id: true,
			fullName: true,
			displayName: true,
			homeMunicipality: true,
			memberClass: true,
			mastodonAcct: true,
			mastodonAvatarUrl: true
		},
		orderBy: (m, { desc }) => [desc(m.appliedAt)]
	});
