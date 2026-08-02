import { error, json } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { member } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email';
import { syncHolvi, holviEnabled } from '$lib/server/holvi';
import { FEES } from '$lib/fees';

const DAY = 86_400_000;
/** Remind 14 days before the period ends, then every 14 days while unpaid. */
const REMIND_AHEAD = 14 * DAY;
const REMIND_INTERVAL = 14 * DAY;

/**
 * Daily automation. Trigger from any scheduler:
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" .../internal/cron
 *
 * Jobs: Holvi bank-transfer import, payment reminders for bank payers
 * (Stripe subscriptions renew themselves), and an overdue summary to the
 * board. Memberships are never ended automatically: the rules have no
 * clause for that, so ending one is a board decision.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	if (!env.CRON_SECRET) error(503, 'CRON_SECRET not set');
	if (request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`)
		error(401, 'Unauthorized');

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
		if (m.stripeSubscriptionId) continue; // renews automatically
		const until = coveredUntil(m.id);
		if (until > now + REMIND_AHEAD) continue;
		if (until <= now) overdue.push(`${m.fullName} (${m.email})`);

		const lastReminded = m.lastReminderAt?.getTime() ?? 0;
		if (now - lastReminded < REMIND_INTERVAL) continue;

		const fee = FEES[m.memberClass];
		await sendEmail(
			m.email!,
			'Mementomori ry membership fee / jäsenmaksu',
			`Hei!\n\nJäsenmaksusi kausi on päättymässä tai päättynyt. Voit maksaa kirjautumalla osoitteessa https://members.mementomori.social tai tilisiirtona viitteelläsi.\n\nYour membership fee period is ending or has ended. Pay by signing in at https://members.mementomori.social or by bank transfer with your reference number.\n\nJäsenmaksu / fee: ${fee.year} €/v.\n\nMementomori ry`
		);
		await db
			.update(member)
			.set({ lastReminderAt: new Date(now) })
			.where(eq(member.id, m.id));
		reminded++;
	}

	if (overdue.length > 0) {
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
