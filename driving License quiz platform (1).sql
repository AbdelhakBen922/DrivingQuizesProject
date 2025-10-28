CREATE TABLE `schools` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `quizzes` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `school_id` BIGINT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `quiz_settings` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `quiz_id` BIGINT UNIQUE NOT NULL,
  `vehicle_type` ENUM ('car', 'motorcycle', 'truck') DEFAULT 'car',
  `question_count` INT DEFAULT 10,
  `time_limit_sec` INT DEFAULT 600,
  `mode` ENUM ('training', 'exam', 'school_code') DEFAULT 'training',
  `randomize_questions` BOOLEAN DEFAULT true,
  `randomize_choices` BOOLEAN DEFAULT true
);

CREATE TABLE `access_codes` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `school_id` BIGINT NOT NULL,
  `quiz_id` BIGINT NOT NULL,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `valid_from` DATETIME,
  `valid_to` DATETIME,
  `usage_limit` INT DEFAULT 0,
  `used_count` INT DEFAULT 0
);

CREATE TABLE `questions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `text` TEXT NOT NULL,
  `image_url` VARCHAR(255),
  `category` ENUM ('sign', 'rule', 'priority') NOT NULL,
  `type` ENUM ('single_choice', 'multiple_choice') DEFAULT 'single_choice',
  `is_required` BOOLEAN DEFAULT false,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `quiz_questions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `quiz_id` BIGINT NOT NULL,
  `question_id` BIGINT NOT NULL,
  `position` INT
);

CREATE TABLE `choices` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `question_id` BIGINT NOT NULL,
  `text` TEXT NOT NULL,
  `is_correct` BOOLEAN DEFAULT false,
  `position` INT DEFAULT 0
);

CREATE TABLE `quiz_attempts` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `quiz_id` BIGINT NOT NULL,
  `access_code_id` BIGINT,
  `full_name` VARCHAR(255),
  `started_at` TIMESTAMP DEFAULT 'CURRENT_TIMESTAMP',
  `finished_at` TIMESTAMP,
  `score` INT DEFAULT 0
);

CREATE TABLE `answers` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `attempt_id` BIGINT NOT NULL,
  `question_id` BIGINT NOT NULL,
  `choice_id` BIGINT,
  `answer_text` TEXT,
  `is_correct` BOOLEAN,
  `answered_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE `quizzes` ADD FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL;

ALTER TABLE `quiz_settings` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

ALTER TABLE `access_codes` ADD FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

ALTER TABLE `access_codes` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE SET NULL;

ALTER TABLE `choices` ADD FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

ALTER TABLE `quiz_questions` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

ALTER TABLE `quiz_questions` ADD FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

ALTER TABLE `quiz_attempts` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

ALTER TABLE `quiz_attempts` ADD FOREIGN KEY (`access_code_id`) REFERENCES `access_codes` (`id`) ON DELETE SET NULL;

ALTER TABLE `answers` ADD FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE;

ALTER TABLE `answers` ADD FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

ALTER TABLE `answers` ADD FOREIGN KEY (`choice_id`) REFERENCES `choices` (`id`) ON DELETE SET NULL;
