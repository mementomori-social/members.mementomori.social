PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_member` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`full_name` text NOT NULL,
	`home_municipality` text NOT NULL,
	`email` text,
	`member_class` text NOT NULL,
	`billing_interval` text DEFAULT 'year' NOT NULL,
	`mastodon_acct` text,
	`mastodon_avatar_url` text,
	`listed_consent` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'applied' NOT NULL,
	`applied_at` integer NOT NULL,
	`decided_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_member`("id", "user_id", "full_name", "home_municipality", "email", "member_class", "billing_interval", "mastodon_acct", "mastodon_avatar_url", "listed_consent", "status", "applied_at", "decided_at") SELECT "id", "user_id", "full_name", "home_municipality", "email", "member_class", "billing_interval", "mastodon_acct", "mastodon_avatar_url", "listed_consent", "status", "applied_at", "decided_at" FROM `member`;--> statement-breakpoint
DROP TABLE `member`;--> statement-breakpoint
ALTER TABLE `__new_member` RENAME TO `member`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `member_user_id_unique` ON `member` (`user_id`);