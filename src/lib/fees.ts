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
 * Cost coverage, day by day. Bills land on the 15th of each month. Bills
 * already passed were paid by the sponsor straight to the provider, so the
 * money collected from members has not been spent: it buys days beyond the
 * next bill, and every payment moves the date.
 */
export function coverage(fees: number, income: number, now = new Date(), recurringMonthlyEur = 0) {
	const dailyEur = COSTS.annualEur / 365;
	/** Bills already issued this year, this month's included once it lands. */
	const monthsBilled = now.getDate() >= 15 ? now.getMonth() + 1 : now.getMonth();
	const billedSoFar = monthsBilled * COSTS.monthlyEur;

	/** Money in the association's own account, all of it still unspent. */
	const available = fees + income;
	/** Past bills settled outside the account; shrinks as real income lands. */
	const sponsorDirect = Math.max(0, billedSoFar - available);

	const members = fees;
	const support = income + sponsorDirect;
	const total = members + support;

	/** Bills still ahead this year, and what is not yet funded of them. */
	const remainingBills = Math.max(0, COSTS.annualEur - billedSoFar);
	const remaining = Math.max(0, remainingBills - available);
	const upcoming = monthsBilled < 12 ? COSTS.monthlyEur : 0;

	/** Coverage runs from the next bill, extended by the days money buys. */
	const nextBill = new Date(now.getFullYear(), monthsBilled, 15);
	const coveredUntil = new Date(nextBill.getTime() + (available / dailyEur) * 86_400_000);
	const marginDays = Math.floor((coveredUntil.getTime() - now.getTime()) / 86_400_000);

	/**
	 * Estimate with card subscriptions renewing: monthly income slows the burn.
	 * When it exceeds the cost, the money never runs out and the estimate is
	 * open-ended (null).
	 */
	const dailyRecurring = (recurringMonthlyEur * 12) / 365;
	const projectedUntil =
		dailyEur > dailyRecurring
			? new Date(nextBill.getTime() + (available / (dailyEur - dailyRecurring)) * 86_400_000)
			: null;

	/** Positions on a January-December track, for the timeline bar. */
	const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
	const yearEnd = new Date(now.getFullYear() + 1, 0, 1).getTime();
	const pct = (t: number) =>
		Math.max(0, Math.min(100, ((t - yearStart) / (yearEnd - yearStart)) * 100));
	return {
		members,
		support,
		total,
		available,
		remaining,
		upcoming,
		coveredUntil,
		marginDays,
		projectedUntil,
		projectedPct: projectedUntil ? pct(projectedUntil.getTime()) : 100,
		coveredPct: pct(coveredUntil.getTime()),
		todayPct: pct(now.getTime())
	};
}
