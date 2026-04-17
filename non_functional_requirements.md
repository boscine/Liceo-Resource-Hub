# Non-Functional Requirements

This document outlines the non-functional requirements of the system, extracted from the project's documentation.

## Performance
*   Optimized for 60+ FPS with GPU-accelerated animations and simplified UI elements.
    * [x] Status: Done
    * [x] Verification: Verified
*   "Static Fidelity" strategy employed for ultra-snappy, zero-latency feedback across modals and notifications.
    * [x] Status: Done
    * [x] Verification: Verified
*   Ongoing monitoring is in place to assess the impact of complex image grids on legacy hardware performance.
    * [ ] Status: Pending
    * [ ] Verification: Untested

## Security
*   Robust authentication mechanisms, including JWT, bcryptjs, OTP, and secure 64-character hexadecimal links for password resets.
    * [x] Status: Done
    * [x] Verification: Verified
*   Protection against unauthorized actions through ID-based ownership tracking.
    * [x] Status: Done
    * [x] Verification: Verified
*   Comprehensive backend data validation implemented using Zod schemas for all authentication and academic request routes.
    * [x] Status: Done
    * [x] Verification: Verified
*   Content moderation features, including an inappropriate word filter, applied across post creation and update routes.
    * [x] Status: Done
    * [x] Verification: Verified
*   Secure email integration via the Postmark API for credential restoration and verification flows.
    * [x] Status: Done
    * [x] Verification: Verified
*   Real-time database status checks within the authentication middleware to immediately restrict banned or suspended users.
    * [x] Status: Done
    * [x] Verification: Verified
*   Spam prevention measures implemented for notification triggers.
    * [x] Status: Done
    * [x] Verification: Verified

## Usability/User Experience (UX)
*   Adherence to "The Academic Curator" theme, utilizing specific color palettes (Maroon and Academia Gold).
    * [x] Status: Done
    * [x] Verification: Verified
*   Consistent design system elements, including vibrant accents, pulse-active status dots, and unified footer components across all portals.
    * [x] Status: Done
    * [x] Verification: Verified
*   Dynamic and context-aware empty states for various views.
    * [x] Status: Done
    * [x] Verification: Verified
*   Hardware-accelerated modals and a responsive design approach for mobile devices, featuring a slide-out drawer and an optimized navigation bar.
    * [x] Status: Done
    * [x] Verification: Verified
*   Intuitive navigation enhanced by category selection cards and a "Repository Index" filter for feed management.
    * [x] Status: Done
    * [x] Verification: Verified
*   Visually integrated image support with optimized previews across the feed, metadata modals, and detail pages.
    * [x] Status: Done
    * [x] Verification: Verified

## Scalability/Capacity
*   Increased `Post.title` capacity to 255 characters, with P2000 Prisma error handling to ensure data-overflow stability.
    * [x] Status: Done
    * [x] Verification: Verified
*   Planned deployment to Railway (backend and database) and Netlify/Vercel (frontend) to support future scaling.
    * [ ] Status: Pending
    * [ ] Verification: Untested

## Maintainability/Reliability
*   Unit and integration tests are planned for critical API routes.
    * [ ] Status: Pending
    * [ ] Verification: Untested
*   A scheduled notification cleanup job is planned to prune older notifications.
    * [ ] Status: Pending
    * [ ] Verification: Untested
*   Build optimization efforts have resolved Angular build failures and patched credential restoration link paths for production.
    * [x] Status: Done
    * [x] Verification: Verified
*   Codebase sanitization has been performed, removing legacy backend testing and utility scripts, dead code, and redundant validations.
    * [x] Status: Done
    * [x] Verification: Verified

## Availability/Resilience
*   Time-based (1-hour DB window) spam prevention implemented for the "Save Request" notification trigger.
    * [x] Status: Done
    * [x] Verification: Verified
*   Robust cache integrity hardening through a forced API synchronization model to resolve disappearing image artifacts.
    * [x] Status: Done
    * [x] Verification: Verified
*   Frontend state bug in `FeedComponent` fixed to ensure metadata detail modal closes correctly on HTTP 403 errors.
    * [x] Status: Done
    * [x] Verification: Verified
