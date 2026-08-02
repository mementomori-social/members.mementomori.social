import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import type { Db } from '$lib/server/members';
import { member, payment } from '$lib/server/db/schema';

/**
 * Holvi transaction sync: incoming bank transfers are matched to members by
 * the Finnish reference number (viite) and written to the ledger, so bank
 * payments book themselves exactly like Stripe ones.
 *
 * Requires API access from Holvi (HOLVI_API_BASE, HOLVI_API_KEY,
 * HOLVI_POOL_HANDLE). The transaction field mapping below follows Holvi's
 * documented shape but MUST be verified against the real API on first run:
 * the sync logs unmatched and malformed entries instead of guessing.
 */
export const holviEnabled = () =>
	Boolean(env.HOLVI_API_BASE && env.HOLVI_API_KEY && env.HOLVI_POOL_HANDLE);

type HolviTx = {
	uuid?: string;
	id?: string;
	amount?: string | number;
	reference?: string;
	message?: string;
	timestamp?: string;
	value_date?: string;
};

export async function syncHolvi(db: Db): Promise<{ imported: number; unmatched: number }> {
	if (!holviEnabled()) return { imported: 0, unmatched: 0 };

	const url = `${env.HOLVI_API_BASE!.replace(/\/$/, '')}/pool/${env.HOLVI_POOL_HANDLE}/transactions/`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${env.HOLVI_API_KEY}` }
	});
	if (!res.ok) throw new Error(`Holvi API ${res.status}`);
	const body = (await res.json()) as { results?: HolviTx[] } | HolviTx[];
	const txs = Array.isArray(body) ? body : (body.results ?? []);

	let imported = 0;
	let unmatched = 0;
	for (const tx of txs) {
		const amount = Number(tx.amount);
		if (!Number.isFinite(amount) || amount <= 0) continue; // outgoing or malformed

		const reference = (tx.reference ?? tx.message ?? '').replaceAll(' ', '');
		const txId = tx.uuid ?? tx.id;
		if (!reference || !txId) {
			unmatched++;
			continue;
		}

		const m = await db.query.member.findFirst({ where: eq(member.viite, reference) });
		if (!m) {
			unmatched++;
			continue;
		}

		const ref = `holvi:${txId}`;
		const existing = await db.query.payment.findFirst({ where: eq(payment.reference, ref) });
		if (existing) continue;

		const paidAt = new Date(tx.timestamp ?? tx.value_date ?? Date.now());
		const periodStart = paidAt;
		const periodEnd = new Date(paidAt);
		if (m.billingInterval === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
		else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

		await db.insert(payment).values({
			memberId: m.id,
			amountEur: amount,
			method: 'bank',
			reference: ref,
			paidAt,
			periodStart,
			periodEnd
		});
		imported++;
	}
	return { imported, unmatched };
}
