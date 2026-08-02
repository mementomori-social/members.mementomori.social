/**
 * Membership fees as decided by the association meeting on 21 July 2026.
 * Fees are fixed; the monthly figure is an instalment of the annual fee,
 * never a separate price and never freely chooseable.
 */
export const FEES = {
	member: { year: 60, month: 5, label: 'Member' },
	supporting: { year: 600, month: 50, label: 'Supporting member' }
} as const;

export type MemberClass = keyof typeof FEES;

/** Running costs, shown publicly as plain facts. */
export const COSTS = {
	monthlyEur: 204.15,
	annualEur: 2450
} as const;
