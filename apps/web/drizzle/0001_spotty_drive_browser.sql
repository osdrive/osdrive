CREATE TABLE `drive` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `drive_user_id_idx` ON `drive` (`user_id`);
--> statement-breakpoint
CREATE TABLE `drive_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`drive_id` text NOT NULL,
	`parent_id` text,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`storage_key` text,
	`mime_type` text,
	`size` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`drive_id`) REFERENCES `drive`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `drive_entry_drive_id_idx` ON `drive_entry` (`drive_id`);
--> statement-breakpoint
CREATE INDEX `drive_entry_parent_id_idx` ON `drive_entry` (`parent_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `drive_entry_sibling_name_unique` ON `drive_entry` (`drive_id`,`parent_id`,`name`);
