import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { isBoard } from '$lib/server/members';

const csv = (rows: string[][]) =>
	rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')).join('\r\n');

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	if (!isBoard((locals.user as { role?: string }).role)) error(403, 'Board members only.');

	const db = getDb(platform!.env.DB);
	const payments = await db.query.payment.findMany({
		orderBy: (p, { asc }) => [asc(p.paidAt)]
	});
	const members = await db.query.member.findMany();
	const nameById = new Map(members.map((m) => [m.id, m.fullName]));

	const body = csv([
		['Paid', 'Member', 'Amount EUR', 'Method', 'Reference', 'Period start', 'Period end'],
		...payments.map((p) => [
			p.paidAt.toISOString().slice(0, 10),
			nameById.get(p.memberId) ?? '?',
			p.amountEur.toFixed(2),
			p.method,
			p.reference ?? '',
			p.periodStart.toISOString().slice(0, 10),
			p.periodEnd.toISOString().slice(0, 10)
		])
	]);
	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="maksut.csv"'
		}
	});
};
