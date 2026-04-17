# Functional Requirements - Liceo Resource Hub

This document summarizes the functional requirements for the Liceo Resource Hub, extracted from the project's overview and completed milestones. For technical initialization and environment configuration, refer to the **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

## Core Platform Functionality:
*   Provide a web-based platform for Liceo de Cagayan University students to share academic resources.
    * [x] Status: Done
    * [x] Verification: Verified
*   Enable students to post requests for textbooks and tools.
    * [x] Status: Done
    * [x] Verification: Verified
*   Allow other students to view requests and contact requesters via external links.
    * [x] Status: Done
    * [x] Verification: Verified

## User Authentication & Authorization:
*   Users must register with `@liceo.edu.ph` email addresses.
    * [x] Status: Done
    * [x] Verification: Verified
*   Implement JWT-based authentication with interceptors for secure API calls.
    * [x] Status: Done
    * [x] Verification: Verified
*   Support email verification for new accounts.
    * [x] Status: Done
    * [x] Verification: Verified
*   Provide a secure forgot and reset password flow using email links.
    * [x] Status: Done
    * [x] Verification: Verified
*   Restrict access for banned or suspended users in real-time.
    * [x] Status: Done
    * [x] Verification: Verified
*   Prevent administrators from self-serving credential resets.
    * [x] Status: Done
    * [x] Verification: Verified
*   Differentiate between student and admin roles.
    * [x] Status: Done
    * [x] Verification: Verified
*   Allow unauthenticated guests to view the Institutional Portal (Privacy, Terms, Support) and Curator's Guide. Landing on the hub (Feed) requires an authenticated institutional account.
    * [x] Status: Done
    * [x] Verification: Verified

## Post Management:
*   Users can create posts, including title (up to 255 chars), description (up to 500 chars), category selection, and image uploads.
    * [x] Status: Done
    * [x] Verification: Verified
*   Users can edit their existing posts, including updating the status (open, fulfilled, closed).
    * [x] Status: Done
    * [x] Verification: Verified
*   Implement backend data validation (Zod schemas, Hono validators) for post creation and updates.
    * [x] Status: Done
    * [x] Verification: Verified
*   Ensure secure ownership tracking for posts.
    * [x] Status: Done
    * [x] Verification: Verified
*   Enable administrative bulk deletion of posts.
    * [x] Status: Done
    * [x] Verification: Verified
*   Apply an inappropriate word filter to post content during creation and updates.
    * [x] Status: Done
    * [x] Verification: Verified

## Content Interaction & Display:
*   Display a main feed of posts with image previews.
    * [x] Status: Done
    * [x] Verification: Verified
*   Provide a "Curator's Guide" page outlining scholarly sharing ethics.
    * [x] Status: Done
    * [x] Verification: Verified
*   Offer detailed post views through hardware-accelerated modals, displaying metadata and images.
    * [x] Status: Done
    * [x] Verification: Verified
*   Allow authenticated users to view contact information in post details.
    * [x] Status: Done
    * [x] Verification: Verified
*   Implement "Offer Scholarly Cooperation" call-to-actions.
    * [x] Status: Done
    * [x] Verification: Verified
*   Provide filtering and sorting options for the feed (e.g., "Repository Index" with categories).
    * [x] Status: Done
    * [x] Verification: Verified

## User Profiles & Notifications:
*   Users can access and manage their own profiles.
    * [x] Status: Done
    * [x] Verification: Verified
*   Display institutional email on user profiles.
    * [x] Status: Done
    * [x] Verification: Verified
*   Implement a real-time notification system with a dedicated notifications page.
    * [x] Status: Done
    * [x] Verification: Verified
*   Notify authors when other users save their requests.
    * [x] Status: Done
    * [x] Verification: Verified
*   Allow users to individually delete notifications and clear all notifications from their inbox.
    * [x] Status: Done
    * [x] Verification: Verified

## Administrative Features:
*   Provide an admin dashboard with sections for managing posts and reports.
    * [x] Status: Done
    * [x] Verification: Verified
*   Allow administrators to edit post content for moderation.
    * [x] Status: Done
    * [x] Verification: Verified
*   Implement a post reporting system with auto-flagging for admin review (3+ reports).
    * [x] Status: Done
    * [x] Verification: Verified
*   Integrate administrative controls into the main feed's sidebar for verified admin accounts.
    * [x] Status: Done
    * [x] Verification: Verified

## Email System:
*   Utilize an academic email dispatch system (Postmark API) for authentication-related emails (verification, password reset).
    * [x] Status: Done
    * [x] Verification: Verified
*   Use secure, link-based flows for credential restoration.
    * [x] Status: Done
    * [x] Verification: Verified