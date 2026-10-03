import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lookupAccount } from '$lib/server/mastodon';
import { currentAvatarUrl, fetchAvatar } from '$lib/server/avatar';

/**
 * Same-origin proxy for the board members' avatars: the CSP allows only
 * 'self' for images, and hotlinking the media host would bypass it anyway.
 * Only the three board accounts are ever proxied.
 */
const BOARD_ACCTS = ['rolle', 'mustikkasoppa', 'ikkeT'];

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	if (!BOARD_ACCTS.includes(params.acct)) error(404, 'Unknown account');

	const upstream =
		(await fetchAvatar((await lookupAccount(params.acct))?.avatar)) ??
		(await fetchAvatar(await currentAvatarUrl(params.acct)));
	if (!upstream) error(502, 'Avatar fetch failed');

	setHeaders({
		'content-type': upstream.headers.get('content-type') ?? 'image/png',
		'cache-control': 'public, max-age=86400'
	});
	return new Response(upstream.body);
};
