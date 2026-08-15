import { redirect } from '@sveltejs/kit';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { approvedMemberCount, collectedThisYearEur } from '$lib/server/members';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// The front page is the pitch; a signed-in member's home is their own page.
	if (locals.user) redirect(303, getLocale() === 'fi' ? '/fi/dashboard' : '/dashboard');
	const db = getDb(platform!.env.DB);
	return {
		memberCount: await approvedMemberCount(db),
		// The coverage figure is only sent to signed-in members: members are not
		// "the public" under rahankeräyslaki, the general audience is.
		collected: locals.user ? await collectedThisYearEur(db) : null
	};
};
