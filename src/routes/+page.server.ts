import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approvedMemberCount, collectedThisYearEur } from '$lib/server/members';

export const load: PageServerLoad = async ({ platform, locals }) => {
	const db = getDb(platform!.env.DB);
	return {
		memberCount: await approvedMemberCount(db),
		// The coverage figure is only sent to signed-in members: members are not
		// "the public" under rahankeräyslaki, the general audience is.
		collected: locals.user ? await collectedThisYearEur(db) : null
	};
};
