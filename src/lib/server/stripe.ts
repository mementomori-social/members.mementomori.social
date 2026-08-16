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

/** The price ids configured for this deployment, month and year per class. */
const configuredPriceIds = () =>
	[
		env.STRIPE_PRICE_MEMBER_YEAR,
		env.STRIPE_PRICE_MEMBER_MONTH,
		env.STRIPE_PRICE_SUPPORTING_YEAR,
		env.STRIPE_PRICE_SUPPORTING_MONTH
	].filter((id): id is string => Boolean(id));

/**
 * The billing portal needs a configuration that no one has created in the
 * dashboard, so the first portal visit provisions one: cancel at period end,
 * card update, invoice history, and switching between the fixed prices of the
 * member's own product. Idempotent, an existing configuration is reused.
 */
export async function ensureBillingPortalConfig(stripe: Stripe): Promise<string> {
	const existing = await stripe.billingPortal.configurations.list({ limit: 1, active: true });
	if (existing.data[0]) return existing.data[0].id;

	const products = new Map<string, string[]>();
	for (const id of configuredPriceIds()) {
		const price = await stripe.prices.retrieve(id);
		const product = typeof price.product === 'string' ? price.product : price.product.id;
		products.set(product, [...(products.get(product) ?? []), id]);
	}
	const config = await stripe.billingPortal.configurations.create({
		business_profile: { headline: 'Mementomori ry' },
		features: {
			invoice_history: { enabled: true },
			payment_method_update: { enabled: true },
			subscription_cancel: { enabled: true, mode: 'at_period_end' },
			subscription_update: {
				enabled: true,
				default_allowed_updates: ['price'],
				products: [...products].map(([product, prices]) => ({ product, prices }))
			}
		}
	});
	return config.id;
}

/** Which configured interval a Stripe price id stands for, if any. */
export const intervalForPriceId = (priceId: string): 'year' | 'month' | null => {
	if (priceId === env.STRIPE_PRICE_MEMBER_YEAR || priceId === env.STRIPE_PRICE_SUPPORTING_YEAR)
		return 'year';
	if (priceId === env.STRIPE_PRICE_MEMBER_MONTH || priceId === env.STRIPE_PRICE_SUPPORTING_MONTH)
		return 'month';
	return null;
};
