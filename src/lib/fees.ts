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
 * Cost coverage, day by day. Bills land on the 15th of each month and are
 * counted from the founding year, so the balance carries over New Year
 * instead of resetting. Money collected is treated as unspent: past bills
 * were settled by the sponsor directly.
 */
export function coverage(
	all: { fees: number; income: number },
	year: { fees: number; income: number },
	now = new Date(),
	recurring = { monthlyEur: 0, yearlyEur: 0, cardMonthlyEur: 0, cardYearlyEur: 0 }
) {
	const FOUNDING_YEAR = 2026;
	const dailyEur = COSTS.annualEur / 365;
	const monthsThisYear = now.getDate() >= 15 ? now.getMonth() + 1 : now.getMonth();
	const monthsTotal = (now.getFullYear() - FOUNDING_YEAR) * 12 + monthsThisYear;

	/** Cash in the association's own account, across years. */
	const available = all.fees + all.income;

	/** This calendar year's card: what the year's bills were covered with. */
	const members = year.fees;
	const support =
		year.income + Math.max(0, monthsThisYear * COSTS.monthlyEur - year.fees - year.income);
	const total = members + support;
	const remaining = Math.max(
		0,
		Math.max(0, COSTS.annualEur - monthsThisYear * COSTS.monthlyEur) - available
	);
	const upcoming = monthsThisYear < 12 ? COSTS.monthlyEur : 0;

	/** Coverage runs from the next bill, extended by the days money buys.
	    Date() normalises month overflow, so this crosses year ends cleanly. */
	const nextBill = new Date(FOUNDING_YEAR, monthsTotal, 15);
	const coveredUntil = new Date(nextBill.getTime() + (available / dailyEur) * 86_400_000);
	const marginDays = Math.floor((coveredUntil.getTime() - now.getTime()) / 86_400_000);

	/** Estimate with card subscriptions renewing: monthly income slows the
	    burn. When it exceeds the cost, the estimate is open-ended (null). */
	const dailyRecurring = (recurring.cardMonthlyEur * 12) / 365;
	const projectedUntil =
		dailyEur > dailyRecurring
			? new Date(nextBill.getTime() + (available / (dailyEur - dailyRecurring)) * 86_400_000)
			: null;

	/** One month, steady state: yearly fees spread across twelve months. */
	const monthlyRecurringEur = recurring.monthlyEur + recurring.yearlyEur / 12;
	const monthlyGapEur = Math.max(0, COSTS.monthlyEur - monthlyRecurringEur);
	/** How much of the monthly bill the fees carry on their own. */
	const selfSufficiencyPct = Math.round((monthlyRecurringEur / COSTS.monthlyEur) * 100);
	/** Ordinary members needed to reach the full bill, at the member fee. */
	const membersNeeded = Math.ceil(monthlyGapEur / FEES.member.month);

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
		monthlyRecurringEur,
		monthlyGapEur,
		selfSufficiencyPct,
		membersNeeded,
		coveredPct: pct(coveredUntil.getTime()),
		todayPct: pct(now.getTime())
	};
}
