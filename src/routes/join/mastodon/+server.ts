import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authorizeUrl, pkceChallenge, randomToken } from '$lib/server/mastodon-oauth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const state = randomToken();
	const verifier = randomToken();
	// The locale survives the OAuth round trip via the state cookie. It is read
	// from the path rather than the runtime: this endpoint answers both
	// /join/mastodon and /fi/join/mastodon, and the user must come back to the
	// language they started in.
	const locale = url.pathname.startsWith('/fi/') ? 'fi' : 'en';
	cookies.set('join_masto_oauth', JSON.stringify({ state, verifier, locale }), {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 600
	});
	const redirectUri = `${url.origin}/join/mastodon/callback`;
	redirect(302, authorizeUrl(redirectUri, state, await pkceChallenge(verifier)));
};
