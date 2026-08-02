import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Same-origin proxy for the board members' avatars: the CSP allows only
 * 'self' for images, and hotlinking the media host would bypass it anyway.
 * Only the three board accounts are ever proxied.
 */
const BOARD_ACCTS = ['rolle', 'mustikkasoppa', 'ikkeT'];
const ALLOWED_HOSTS = ['mementomori.social', 'media.mementomori.social'];

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	if (!BOARD_ACCTS.includes(params.acct)) error(404, 'Unknown account');

	const res = await fetch(`https://mementomori.social/api/v1/accounts/lookup?acct=${params.acct}`, {
		cf: { cacheEverything: true, cacheTtl: 86400 }
	} as RequestInit);
	if (!res.ok) error(502, 'Lookup failed');
	const profile = (await res.json()) as { avatar_static?: string; avatar?: string };

	const raw = profile.avatar_static || profile.avatar;
	if (!raw) error(404, 'No avatar');
	let avatarUrl: URL;
	try {
		avatarUrl = new URL(raw);
	} catch {
		error(404, 'No avatar');
	}
	if (avatarUrl.protocol !== 'https:' || !ALLOWED_HOSTS.includes(avatarUrl.hostname))
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
