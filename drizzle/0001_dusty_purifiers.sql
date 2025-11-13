CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`invited_by` text NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_token_unique` ON `organization_invitations` (`token`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`owner_id` text NOT NULL,
	`is_personal` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`owner_id` text,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "organization_id", "owner_id", "name", "created_at") SELECT "id", "organization_id", "owner_id", "name", "created_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;