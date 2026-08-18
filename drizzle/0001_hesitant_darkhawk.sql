CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gentleReminderEnabled` boolean NOT NULL DEFAULT true,
	`daysUntilGentleReminder` int NOT NULL DEFAULT 3,
	`lastReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_id_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `practice_sessions` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`category` enum('warmup','pitch','rhythm') NOT NULL,
	`exerciseKey` varchar(96) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`tempo` enum('slow','normal','fast') NOT NULL,
	`plannedDurationSeconds` int NOT NULL,
	`actualDurationSeconds` int NOT NULL DEFAULT 0,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`idempotencyKey` varchar(64) NOT NULL,
	CONSTRAINT `practice_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `practice_sessions_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `session_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`pitchStability` float,
	`rhythmAccuracy` float,
	`completionCount` int NOT NULL DEFAULT 0,
	`nextStep` varchar(280) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_metrics_session_id_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`locale` varchar(16) NOT NULL DEFAULT 'zh-HK',
	`timezone` varchar(64) NOT NULL DEFAULT 'Asia/Hong_Kong',
	`hasCompletedBaseline` boolean NOT NULL DEFAULT false,
	`comfortableLowMidi` int,
	`comfortableHighMidi` int,
	`rhythmBaseline` float,
	`preferredDifficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`userId`)
);
