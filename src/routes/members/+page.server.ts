import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getMemberByUserId, isBoard, listedMembers } from '$lib/server/members';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	const me = await getMemberByUserId(db, locals.user.id);
	const board = isBoard((locals.user as { role?: string }).role);
	if (!board && me?.status !== 'approved')
		error(403, 'The member list is visible to approved members.');
	return { members: await listedMembers(db) };
};
