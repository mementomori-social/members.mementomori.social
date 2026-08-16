ALTER TABLE `payment` ADD `bank_tx_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `payment_bank_tx_unique` ON `payment` (`bank_tx_id`);