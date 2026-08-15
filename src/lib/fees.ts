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
	const collected = fees + income;
	const sponsorDirect = Math.max(0, monthsPaid * COSTS.monthlyEur - collected);
	const total = collected + sponsorDirect;
	/** The bill paid in the current month, shown as its own segment. */
	const currentMonth = now.getDate() >= 15 ? Math.min(COSTS.monthlyEur, total) : 0;
	const earlier = Math.max(0, total - currentMonth);
	/** The next monthly bill, still ahead of us this year. */
	const upcoming = monthsPaid < 12 ? COSTS.monthlyEur : 0;
	return { collected, sponsorDirect, total, earlier, currentMonth, upcoming };
}
