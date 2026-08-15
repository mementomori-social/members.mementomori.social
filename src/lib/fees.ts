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
	return { members, support, total, upcoming };
}
