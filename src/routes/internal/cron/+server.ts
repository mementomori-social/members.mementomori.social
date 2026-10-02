import { error, json } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email';
import { syncHolvi, holviEnabled } from '$lib/server/holvi';
import { boardMessage, notifyBoard } from '$lib/server/notify';
import { FEES } from '$lib/fees';
import type Stripe from 'stripe';
import { getStripe, stripeEnabled } from '$lib/server/stripe';
import type { Db } from '$lib/server/members';

const DAY = 86_400_000;
/** Remind 14 days before the period ends, then every 14 days while unpaid. */
const REMIND_AHEAD = 14 * DAY;
const REMIND_INTERVAL = 14 * DAY;
/** Bank transfers land a few days either side of the period end. */
const GRACE = 7 * DAY;

/**
 * Daily automation. Trigger from any scheduler:
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" .../internal/cron
 *
 * Jobs: Holvi bank-transfer import, payment reminders for bank payers
 * (Stripe subscriptions renew themselves), and an overdue summary to the
 * board. Memberships are never ended automatically: the rules have no
 * clause for that, so ending one is a board decision.
 */
/**
 * A card subscription only stops counting as self-renewing once its cover has
 * lapsed and Stripe confirms it is not active. A cancelled one is dropped so
 * the member is reminded like any bank payer, even if the webhook never came.
 */
async function cardLapsed(db: Db, subscriptionId: string, until: number, now: number) {
	if (until + GRACE > now || !stripeEnabled()) return false;
	let sub: Stripe.Subscription | null = null;
	try {
		sub = await getStripe().subscriptions.retrieve(subscriptionId);
	} catch (e) {
		// Only a subscription Stripe no longer knows counts as gone, never an outage.
		if ((e as { code?: string }).code !== 'resource_missing') return false;
	}
	if (!sub || ['canceled', 'incomplete_expired'].includes(sub.status)) {
		await db
			.update(member)
			.set({ stripeSubscriptionId: null })
			.where(eq(member.stripeSubscriptionId, subscriptionId));
	}
	return sub?.status !== 'active' && sub?.status !== 'trialing';
}

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!env.CRON_SECRET) error(503, 'CRON_SECRET not set');
	// Constant-time comparison; Workers' native helper when available.
	const given = new TextEncoder().encode(request.headers.get('authorization') ?? '');
	const expected = new TextEncoder().encode(`Bearer ${env.CRON_SECRET}`);
	const subtle = crypto.subtle as SubtleCrypto & {
		timingSafeEqual?: (a: BufferSource, b: BufferSource) => boolean;
	};
	const equal =
		given.byteLength === expected.byteLength &&
		(subtle.timingSafeEqual
			? subtle.timingSafeEqual(given, expected)
			: given.reduce((acc, v, i) => acc | (v ^ expected[i]), 0) === 0);
	if (!equal) error(401, 'Unauthorized');

	const db = getDb(platform!.env.DB);
	const now = Date.now();

	const holvi = holviEnabled() ? await syncHolvi(db) : null;

	const approved = await db.query.member.findMany({
		where: and(eq(member.status, 'approved'), isNotNull(member.email))
	});
	const payments = await db.query.payment.findMany();
	const coveredUntil = (id: string) =>
		Math.max(0, ...payments.filter((p) => p.memberId === id).map((p) => p.periodEnd.getTime()));

	let reminded = 0;
	const overdue: string[] = [];
	for (const m of approved) {
		const until = coveredUntil(m.id);
		if (m.stripeSubscriptionId && !(await cardLapsed(db, m.stripeSubscriptionId, until, now)))
			continue; // renews automatically
		const monthly = m.billingInterval === 'month';
		// A monthly payer's next instalment is always near; only chase a missed one.
		if (until > now + (monthly ? -GRACE : REMIND_AHEAD)) continue;
		if (until + GRACE <= now) overdue.push(`${m.fullName} (${m.email})`);

		const lastReminded = m.lastReminderAt?.getTime() ?? 0;
		if (now - lastReminded < REMIND_INTERVAL) continue;

		const fee = FEES[m.memberClass];
		await sendEmail(
			m.email!,
			'Mementomori ry membership fee / jäsenmaksu',
			`Hei!\n\nJäsenmaksusi kausi on päättymässä tai päättynyt. Voit maksaa kirjautumalla osoitteessa https://members.mementomori.social tai tilisiirtona viitteelläsi.\n\nYour membership fee period is ending or has ended. Pay by signing in at https://members.mementomori.social or by bank transfer with your reference number.\n\n${m.viite ? `Viitenumerosi / your reference: ${m.viite}\n` : ''}Jäsenmaksu / fee: ${monthly ? `${fee.month} €/kk (month)` : `${fee.year} €/v (year)`}.\n\nMementomori ry`
		);
		await db
			.update(member)
			.set({ lastReminderAt: new Date(now) })
			.where(eq(member.id, m.id));
		reminded++;
	}

	if (overdue.length > 0) {
		const msg = boardMessage(
			'\u23f0 Membership fees overdue',
			[
				['Members', String(overdue.length)],
				['Who', overdue.join(', ')]
			],
			{ label: 'Open the board page', url: 'https://members.mementomori.social/admin' }
		);
		await notifyBoard(msg.plain, msg.html);
		await sendEmail(
			'ry@mementomori.social',
			`Jäsenmaksut myöhässä: ${overdue.length}`,
			`Seuraavien jäsenten jäsenmaksukausi on päättynyt eikä uutta maksua näy:\n\n${overdue.join('\n')}\n\nJäsenyyden päättäminen on hallituksen päätös, sitä ei tehdä automaattisesti.`
		);
	}

	return json({
		ok: true,
		holvi: holvi ?? 'not configured',
		reminded,
		overdue: overdue.length
	});
};
