import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { getMemberByUserId } from '$lib/server/members';

/**
 * The language switcher reports an explicit choice here. Only members who
 * have saved a forced language are updated: for everyone else the switch
 * stays a per-browser affair, exactly as before the preference existed.
 */
export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return new Response(null, { status: 204 });
	const target = (await request.text()).trim();
	if (target !== 'en' && target !== 'fi') return new Response(null, { status: 400 });
	const db = getDb(platform!.env.DB);
	const me = await getMemberByUserId(db, locals.user.id);
	if (me?.preferredLocale && me.preferredLocale !== target)
		await db.update(member).set({ preferredLocale: target }).where(eq(member.id, me.id));
	return new Response(null, { status: 204 });
};
