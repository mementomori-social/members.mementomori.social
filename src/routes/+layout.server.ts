import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getMemberByUserId, isBoard } from '$lib/server/members';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.user) return { user: null, member: null, board: false };
	const db = getDb(platform!.env.DB);
	const m = await getMemberByUserId(db, locals.user.id);
	return {
		user: { id: locals.user.id, name: locals.user.name, email: locals.user.email },
		member: m
			? { id: m.id, status: m.status, memberClass: m.memberClass, fullName: m.fullName }
			: null,
		board: isBoard((locals.user as { role?: string }).role)
	};
};
