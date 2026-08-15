import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { getMemberByUserId, isBoard } from '$lib/server/members';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.user) return { user: null, member: null, board: false, openActions: 0 };
	const db = getDb(platform!.env.DB);
	const m = await getMemberByUserId(db, locals.user.id);
	const board = isBoard((locals.user as { role?: string }).role);
	const openActions = board
		? (await db.select({ id: member.id }).from(member).where(eq(member.status, 'applied'))).length
		: 0;
	return {
		user: { id: locals.user.id, name: locals.user.name, email: locals.user.email },
		member: m
			? {
					id: m.id,
					status: m.status,
					memberClass: m.memberClass,
					fullName: m.fullName,
					hasAvatar: Boolean(m.mastodonAvatarUrl)
				}
			: null,
		board,
		openActions
	};
};
