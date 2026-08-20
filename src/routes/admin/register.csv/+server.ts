import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { isBoard } from '$lib/server/members';
import { FEES } from '$lib/fees';

const csv = (rows: string[][]) =>
	rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')).join('\r\n');

const day = (d: Date) => d.toISOString().slice(0, 10);

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	if (!isBoard((locals.user as { role?: string }).role)) error(403, 'Board members only.');

	const db = getDb(platform!.env.DB);
	const members = await db.query.member.findMany({
		orderBy: (m, { asc }) => [asc(m.memberNumber), asc(m.fullName)]
	});
	const payments = await db.query.payment.findMany();

	/** Latest period end per member: what the treasurer needs to see at a glance. */
	const paidUntil = new Map<string, Date>();
	for (const p of payments) {
		const current = paidUntil.get(p.memberId);
		if (!current || p.periodEnd > current) paidUntil.set(p.memberId, p.periodEnd);
	}

	const now = new Date();
	const body = csv([
		[
			'Member no.',
			'Full name',
			'Home municipality',
			'Class',
			'Status',
			'Email',
			'Billing',
			'Fee EUR',
			'Paid until',
			'Payment',
			'Reference',
			'Mastodon',
			'Listed consent',
			'Public consent',
			'Applied',
			'Decided'
		],
		...members.map((m) => {
			const until = paidUntil.get(m.id);
			const covered = Boolean(until && until > now);
			const fee = FEES[m.memberClass][m.billingInterval === 'month' ? 'month' : 'year'];
			return [
				m.memberNumber ? String(m.memberNumber) : '',
				m.fullName,
				m.homeMunicipality,
				m.memberClass,
				m.status,
				m.email ?? '',
				m.billingInterval,
				String(fee),
				until ? day(until) : '',
				m.status === 'approved' ? (covered ? 'paid' : 'due') : '',
				m.viite ?? '',
				m.mastodonAcct ? `@${m.mastodonAcct}` : '',
				m.listedConsent ? 'yes' : 'no',
				m.publicConsent ? 'yes' : 'no',
				day(m.appliedAt),
				m.decidedAt ? day(m.decidedAt) : ''
			];
		})
	]);
	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="jasenluettelo.csv"'
		}
	});
};
