import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authorizeUrl, pkceChallenge, randomToken } from '$lib/server/mastodon-oauth';
import { getLocale } from '$lib/paraglide/runtime';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const state = randomToken();
	const verifier = randomToken();
	// The locale survives the OAuth round trip via the state cookie.
	cookies.set('join_masto_oauth', JSON.stringify({ state, verifier, locale: getLocale() }), {
		path: '/join',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 600
	});
	const redirectUri = `${url.origin}/join/mastodon/callback`;
	redirect(302, authorizeUrl(redirectUri, state, await pkceChallenge(verifier)));
};
