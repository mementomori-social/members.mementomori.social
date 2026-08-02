import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { exchangeCode, fetchProfile } from '$lib/server/mastodon-oauth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const stored = cookies.get('join_masto_oauth');
	cookies.delete('join_masto_oauth', { path: '/join' });
	if (!stored) redirect(303, '/join');

	const { state, verifier } = JSON.parse(stored) as { state: string; verifier: string };
	if (url.searchParams.get('state') !== state) error(400, 'OAuth state mismatch.');
	const code = url.searchParams.get('code');
	if (!code) redirect(303, '/join'); // user cancelled on Mastodon

	const { access_token } = await exchangeCode(
		`${url.origin}/join/mastodon/callback`,
		code,
		verifier
	);
	const profile = await fetchProfile(access_token);

	cookies.set('join_masto', JSON.stringify({ ...profile, accessToken: access_token }), {
		path: '/join',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 1800
	});
	redirect(303, '/join?path=mastodon');
};
