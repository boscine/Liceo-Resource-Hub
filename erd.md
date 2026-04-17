# Entity-Relationship Diagram (ERD) - Liceo Resource Hub

## 1. Entities & Attributes:

*   **`user`**
    *   `id` (Primary Key)
    *   `email` (Unique, `@liceo.edu.ph` domain)
    *   `password_hash`
    *   `role` (Enum: student, admin)
    *   `status` (Enum: pending, active, banned)
    *   `college`

*   **`contact`**
    *   `id` (Primary Key - assumed, or composite PK with `user_id`, `type`)
    *   `user_id` (Foreign Key to `user.id`)
    *   `type` (Enum: messenger, phone, other)
    *   `value`

*   **`post`**
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `user.id` - author of the post)
    *   `category_id` (Foreign Key to `category.id`)
    *   `status` (Enum: open, fulfilled, closed, removed)
    *   `title` (String, max 255 characters)
    *   `description` (String, max 500 characters)
    *   `image_url` (String, optional - based on "Visual Scholarly Integration" milestone)
    *   `created_at`, `updated_at` (Timestamp - assumed for auditing)

*   **`category`**
    *   `id` (Primary Key)
    *   `name` (String, Unique - e.g., Academic Textbooks, Lecture Chronicles)

*   **`post_report`**
    *   `id` (Primary Key - assumed)
    *   `post_id` (Foreign Key to `post.id`)
    *   `reporter_user_id` (Foreign Key to `user.id` - user who reported the post)
    *   `reason` (String)
    *   `status` (Enum: pending, reviewed, dismissed - e.g., for admin review)
    *   `created_at` (Timestamp - assumed)

*   **`password_reset`** (Based on "Credential Restoration" milestone)
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `user.id`)
    *   `token` (String, 64-character hex, Unique)
    *   `expires_at` (Timestamp)
    *   `created_at` (Timestamp - assumed)

*   **`notification`** (Based on "Notification Inbox Mastery" and "Author Notifications" milestones)
    *   `id` (Primary Key - assumed)
    *   `user_id` (Foreign Key to `user.id` - recipient of the notification)
    *   `type` (String - e.g., "post_saved", "post_reported")
    *   `message` (String)
    *   `read` (Boolean, default false)
    *   `created_at` (Timestamp - assumed)
    *   `related_entity_id` (Integer, nullable - e.g., `post_id` if notification is about a post)
    *   `related_entity_type` (String, nullable - e.g., "post")

## 2. Relationships:

*   **`user` 1 -- to -- Many `contact`**
    *   A user can have multiple contact methods.
    *   `contact.user_id` references `user.id`.

*   **`user` 1 -- to -- Many `post`**
    *   A user can author multiple posts.
    *   `post.user_id` references `user.id`.

*   **`category` 1 -- to -- Many `post`**
    *   A category can be assigned to many posts.
    *   `post.category_id` references `category.id`.

*   **`user` 1 -- to -- Many `post_report` (as Reporter)**
    *   A user can submit multiple reports.
    *   `post_report.reporter_user_id` references `user.id`.

*   **`post` 1 -- to -- Many `post_report`**
    *   A post can receive multiple reports.
    *   `post_report.post_id` references `post.id`.

*   **`user` 1 -- to -- One `password_reset` (active)**
    *   A user can have one active password reset token at a time. (Implicit Many if old tokens aren't immediately purged, but functionally one active.)
    *   `password_reset.user_id` references `user.id`.

*   **`user` 1 -- to -- Many `notification`**
    *   A user can receive many notifications.
    *   `notification.user_id` references `user.id`.
