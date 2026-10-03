import { lookupAccount } from './mastodon';

const ALLOWED_HOSTS = ['mementomori.social', 'media.mementomori.social'];
const IMAGE_TTL = 86400;

/** Fetches an avatar image, never from outside the instance's own hosts (SSRF guard). */
export async function fetchAvatar(raw: string | null | undefined): Promise<Response | null> {
	if (!raw) {
		return null;
	}

	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		return null;
	}
	if (url.protocol !== 'https:' || !ALLOWED_HOSTS.includes(url.hostname)) {
		return null;
	}

	const res = await fetch(url, {
		cf: { cacheEverything: true, cacheTtl: IMAGE_TTL }
	} as RequestInit);
	return res.ok ? res : null;
}

/** Mastodon deletes the old image when an avatar changes, so ask for the current one. */
export async function currentAvatarUrl(acct: string): Promise<string | null> {
	return (await lookupAccount(acct, 'fresh'))?.avatar ?? null;
}
