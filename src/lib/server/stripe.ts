import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import type { MemberClass } from '$lib/fees';

/** Stripe is optional: without a secret key the site runs bank-transfer only. */
export const stripeEnabled = () => Boolean(env.STRIPE_SECRET_KEY);

export const getStripe = () =>
	new Stripe(env.STRIPE_SECRET_KEY!, {
		httpClient: Stripe.createFetchHttpClient()
	});

/**
 * Fixed prices only, resolved from Stripe price ids in the environment.
 * The amounts are set by the association meeting decision of 21.7.2026;
 * nothing here may allow a chooseable amount.
 */
export const priceIdFor = (memberClass: MemberClass, interval: 'year' | 'month') => {
	const key = `STRIPE_PRICE_${memberClass === 'member' ? 'MEMBER' : 'SUPPORTING'}_${
		interval === 'year' ? 'YEAR' : 'MONTH'
	}`;
	return env[key] || null;
};
