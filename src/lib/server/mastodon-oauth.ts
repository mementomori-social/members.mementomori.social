import { env } from '$env/dynamic/private';

/**
 * Minimal OAuth 2.0 + PKCE handshake against mementomori.social for the
 * Mastodon-first join path. This is separate from Better Auth on purpose:
 * Mastodon never returns an email address, so it cannot create an account,
 * only verify one. The verified profile is attached at account creation.
 */
const BASE = 'https://mementomori.social';

const b64url = (bytes: Uint8Array) =>
	btoa(String.fromCharCode(...bytes))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replace(/=+$/, '');

export const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)));

export const pkceChallenge = async (verifier: string) =>
	b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));

export const authorizeUrl = (redirectUri: string, state: string, challenge: string) => {
	const u = new URL(`${BASE}/oauth/authorize`);
	u.searchParams.set('response_type', 'code');
	u.searchParams.set('client_id', env.MASTODON_CLIENT_ID ?? '');
	u.searchParams.set('redirect_uri', redirectUri);
	u.searchParams.set('scope', 'profile');
	u.searchParams.set('state', state);
	u.searchParams.set('code_challenge', challenge);
	u.searchParams.set('code_challenge_method', 'S256');
	return u.toString();
};

export async function exchangeCode(redirectUri: string, code: string, verifier: string) {
	const res = await fetch(`${BASE}/oauth/token`, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: env.MASTODON_CLIENT_ID ?? '',
			client_secret: env.MASTODON_CLIENT_SECRET ?? '',
			redirect_uri: redirectUri,
			code,
			code_verifier: verifier
		})
	});
	if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
	return (await res.json()) as { access_token: string };
}

export async function fetchProfile(accessToken: string) {
	const res = await fetch(`${BASE}/api/v1/accounts/verify_credentials`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error(`verify_credentials failed: ${res.status}`);
	const p = (await res.json()) as {
		id: string;
		acct: string;
		display_name?: string;
		avatar?: string;
		avatar_static?: string;
	};
	return {
		accountId: p.id,
		acct: p.acct,
		name: p.display_name || p.acct,
		avatar: p.avatar_static || p.avatar || null
	};
}

export type PendingMastodon = Awaited<ReturnType<typeof fetchProfile>> & { accessToken: string };
