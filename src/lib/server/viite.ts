import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/members';
import { member } from '$lib/server/db/schema';

/**
 * Finnish bank reference number (viitenumero): base digits plus a 7-3-1
 * check digit. Matching incoming transfers to members happens on this.
 */
export const viiteCheckDigit = (base: string) => {
	const weights = [7, 3, 1];
	let sum = 0;
	[...base].reverse().forEach((ch, i) => {
		sum += Number(ch) * weights[i % 3];
	});
	return String((10 - (sum % 10)) % 10);
};

export const formatViite = (v: string) => v.replace(/(\d{5})(?=\d)/g, '$1 ').trim();

/** Generate a unique viite for a member, retrying on the unique constraint. */
export async function assignViite(db: Db, memberId: string): Promise<string> {
	for (let attempt = 0; attempt < 10; attempt++) {
		const base = String(Math.floor(1000000 + Math.random() * 9000000));
		const viite = base + viiteCheckDigit(base);
		const clash = await db.query.member.findFirst({
			where: eq(member.viite, viite),
			columns: { id: true }
		});
		if (clash) continue;
		await db.update(member).set({ viite }).where(eq(member.id, memberId));
		return viite;
	}
	throw new Error('Could not generate a unique reference number');
}
