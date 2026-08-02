import type { PageServerLoad } from './$types';

/**
 * Board contacts. Names and avatars come live from the instance API with a
 * day of edge caching; roles and role-alias emails are static. Only public
 * information appears here: the accounts, the role addresses.
 */
const BOARD = [
	{ acct: 'rolle', role: 'chair', email: 'admin@mementomori.social' },
	{ acct: 'mustikkasoppa', role: 'secretary', email: 'sihteeri@mementomori.social' },
	{ acct: 'ikkeT', role: 'treasurer', email: 'rahastonhoitaja@mementomori.social' }
] as const;

type Profile = {
	acct: string;
	role: (typeof BOARD)[number]['role'];
	email: string;
	displayName: string;
	avatar: string | null;
	url: string;
};

export const load: PageServerLoad = async () => {
	const board: Profile[] = await Promise.all(
		BOARD.map(async (b) => {
			try {
				const res = await fetch(
					`https://mementomori.social/api/v1/accounts/lookup?acct=${b.acct}`,
					{ cf: { cacheEverything: true, cacheTtl: 86400 } } as RequestInit
				);
				if (!res.ok) throw new Error(String(res.status));
				const p = (await res.json()) as {
					display_name?: string;
					avatar_static?: string;
					avatar?: string;
					url?: string;
				};
				return {
					...b,
					displayName: p.display_name || b.acct,
					avatar: p.avatar_static || p.avatar || null,
					url: p.url || `https://mementomori.social/@${b.acct}`
				};
			} catch {
				return {
					...b,
					displayName: b.acct,
					avatar: null,
					url: `https://mementomori.social/@${b.acct}`
				};
			}
		})
	);
	return { board };
};
