import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getMemberByUserId, isBoard, listedMembers, publicMembers } from '$lib/server/members';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDb(platform!.env.DB);
	if (locals.user) {
		const me = await getMemberByUserId(db, locals.user.id);
		const board = isBoard((locals.user as { role?: string }).role);
		if (board || me?.status === 'approved') {
			const rows = await listedMembers(db);
			return {
				publicOnly: false,
				members: rows.map((r) => ({ ...r }))
			};
		}
	}
	// Public view: only members who separately consented to a public listing.
	const rows = await publicMembers(db);
	return {
		publicOnly: true,
		members: rows.map((r) => ({
			...r,
			homeMunicipality: null as string | null,
			memberClass: null as 'member' | 'supporting' | null
		}))
	};
};
