ALTER TABLE `member` ADD `member_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `member_member_number_unique` ON `member` (`member_number`);--> statement-breakpoint
UPDATE `member` SET `member_number` = (
	SELECT COUNT(*) FROM `member` m2
	WHERE m2.`status` = 'approved'
	  AND (m2.`applied_at` < `member`.`applied_at`
	       OR (m2.`applied_at` = `member`.`applied_at` AND m2.`rowid` <= `member`.`rowid`))
) WHERE `status` = 'approved';