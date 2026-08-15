import { error, json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { member, payment } from '$lib/server/db/schema';
import { getStripe, stripeEnabled } from '$lib/server/stripe';

const cryptoProvider = Stripe.createSubtleCryptoProvider();

/**
 * Stripe webhook. Every paid invoice becomes a ledger row, which keeps the
 * bookkeeping automatic for card payers (board decision: as little manual
 * work as possible).
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	if (!stripeEnabled() || !env.STRIPE_WEBHOOK_SECRET) error(503, 'Stripe not configured');

	const stripe = getStripe();
	const signature = request.headers.get('stripe-signature');
	if (!signature) error(400, 'Missing signature');

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			await request.text(),
			signature,
			env.STRIPE_WEBHOOK_SECRET,
			undefined,
			cryptoProvider
		);
	} catch {
		error(400, 'Invalid signature');
	}

	const db = getDb(platform!.env.DB);

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const memberId = session.metadata?.memberId;
		if (memberId) {
			await db
				.update(member)
				.set({
					stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
					stripeSubscriptionId:
						typeof session.subscription === 'string' ? session.subscription : null
				})
				.where(eq(member.id, memberId));
		}
	}

	if (event.type === 'invoice.paid') {
		const invoice = event.data.object;

		// Webhook order is not guaranteed, so resolve the member through the
		// subscription metadata rather than relying on checkout having landed.
		const subscriptionId =
			(invoice as { parent?: { subscription_details?: { subscription?: string } } }).parent
				?.subscription_details?.subscription ?? (invoice as { subscription?: string }).subscription;

		let memberId: string | undefined;
		if (subscriptionId) {
			const sub = await stripe.subscriptions.retrieve(subscriptionId);
			memberId = sub.metadata?.memberId;
		}
		if (!memberId && typeof invoice.customer === 'string') {
			const row = await db.query.member.findFirst({
				where: eq(member.stripeCustomerId, invoice.customer),
				columns: { id: true }
			});
			memberId = row?.id;
		}
		if (!memberId) return json({ received: true, unmatched: true });

		// Idempotent: Stripe retries deliveries.
		const existing = await db.query.payment.findFirst({
			where: eq(payment.reference, invoice.id ?? '')
		});
		if (!existing) {
			const line = invoice.lines?.data?.[0];
			const periodStart = line?.period?.start ? new Date(line.period.start * 1000) : new Date();
			const periodEnd = line?.period?.end ? new Date(line.period.end * 1000) : new Date();
			await db
				.insert(payment)
				.values({
					memberId,
					amountEur: (invoice.amount_paid ?? 0) / 100,
					method: 'stripe',
					reference: invoice.id,
					paidAt: new Date(event.created * 1000),
					periodStart,
					periodEnd
				})
				.onConflictDoNothing();
		}
	}

	return json({ received: true });
};
