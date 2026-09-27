DROP INDEX `payment_reference_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `payment_stripe_reference_unique` ON `payment` (`reference`) WHERE "payment"."method" = 'stripe';