-- Liceo Resource Hub - MySQL Setup Script
-- Database: adet_bsitdb22

CREATE DATABASE IF NOT EXISTS adet_bsitdb22;
USE adet_bsitdb22;

-- 1. User Table
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(191) NOT NULL,
  `display_name` VARCHAR(191) NOT NULL,
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `status` ENUM('active', 'pending', 'suspended', 'banned') DEFAULT 'pending',
  `verification_token` VARCHAR(191) NULL,
  `verification_expires_at` DATETIME NULL,
  `last_login` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `college` VARCHAR(191) DEFAULT 'Liceo Student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Category Table
CREATE TABLE IF NOT EXISTS `category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Contact Table
CREATE TABLE IF NOT EXISTS `contact` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('messenger', 'phone', 'other') NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Post Table
CREATE TABLE IF NOT EXISTS `post` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('open', 'fulfilled', 'closed', 'removed') DEFAULT 'open',
  `is_flagged` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Post Report Table
CREATE TABLE IF NOT EXISTS `post_report` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL,
  `reporter_id` INT NOT NULL,
  `reason` ENUM('inappropriate', 'spam', 'misleading', 'not_educational', 'duplicate', 'fake_contact', 'other') NOT NULL,
  `details` TEXT NULL,
  `status` ENUM('pending', 'reviewed', 'dismissed') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(`post_id`, `reporter_id`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporter_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Password Reset Table
CREATE TABLE IF NOT EXISTS `password_reset` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(191) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA for Categories
INSERT IGNORE INTO `category` (`id`, `name`) VALUES
(1, 'Textbook'),
(2, 'Lecture Notes'),
(3, 'Lab Tools'),
(4, 'Equipment'),
(5, 'Art Supplies'),
(6, 'Calculator'),
(7, 'USB / Storage'),
(8, 'Other');

-- Create a Default Admin (Password: admin123)
-- Hash generated via bcrypt (you should change this in production)
INSERT IGNORE INTO `user` (`email`, `password_hash`, `display_name`, `role`, `status`, `college`) VALUES
('admin@liceo.edu.ph', '$2a$10$rN7cW5uXh.Gv.qZc8xG/2uD0ZzJzG/6/w7Q8Q9Q9Q9Q9Q9Q9Q9Q9Q', 'System Admin', 'admin', 'active', 'University Administration');
