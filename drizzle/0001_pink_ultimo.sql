DROP INDEX `exercise_external_id_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_name_global_idx` ON `exercise` (`name`) WHERE user_id IS NULL;--> statement-breakpoint
ALTER TABLE `exercise` DROP COLUMN `external_id`;