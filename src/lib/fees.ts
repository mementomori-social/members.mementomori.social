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

/** Running costs per month, shown publicly as plain facts. UpCloud rows are
    list prices without VAT (730 h, plan, disks and IPv4), as the credit is
    charged; the rest include alv 25,5 %. Checked against the invoices and
    the UpCloud API on COSTS_UPDATED. */
export const COSTS_UPDATED = new Date(2026, 10, 14, 17);
export const COST_ITEMS = [
	{ key: 'mastodon', monthlyEur: 150.98, upcloud: true },
	{ key: 'postgresql', monthlyEur: 214.04, upcloud: true },
	{ key: 'elastic', monthlyEur: 90.89, upcloud: true },
	{ key: 'bastion', monthlyEur: 14.79, upcloud: true },
	{ key: 'cloudflare', monthlyEur: 40.16, upcloud: false },
	{ key: 'deepl', monthlyEur: 32.12, upcloud: false },
	{ key: 'domain', monthlyEur: 10.48, upcloud: false }
] as const;

const sumEur = (items: readonly { monthlyEur: number }[]) =>
	Math.round(items.reduce((sum, item) => sum + item.monthlyEur, 0) * 100) / 100;

const totalMonthlyEur = sumEur(COST_ITEMS);
const upcloudMonthlyEur = sumEur(COST_ITEMS.filter((item) => item.upcloud));

export const COSTS = {
	monthlyEur: totalMonthlyEur,
	annualEur: Math.round(totalMonthlyEur * 12)
} as const;

/** Bills before October 2026 were the Hetzner server rent alone. */
const PREVIOUS_MONTHLY_EUR = 204.15;
const ITEMISED_FROM_MONTH = 2026 * 12 + 9;
const monthCostEur = (year: number, month: number) =>
	year * 12 + month >= ITEMISED_FROM_MONTH ? COSTS.monthlyEur : PREVIOUS_MONTHLY_EUR;

/** UpCloud's sponsor credit pays the UpCloud servers only. The balance is
    read from the API on COSTS_UPDATED and run down at the server cost. */
export const UPCLOUD_CREDIT = { eur: 4034.5, expires: new Date(2027, 7, 25) };
const DAY_MS = 86_400_000;
const upcloudDailyEur = (upcloudMonthlyEur * 12) / 365;

export function upcloudCreditEur(now = new Date()) {
	if (now >= UPCLOUD_CREDIT.expires) return 0;
	const usedEur = ((now.getTime() - COSTS_UPDATED.getTime()) / DAY_MS) * upcloudDailyEur;
	return Math.max(0, UPCLOUD_CREDIT.eur - Math.max(0, usedEur));
}

/** The day the credit runs out or expires, whichever comes first. */
export function upcloudCreditEnd(now = new Date()) {
	const runsOut = now.getTime() + (upcloudCreditEur(now) / upcloudDailyEur) * DAY_MS;
	return new Date(Math.min(UPCLOUD_CREDIT.expires.getTime(), runsOut));
}

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
	const dailyEur = (COSTS.monthlyEur * 12) / 365;
	const thisYear = now.getFullYear();
	const monthsThisYear = now.getDate() >= 15 ? now.getMonth() + 1 : now.getMonth();
	const monthsTotal = (thisYear - FOUNDING_YEAR) * 12 + monthsThisYear;

	/** Cash in the association's own account, across years. */
	const available = all.fees + all.income;
	const creditEur = upcloudCreditEur(now);
	const creditEnd = upcloudCreditEnd(now).getTime();

	/** This calendar year's card: what the year's bills were covered with. */
	let billedEur = 0;
	let yearCostEur = 0;
	for (let month = 0; month < 12; month++) {
		yearCostEur += monthCostEur(thisYear, month);
		if (month < monthsThisYear) billedEur += monthCostEur(thisYear, month);
	}
	const members = year.fees;
	const support = year.income + Math.max(0, billedEur - year.fees - year.income);
	const total = members + support;
	const creditThisYearEur = Math.min(creditEur, upcloudMonthlyEur * (12 - monthsThisYear));
	const remaining = Math.max(
		0,
		Math.max(0, yearCostEur - billedEur) - available - creditThisYearEur
	);
	const upcoming = monthsThisYear < 12 ? monthCostEur(thisYear, monthsThisYear) : 0;

	/** Coverage runs from the next bill, extended by the days money buys.
	    While the credit lasts, the cash only pays the costs besides UpCloud.
	    Date() normalises month overflow, so this crosses year ends cleanly. */
	const nextBill = new Date(FOUNDING_YEAR, monthsTotal, 15);
	const runway = (incomeDailyEur: number) => {
		let cash = available;
		let t = nextBill.getTime();
		const burnWithCredit = dailyEur - upcloudDailyEur - incomeDailyEur;
		if (creditEnd > t) {
			const creditDays = (creditEnd - t) / DAY_MS;
			if (burnWithCredit > 0 && cash < burnWithCredit * creditDays)
				return new Date(t + (cash / burnWithCredit) * DAY_MS);
			cash -= burnWithCredit * creditDays;
			t = creditEnd;
		}
		const burn = dailyEur - incomeDailyEur;
		return burn > 0 ? new Date(t + (cash / burn) * DAY_MS) : null;
	};
	const coveredUntil = runway(0)!;
	const marginDays = Math.floor((coveredUntil.getTime() - now.getTime()) / DAY_MS);

	/** Estimate with card subscriptions renewing: monthly income slows the
	    burn. When it exceeds the cost, the estimate is open-ended (null). */
	const projectedUntil = runway((recurring.cardMonthlyEur * 12) / 365);

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
		yearCostEur,
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
