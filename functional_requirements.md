# Functional Requirements - Liceo Resource Hub

## Core Platform
*   [x] Web-based platform for Liceo de Cagayan University students to share academic resources.
*   [x] Students can post requests for textbooks and tools.
*   [x] Authorized users can view requests and access verified contact information.

## Authentication & Authorization
*   [x] Mandatory registration via institutional `@liceo.edu.ph` email.
*   [x] JWT-based authentication with secure interceptors.
*   [x] Email-verified account activation and secure password reset flows.
*   [x] Real-time role differentiation (Student/Admin) and suspension enforcement.
*   [x] Guests are restricted to the Institutional Portal; Hub access requires authentication.

## Content Management & Moderation
*   [x] Post creation supports title (255 chars), description (500 chars), categorization, and image uploads.
*   [x] Ownership tracking ensures only authors can modify their own content.
*   [x] Backend data validation via Zod schemas and Hono middleware.
*   [x] Inappropriate language filtering for all text-based content.
*   [x] Administrative bulk deletion tools integrated into the Admin Dashboard.
*   [x] Flagging workflow: Flagging a post by an admin automatically sets status to `closed`.

## Engagement & Notifications
*   [x] Real-time activity log for notifications.
*   [x] Automated notifications for interactions, including saving and moderation feedback.
*   [x] User-managed inbox (individual or bulk deletion of notifications).
*   [x] Interaction metrics (Saves/Contact Reveals) tracking for community interest analytics.

## Administrative Control
*   [x] Centralized Admin Dashboard for moderation, report management, and user oversight.
*   [x] Restricted post editing: Admins can update status and flag posts, but cannot edit post content.
*   [x] Quick-action moderation: Admins can directly 'Flag' or 'Resolve' reports from the Dashboard feed.
