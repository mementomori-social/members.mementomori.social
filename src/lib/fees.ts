/**
 * Membership fees as decided by the association meeting on 21 July 2026.
 * Fees are fixed; the monthly figure is an instalment of the annual fee,
 * never a separate price and never freely chooseable.
 */
export const FEES = {
	member: { year: 60, month: 5, label: 'Member' },
	supporting: { year: 600, month: 50, label: 'Patron' }
} as const;

export type MemberClass = keyof typeof FEES;

/** Running costs, shown publicly as plain facts. */
export const COSTS = {
	monthlyEur: 204.15,
	annualEur: 2450
} as const;

/**
 * Yearly cost coverage. The infrastructure bill lands on the 15th each month
 * and the sponsor has paid every one directly so far, so months up to the
 * current bill count as covered even before they flow through the books.
 */
export function coverage(fees: number, income: number, now = new Date()) {
	const monthsPaid = now.getDate() >= 15 ? now.getMonth() + 1 : now.getMonth();
	/** Fees paid by members: grows as the membership grows. */
	const members = fees;
	/**
	 * Everything else keeping the lights on: recorded sponsorship income plus
	 * the transitional share of bills the sponsor has paid directly. As
	 * invoiced income catches up with the bills, the transitional share
	 * shrinks to zero by itself.
	 */
	const support = income + Math.max(0, monthsPaid * COSTS.monthlyEur - fees - income);
	const total = members + support;
	/** The next monthly bill, still ahead of us this year. */
	const upcoming = monthsPaid < 12 ? COSTS.monthlyEur : 0;
	/**
	 * Bills land on the 15th; each covered bill keeps the servers running
	 * until the next one. Money beyond the passed bills extends the date.
	 */
	const monthsCovered = Math.floor(total / COSTS.monthlyEur);
	const coveredUntil = new Date(now.getFullYear(), monthsCovered, 15);
	const marginDays = Math.floor((coveredUntil.getTime() - now.getTime()) / 86_400_000);
	/** Positions on a January-December track, for the timeline bar. */
	const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
	const yearEnd = new Date(now.getFullYear() + 1, 0, 1).getTime();
	const pct = (t: number) =>
		Math.max(0, Math.min(100, ((t - yearStart) / (yearEnd - yearStart)) * 100));
	return {
		members,
		support,
		total,
		upcoming,
		coveredUntil,
		marginDays,
		coveredPct: pct(coveredUntil.getTime()),
		todayPct: pct(now.getTime())
	};
}
