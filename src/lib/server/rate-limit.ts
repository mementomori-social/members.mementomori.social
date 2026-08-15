import { eq, lt } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { rateLimit } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;
type Entry = { key: string; count: number; lastRequest: number };

/** Counters older than this are dead weight: every rule window is shorter. */
const PRUNE_AFTER_MS = 3_600_000;

/**
 * D1-backed store for Better Auth's rate limiter. The in-memory default counts
 * per isolate, and Workers spread requests across isolates, so a flood from one
 * client would mostly slip through.
 */
export const rateLimitStorage = (db: Db) => ({
	async get(key: string): Promise<Entry | null> {
		const row = await db.query.rateLimit.findFirst({ where: eq(rateLimit.key, key) });
		return row ? { key: row.key, count: row.count, lastRequest: row.lastRequest } : null;
	},

	async set(key: string, value: Entry): Promise<void> {
		await db
			.insert(rateLimit)
			.values({ key, count: value.count, lastRequest: value.lastRequest })
			.onConflictDoUpdate({
				target: rateLimit.key,
				set: { count: value.count, lastRequest: value.lastRequest }
			});
		if (value.count <= 1) {
			await db.delete(rateLimit).where(lt(rateLimit.lastRequest, Date.now() - PRUNE_AFTER_MS));
		}
	}
});

/**
 * Limiter for form actions that send email. Better Auth only rate-limits its
 * own HTTP routes, and the join flow calls `auth.api.signInMagicLink` directly,
 * which never passes through that check.
 */
export async function tooManyRequests(
	db: Db,
	key: string,
	{ window, max }: { window: number; max: number }
): Promise<boolean> {
	const now = Date.now();
	const row = await db.query.rateLimit.findFirst({ where: eq(rateLimit.key, key) });
	const fresh = !row || now - row.lastRequest > window * 1000;
	const count = fresh ? 1 : row.count + 1;
	if (!fresh && row.count >= max) return true;
	await db
		.insert(rateLimit)
		.values({ key, count, lastRequest: fresh ? now : row.lastRequest })
		.onConflictDoUpdate({
			target: rateLimit.key,
			set: { count, lastRequest: fresh ? now : row.lastRequest }
		});
	return false;
}
