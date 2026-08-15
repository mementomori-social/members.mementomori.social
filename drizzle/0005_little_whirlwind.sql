CREATE TABLE `income` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`payer` text NOT NULL,
	`amount_eur` real NOT NULL,
	`paid_at` integer NOT NULL,
	`note` text,
	`recorded_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`recorded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
