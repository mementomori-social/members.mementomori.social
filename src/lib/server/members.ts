import { and, eq, gte, sum } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { member, payment } from '$lib/server/db/schema';

export const BOARD_ROLES = ['board', 'vice', 'chair'] as const;
export const isBoard = (role?: string) => BOARD_ROLES.includes(role as never);

export type Db = ReturnType<typeof getDb>;

export const getMemberByUserId = (db: Db, userId: string) =>
	db.query.member.findFirst({ where: eq(member.userId, userId) });

/** Sum of membership payments received during the current calendar year. */
export async function collectedThisYearEur(db: Db): Promise<number> {
	const yearStart = new Date(new Date().getFullYear(), 0, 1);
	const rows = await db
		.select({ total: sum(payment.amountEur) })
		.from(payment)
		.where(gte(payment.paidAt, yearStart));
	return Number(rows[0]?.total ?? 0);
}

export const approvedMemberCount = async (db: Db) =>
	(await db.select({ id: member.id }).from(member).where(eq(member.status, 'approved'))).length;

export const listedMembers = (db: Db) =>
	db.query.member.findMany({
		where: and(eq(member.status, 'approved'), eq(member.listedConsent, true)),
		columns: {
			id: true,
			fullName: true,
			homeMunicipality: true,
			memberClass: true,
			mastodonAcct: true,
			mastodonAvatarUrl: true
		},
		orderBy: (m, { asc }) => [asc(m.fullName)]
	});
