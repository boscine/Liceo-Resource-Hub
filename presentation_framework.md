# Presentation Framework: Liceo Resource Hub - "The Academic Curator"

## Slide 1: Title Slide
*   **Title:** Liceo Resource Hub: "The Academic Curator"
*   **Subtitle:** A Web-Based Academic Resource-Sharing Platform
*   **Presenters:** [Your Names/Team Name]
*   **Date:** [Current Date]
*   **Logo:** Liceo de Cagayan University / Project Logo

## Slide 2: Project Overview & Vision
*   **What is it?** A web-based academic resource-sharing platform for Liceo de Cagayan University students.
*   **Vision/Mission:** Empowering students to connect, share, and collaborate on academic resources.
*   **Theme:** "The Academic Curator" - Emphasize scholarly aesthetic (Maroon & Academia Gold).
*   **Core Loop:** Students post requests (textbooks/tools) → Others contact via external links.

## Slide 3: Key Features (Functional Requirements Highlight)
*   **User Management:** Domain-locked registration (`@liceo.edu.ph`), JWT Auth, Email Verification, Password Reset (secure link-based).
*   **Post Management:** Create/Edit/Delete posts (title, description, category, images), character limits, content moderation.
*   **Resource Discovery:** Main feed with image previews, search/filter (Repository Index), Curator's Guide.
*   **Interaction:** "Offer Scholarly Cooperation" (handshake CTA), contact information display.
*   **Notifications:** Real-time system, author notifications, inbox management.
*   **Admin Features:** Dashboard, post moderation, reporting system.

## Slide 4: Technical Architecture & Stack
*   **Frontend:** Angular 18 (Standalone, SCSS, RxJS, jwt-decode)
*   **Backend:** Hono (TypeScript, ESM, tsx), Prisma v7.6+ (MariaDB adapter)
*   **Database:** MariaDB (`adet_bsitdb22`)
*   **Authentication:** JWT, bcryptjs, Postmark API (Transactional Emails)
*   **Deployment (Planned):** Railway (BE+DB), Netlify/Vercel (FE)
*   **Key Libraries/Tools:** Zod (validation), Postmark (email dispatch)

## Slide 5: Design Principles & User Experience (Non-Functional Highlights)
*   **Theme Adherence:** "The Academic Curator" (Maroon, Academia Gold) – consistent UI.
*   **Performance:** Optimized for 60+ FPS, GPU-accelerated animations, "Static Fidelity" for snappy feedback.
*   **Responsiveness:** Mobile-first approach, slide-out drawers, optimized navbars.
*   **Intuitive UI:** Category selection cards, dynamic empty states, consistent footer.
*   **Security:** Robust authentication, data validation, content moderation, real-time access control.

## Slide 6: Project Status & Milestones
*   **Completed Milestones:** (Refer to `MASTER_CONTEXT.md` / `GEMINI.md` section 5 - pick 3-5 major ones to highlight, e.g., Auth System, Validation Layer, Email Integration, Image Support, Design System Unification).
*   **Current Phase:** [Development / Testing / Pre-Launch]
*   **Next Steps:** (Refer to `MASTER_CONTEXT.md` / `GEMINI.md` section 6)
    *   Production Launch (Railway, Netlify/Vercel)
    *   Performance Tuning
    *   Unit & Integration Tests (for critical API routes)
    *   Notification Cleanup Job
    *   Requirements Tracking Enhancement (mentioning the new checkboxes)

## Slide 7: Challenges & Solutions
*   **Challenge 1:** [Example: Ensuring UI performance on legacy hardware]
    *   **Solution:** GPU-accelerated animations, static fidelity, ongoing monitoring.
*   **Challenge 2:** [Example: Robust authentication and authorization]
    *   **Solution:** JWT, OTP, secure link-based resets, real-time status checks.
*   **Challenge 3:** [Example: Maintaining code quality and preventing data issues]
    *   **Solution:** Zod validation, code sanitization, planned testing.

## Slide 8: Demo (If Applicable)
*   Brief live demonstration of core functionalities (e.g., login, post creation, feed view).

## Slide 9: Q&A / Discussion
*   Open floor for questions and feedback.
*   **Contact:** [Your Contact Info / Team Email]

## Slide 10: Thank You / Closing
*   Thank you for your time.
