import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { isBoard } from '$lib/server/members';

const csv = (rows: string[][]) =>
	rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')).join('\r\n');

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	if (!isBoard((locals.user as { role?: string }).role)) error(403, 'Board members only.');

	const members = await getDb(platform!.env.DB).query.member.findMany({
		orderBy: (m, { asc }) => [asc(m.fullName)]
	});
	const body = csv([
		['Full name', 'Home municipality', 'Class', 'Status', 'Email', 'Applied', 'Decided'],
		...members.map((m) => [
			m.fullName,
			m.homeMunicipality,
			m.memberClass,
			m.status,
			m.email ?? '',
			m.appliedAt.toISOString().slice(0, 10),
			m.decidedAt ? m.decidedAt.toISOString().slice(0, 10) : ''
		])
	]);
	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="jasenluettelo.csv"'
		}
	});
};
