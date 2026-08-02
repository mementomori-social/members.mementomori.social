import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authorizeUrl, pkceChallenge, randomToken } from '$lib/server/mastodon-oauth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const state = randomToken();
	const verifier = randomToken();
	cookies.set('join_masto_oauth', JSON.stringify({ state, verifier }), {
		path: '/join',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 600
	});
	const redirectUri = `${url.origin}/join/mastodon/callback`;
	redirect(302, authorizeUrl(redirectUri, state, await pkceChallenge(verifier)));
};
