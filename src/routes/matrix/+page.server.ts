import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { getMemberByUserId, isBoard } from '$lib/server/members';
import { m } from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	const me = await getMemberByUserId(db, locals.user.id);
	const board = isBoard((locals.user as { role?: string }).role);
	if (!me && !board) redirect(303, '/join');
	if (!board && me?.status !== 'approved' && me?.status !== 'applied') error(403, 'Members only.');
	return { matrixId: me?.matrixId ?? '', approved: me?.status === 'approved' };
};

export const actions: Actions = {
	saveMatrix: async ({ request, locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const me = await getMemberByUserId(db, locals.user.id);
		if (!me) redirect(303, '/join');

		const matrixId = String((await request.formData()).get('matrixId') ?? '').trim();
		// @localpart:server.tld, permissive on localpart, requires a dotted server
		if (matrixId && !/^@[^\s:@]+:[^\s:@]+\.[^\s:@]+$/.test(matrixId))
			return fail(400, { matrixError: m.matrix_id_invalid() });

		await db
			.update(member)
			.set({ matrixId: matrixId || null })
			.where(eq(member.id, me.id));
		return { matrixSaved: true, cleared: !matrixId };
	}
};
