import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';

/**
 * Local avatar proxy: the member list never hotlinks the Mastodon media host.
 * Cached at the edge (and by browsers) for a day.
 */
export const GET: RequestHandler = async ({ params, platform, setHeaders }) => {
	const db = getDb(platform!.env.DB);
	const m = await db.query.member.findFirst({
		where: eq(member.id, params.id),
		columns: { mastodonAvatarUrl: true, listedConsent: true }
	});
	if (!m?.mastodonAvatarUrl) error(404, 'No avatar');

	// The URL originates from the Mastodon API response, but never proxy
	// anything outside the instance's own hosts (SSRF guard).
	const allowedHosts = ['mementomori.social', 'media.mementomori.social'];
	let avatarUrl: URL;
	try {
		avatarUrl = new URL(m.mastodonAvatarUrl);
	} catch {
		error(404, 'No avatar');
	}
	if (avatarUrl.protocol !== 'https:' || !allowedHosts.includes(avatarUrl.hostname))
		error(404, 'No avatar');

	const upstream = await fetch(avatarUrl, {
		cf: { cacheEverything: true, cacheTtl: 86400 }
	} as RequestInit);
	if (!upstream.ok) error(502, 'Avatar fetch failed');

	setHeaders({
		'content-type': upstream.headers.get('content-type') ?? 'image/png',
		'cache-control': 'public, max-age=86400'
	});
	return new Response(upstream.body);
};
