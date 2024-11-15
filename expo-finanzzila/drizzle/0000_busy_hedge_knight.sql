CREATE TABLE
	`category` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`name` text (256)
	);

--> statement-breakpoint
CREATE TABLE
	`keyword` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`value` text (256) NOT NULL,
		`category_id` integer NOT NULL,
		FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON UPDATE no action ON DELETE no action
	);

--> statement-breakpoint
CREATE TABLE
	`transaction` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`name_of_place` text (256) NOT NULL,
		`category_id` integer NOT NULL,
		`amount` integer NOT NULL,
		`manual_override` integer DEFAULT false,
		FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON UPDATE no action ON DELETE no action
	);

--> statement-breakpoint
CREATE INDEX `name_idx` ON `category` (`name`);