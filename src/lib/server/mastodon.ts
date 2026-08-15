const INSTANCE = 'https://mementomori.social';

export type MastodonProfile = {
	acct: string;
	displayName: string;
	avatar: string | null;
	url: string;
	bio: string;
};

/** Mastodon returns the bio as HTML; only the text is ever rendered. */
const toText = (html: string) =>
	html
		.replace(/<br\s*\/?>|<\/p>/gi, ' ')
		.replace(/<[^>]*>/g, '')
		.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, e) =>
			({ nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e as string] ?? ' '
		)
		.replace(/\s+/g, ' ')
		.trim();

/**
 * Public profile of an account on our own instance. Cached at the edge for a
 * day: display names and avatars change rarely and this runs on page load.
 */
export async function lookupAccount(acct: string): Promise<MastodonProfile | null> {
	try {
		const res = await fetch(`${INSTANCE}/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`, {
			cf: { cacheEverything: true, cacheTtl: 86400 }
		} as RequestInit);
		if (!res.ok) return null;
		const p = (await res.json()) as {
			acct?: string;
			display_name?: string;
			avatar_static?: string;
			avatar?: string;
			url?: string;
			note?: string;
		};
		return {
			acct: p.acct || acct,
			displayName: p.display_name || acct,
			avatar: p.avatar_static || p.avatar || null,
			url: p.url || `${INSTANCE}/@${acct}`,
			bio: p.note ? toText(p.note) : ''
		};
	} catch {
		return null;
	}
}
