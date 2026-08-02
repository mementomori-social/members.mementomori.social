import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

/**
 * The member register (jäsenluettelo). Yhdistyslaki 11 § requires the full
 * name and home municipality of every member; the rest supports running the
 * association. One row per application/member, linked to the auth user.
 */
export const member = sqliteTable('member', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	/**
	 * Nullable: founding members joined by the founding charter, and a member
	 * of the register does not need a web login at all. A row is claimed by
	 * email match when that person later signs up.
	 */
	userId: text('user_id')
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	fullName: text('full_name').notNull(),
	homeMunicipality: text('home_municipality').notNull(),
	email: text('email'),
	/** member = varsinainen jäsen, supporting = kannatusjäsen */
	memberClass: text('member_class', { enum: ['member', 'supporting'] }).notNull(),
	/** Payment schedule for the fixed annual fee. Annual preferred. */
	billingInterval: text('billing_interval', { enum: ['year', 'month'] })
		.notNull()
		.default('year'),
	/** Optional, never a condition of membership (board decision 21.7.2026). */
	mastodonAcct: text('mastodon_acct'),
	mastodonAvatarUrl: text('mastodon_avatar_url'),
	/** Set by the Stripe webhook when a checkout completes. */
	stripeCustomerId: text('stripe_customer_id'),
	stripeSubscriptionId: text('stripe_subscription_id'),
	/** Opt-in consent to appear on the member list shown to other members. */
	listedConsent: integer('listed_consent', { mode: 'boolean' }).notNull().default(false),
	status: text('status', { enum: ['applied', 'approved', 'rejected', 'ended'] })
		.notNull()
		.default('applied'),
	appliedAt: integer('applied_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	decidedAt: integer('decided_at', { mode: 'timestamp' })
});

/**
 * Board approvals. A membership needs two, from two different board members,
 * at least one of whom is the chair or vice chair (board decision 21.7.2026;
 * yhdistyslaki 35 §: decisions made without a meeting must be recorded).
 */
export const approval = sqliteTable('approval', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	memberId: text('member_id')
		.notNull()
		.references(() => member.id, { onDelete: 'cascade' }),
	approverUserId: text('approver_user_id')
		.notNull()
		.references(() => user.id),
	/** Snapshot of the approver's role at approval time. */
	approverRole: text('approver_role').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

/**
 * Payment ledger. Stripe rows are written by the webhook, bank transfers are
 * recorded manually by the board. This is the bookkeeping source of truth.
 */
export const payment = sqliteTable('payment', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	memberId: text('member_id')
		.notNull()
		.references(() => member.id, { onDelete: 'cascade' }),
	amountEur: real('amount_eur').notNull(),
	method: text('method', { enum: ['stripe', 'bank'] }).notNull(),
	/** Stripe invoice/charge id, or bank transfer reference. */
	reference: text('reference'),
	paidAt: integer('paid_at', { mode: 'timestamp' }).notNull(),
	periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
	periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
	/** User id of the board member who recorded a manual payment. */
	recordedBy: text('recorded_by').references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export * from './auth.schema';
