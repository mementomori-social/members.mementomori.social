import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { isBoard } from '$lib/server/members';
import { currentAvatarUrl, fetchAvatar } from '$lib/server/avatar';

/**
 * Local avatar proxy: the member list never hotlinks the Mastodon media host.
 * Cached at the edge (and by browsers) for a day.
 */
export const GET: RequestHandler = async ({ params, platform, locals, setHeaders }) => {
	const db = getDb(platform!.env.DB);
	const m = await db.query.member.findFirst({
		where: eq(member.id, params.id),
		columns: {
			mastodonAvatarUrl: true,
			mastodonAcct: true,
			listedConsent: true,
			publicConsent: true,
			userId: true
		}
	});
	if (!m?.mastodonAvatarUrl) error(404, 'No avatar');

	// The avatar is only served where the member chose to be visible; their own
	// top bar and the board still work, but without shared caching.
	const consented = m.listedConsent || m.publicConsent;
	const self = Boolean(locals.user && m.userId === locals.user.id);
	const board = isBoard((locals.user as { role?: string } | undefined)?.role);
	if (!consented && !self && !board) error(404, 'No avatar');
	const cacheable = consented;

	let upstream = await fetchAvatar(m.mastodonAvatarUrl);
	if (!upstream && m.mastodonAcct) {
		const current = await currentAvatarUrl(m.mastodonAcct);
		if (current && current !== m.mastodonAvatarUrl) {
			await db.update(member).set({ mastodonAvatarUrl: current }).where(eq(member.id, params.id));
			upstream = await fetchAvatar(current);
		}
	}
	if (!upstream) error(502, 'Avatar fetch failed');

	setHeaders({
		'content-type': upstream.headers.get('content-type') ?? 'image/png',
		'cache-control': cacheable ? 'public, max-age=86400' : 'private, max-age=0'
	});
	return new Response(upstream.body);
};
