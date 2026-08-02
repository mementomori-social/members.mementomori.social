ALTER TABLE `member` ADD `viite` text;--> statement-breakpoint
ALTER TABLE `member` ADD `last_reminder_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `member_viite_unique` ON `member` (`viite`);