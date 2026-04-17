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
(1, 'Academic Textbooks'),
(2, 'Lecture Chronicles'),
(3, 'Scientific Apparatus'),
(4, 'Computing & Digital Assets'),
(5, 'Mathematical Instruments'),
(6, 'Technical & Vocational Tools'),
(7, 'Artistic Tools & Mediums'),
(8, 'Clinical & Medical Supplies'),
(9, 'Physical Education Kits'),
(10, 'Institutional Equipment'),
(11, 'Scholarly Manuscripts'),
(12, 'Miscellaneous Resources');

-- ⚠️  PRODUCTION SETUP: Do NOT use a hardcoded admin insert in production.
-- To create the first admin account safely:
-- 1. Register normally at /register using an @liceo.edu.ph email.
-- 2. Verify the account via OTP.
-- 3. Then run the following in your DB shell to elevate to admin:
--    UPDATE `user` SET `role` = 'admin' WHERE `email` = 'your-email@liceo.edu.ph';
