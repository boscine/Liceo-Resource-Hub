# MASTER_CONTEXT.md — Liceo Resource Hub
> Unified session synchronization file. Last updated: 2026-04-12 (Documentation & Design Finalization)

## 🏁 Getting Started & Installation

Follow these steps to set up the repository precisely after git cloning.

### 1. Prerequisites
*   **Node.js v18+** (Required for Hono and Angular 18)
*   **MariaDB v10+** (Default port 3306)
*   **Terminal**: 
    - **Windows**: Git Bash or PowerShell
    - **macOS**: Standard Terminal (zsh/bash)
*   **Package Manager (macOS)**: [Homebrew](https://brew.sh/) is recommended.

### 2. Database Configuration
1.  Open your MariaDB shell and run `CREATE DATABASE adet_bsitdb22;`.
2.  Import the initial schema: `source c:/Users/You/Desktop/adet-mainproject-bsit22/setup_db.sql`.
3.  Ensure your `.env` in `adet-be-bsit22` has: `DATABASE_URL="mysql://root:12345@localhost:3306/adet_bsitdb22"` (update password if different).

### 3. Backend Setup (`adet-be-bsit22`)
```bash
cd adet-be-bsit22
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Frontend Setup (`adet-fe-bsit22`)
```bash
cd adet-fe-bsit22
npm install
npm run start
```

### 5. Running the Complete System
Use the provided automation scripts in the root directory:
*   **Windows (Batch)**: `./start-dev.bat`
*   **Windows (PowerShell)**: `./start-dev.ps1`
*   **macOS (MacBook)**: `npm run be:dev` and `npm run fe:start` in split terminal panes.

---

## 1. Project Overview
A web-based academic resource-sharing platform for Liceo de Cagayan University students.
- **Theme:** "The Academic Curator" (Maroon `#570000`, Academia Gold `#c5a021`)
- **Access:** `@liceo.edu.ph` only. Guests can't see contact info.
- **Core Loop:** Students post requests (textbooks/tools) → Others contact via external links.

## 2. Tech Stack & Environment
- **Frontend:** Angular 18 (Standalone, SCSS, RxJS, jwt-decode)
- **Backend:** Hono (TS, ESM, tsx) | **ORM:** Prisma v7.6+ (MariaDB adapter)
- **Database:** MySQL (`adet_bsitdb22`, root:12345, DATABASE_URL config in BE `.env`)
- **Auth:** JWT + bcryptjs + 6-digit OTP (Registration, Postmark) + 64-char hex link (Password Reset, Postmark)
- **Email:** Postmark API (Transactional)
- **Ports:** BE: 3000 (Configurable via PORT) | FE: 4200 (Proxy: `/api` → `localhost:3000`)
- **Environment Constraint:** On Windows-based AI hosts, the `run_command` tool may fail due to "sandboxing not supported." 
  - **Verified Fix:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and enable WSL2 backend to provide the necessary containerization for system-level tool execution.

## 3. Directory & Scope
```
liceo-resource-hub/
├── adet-be-bsit22/ (Hono)
│   ├── src/controllers/profile.controller.ts ← Hardened logic, sanitization
│   ├── src/lib/prisma.ts  ← MariaDB Singleton (Prisma v7)
│   └── routes/api.routes  ← Fixed Profile retrieval selecting contacts
└── adet-fe-bsit22/ (Angular 18)
    └── src/app/pages/
        ├── auth/           ← login, register, verify, forgot/reset
        ├── student/        ← feed, post-create, post-edit, curator-guide (New), profile
        └── admin/          ← dashboard, posts, reports
```

## 4. Database Core (`adet_bsitdb22`)
- **user:** id, email, password_hash, role (student/admin), status (pending/active/banned)
- **contact:** user_id FK, type (messenger/phone/other), value
- **post:** user_id FK, category_id FK, status (open/fulfilled/closed/removed), title, description
- **category:** 12 Institutional Types: Academic Textbooks, Lecture Chronicles, Scientific Apparatus, Computing & Digital Assets, Mathematical Instruments, Technical & Vocational Tools, Artistic Tools & Mediums, Clinical & Medical Supplies, Physical Education Kits, Institutional Equipment, Scholarly Manuscripts, Miscellaneous Resources.
- **post_report:** 3+ reports = auto-flag for admin review.

## 5. Completed Milestones (✅)
- **Auth System:** Domain-locked registration, JWT interceptors, OTP Verification flow (Registration) and Link-based Restoration flow (Password reset).
- **Post Create (V4):** Premium header with decorative badge and refined typography. Real-time 500-character description limit.
- **Post Edit (V4):** Upgraded edit portal with green-fulfilled and maroon-closed **Radio Chips** and character counters.
- **Curator's Guide:** Exhaustive protocol page for scholarly sharing ethics.
- **Bulk Delete (V10):** Implemented a high-efficiency institutional bulk-delete endpoint and atomic frontend transition.
- **Security Hardening:** Patched the unauthorized post deletion vulnerability and transitioned to ID-based ownership tracking (authorId vs user.id).
- **Validation Layer (V11):** Fully implemented backend data integrity using Zod schemas (v3.25+) and Hono validators across all authentication and academic request routes.
- **Design System:** Vibrant "Academia Gold" (`#c5a021`) accents + Maroon. Pulse-active status dots for "Open" posts.
- **Performance Optimization:** GPU-accelerated animations (transform: translateZ(0)) for modals and overlays to maintain 60+ FPS.
- **Empty States:** Dynamic, context-aware empty state components for Saved, My Requests, and Feed views.
- **Notifications (V1):** Real-time backend-integrated notification system with a dedicated standalone `/notifications` page.
- **Footer Standardization:** Unified `app-footer` across all student/admin pages (Privacy, Terms, Portal, Support links).
- **Design Unification (V5):** Redesigned the self-profile portal (`/profile`) to perfectly match the "The Academic Curator" scholarly aesthetic used in public profile views.
- **Backend Hardening:** Implemented missing `resend-verify` route and added robust foreign-key validation for category selection during post creation.
- **Guest Access (V1):** Reconfigured `AppRoutingModule` and `NavbarComponent` to allow unauthenticated users to view the Curator's Guide and Feed cards while maintaining contact privacy.
- **UI Design Library:** Established a curated `designs/` directory.
- **Feed Modal Transition (V6):** Replaced traditional page redirection with a premium, hardware-accelerated detail modal that fetches scholarly metadata asynchronously.
- **Performance & Simplification:** Optimized modal motion physics (0.1s duration, opacity-only) and simplified header design to achieve maximum FPS and UI clarity.
- **Mobile Menu Integration:** Implemented a responsive slide-out drawer for mobile views, triggered by a unified "Menu" button in the global navbar.
- **Routing Redesign:** Updated academic request modification tasks to follow the RESTful `post/:id/edit` pattern.
- **Modal UX Hardening:** Restructured the detail modal to prioritize curator profiles and introduced the "Offer Scholarly Cooperation" call-to-action with handshake iconography.
- **Navbar Mobile Optimization (V7):** Reduced mobile navbar height (60px) and padding (1rem) for better real estate. Hardened notification panel responsiveness.
- **Post Edit Unification:** Standardized the `/post/:id/edit` redirection flow to use the global `NavbarComponent` and match the scholarly full-page layout.
- **System Capacity (V2):** Increased `Post.title` capacity to 255 chars and implemented P2000 Prisma error handling to ensure data-overflow stability during scholarly archiving.
- **Navigation Simplification (V8):** Relocated core actions (Requests, Create, Profile, Dashboard) to context-aware quick-navigation sidebars, stripping them from the global navbar header for a cleaner, profile-first header.
- **"Static Fidelity" Strategy:** Completely transitioned the modal system (Delete, Metadata) and notification panels to a static, animation-free UI to ensure ultra-snappy, zero-latency scholarly feedback.
- **Admin Control Integration:** Successfully unified the main feed's sidebar for institutional controls (Profile/Dashboard) for verified administrative accounts.
- **Navigation Breadcrumbs:** Optimized the Post Creation portal with a "Return to Library" breadcrumb, matching the established profile-page navigation pattern.
- **Profile Hardening:** Restricted header username reflection until successful sync and refined "Institutional Email" read-only styling with premium pill-backgrounds and locked iconography.
- **Category Selection Cards (V9):** Replaced standard dropdowns with a premium, responsive grid of selectable academic cards in both the Create and Edit portals.
- **Navigation Standardization:** Unified all internal breadcrumbs to "Return to feed" and restored navbar brand visibility on mobile with a responsive "Liceo Hub" title.
- **Repository Indexing:** Redesigned the feed filter with a "Repository Index" anchor and premium scholarly chips that support alphabetical sorting and "Other-last" priority.
- **Author Notifications:** Implemented backend-integrated notifications that alert authors when fellow scholars save their requests.
- **Interaction Fidelity:** Introduced the "Offer Scholarly Cooperation" handshake call-to-action across the metadata modal and detail views.
- **Email Integration (V12):** Fully implemented real-time academic dispatch system using Postmark. Integrated forgot-password and reset-password flows with secure archival tokens and themed scholarly email templates.
- **Credential Restoration:** Established a secure restoration portal using the `PasswordReset` database model and atomic prisma transactions.
- **Backend Hardening (V14):** Patched `verifyToken` middleware for guest access, implemented administrative bulk delete notifications with `createMany`, redacted contact info for guests, and unified Zod validation across routes and controllers.
- **Post Moderation Mastery:** Implemented backend post reporting with auto-flagging (3+ reports), enabled administrative content editing for moderation, and upgraded to multiple-contact support in post details. (Turn 5)
- **Category Taxonomy Overhaul:** Deployed a refined 12-category institutional taxonomy and fixed case-sensitivity icon mismatches. (Turn 7)
- **API Moderation Filter (V15):** Implemented a professional inappropriate word filter (`src/lib/moderation.ts`) across all post creation and update routes, enforcing scholarly standards. (Turn 7)
- **Email Infrastructure Overhaul:** Deployed the Postmark API engine and transitioned to secure email link flows for credential restoration, eliminating the legacy 6-digit manual logic. [7/7]
- **Authentication Resilience:** Patched premature `/reset-password` frontend redirection to prevent "Invalid Cryptographic Node" errors and replaced the basic success state with a hardware-accelerated "Dispatch Success" UI.
- **Administrative Hardening:** Explicitly blocked admin self-service credential restoration using a 403 Forbidden status, redirecting verified admin accounts to contact the department head instead of sending resetting links.
- **Link-Based Restoration (V5):** Replaced the 6-digit recovery code with a secure, 64-character hex link flow for one-click credential restoration. (Turn 7)
- **Design System Unification (Email):** Established a premium "Scholarly Email" design system featuring Option A (Action Buttons) for resets and Option B (Brushed-Gold Code Boxes) for registration. (Turn 7)
- **Notification Inbox Mastery:** Overhauled the notification system by centralizing institutional state in `NotificationService`, eliminating frontend data duplication, and introducing dynamic `limit` parameters for scholarly archive retrieval.
- **Dispatch Deletion Engine:** Deployed high-efficiency backend routes and premium UI controls for individual notification removal and atomic inbox clearing ("Clear All"), ensuring a clutter-free scholarly environment.
- **State Synchronization Hardening:** Patched the navbar badge mismatch by implementing a unified RxJS subscription model across the dedicated notifications portal and global navigation bar. [7/7]
- **Visual Scholarly Integration (V16):** Fully implemented image support across the feed, metadata modals, and standalone detail pages. 
- **Mobile Vision Optimization:** Deployed fixed-height image previews (`160px`) with hardware-accelerated zoom effects for rapid scholarly scanning.
- **Frame-Rate Restoration:** Optimized modal performance by eliminating `backdrop-filter` blur in favor of high-alpha solid overlays, ensuring a consistent 60+ FPS experience.
- **Cache Integrity Hardening:** Transitioned the feed component to a forced API synchronization model (`refreshPosts`) to resolve disappearing image artifacts during cross-portal navigation. [4/7]
- **Institutional Footer Standardization (V17):** Established a shared `app-footer` component and standardized it across all authentication (Login, Register), student, and administrative portals, ensuring brand consistency. [1/7]
- **Navbar Versatility:** Upgraded `app-navbar` with help-button support to maintain secure scholarly guidance on authentication interfaces while achieving global header unification. [1/7]
- **Deployment Hardening (V18):** Made backend port and CORS origin configurable via environment variables and synchronized `.env.example` with Postmark requirements. [3/7]
- **Build Optimization:** Resolved Angular build failures by increasing CSS budgets for component font-inlining and patched the credential restoration link path for production routing. [3/7]
- **Codebase Sanitization:** Removed legacy backend testing and utility scripts (`check_db`, `test_forgot_password`, etc.) to prepare for a clean production deployment. [3/7]
- **Institutional Real-Time Security:** Patched the `authenticate` middleware to perform live database status checks, ensuring that banned or suspended users are immediately restricted even with active JWTs. [4/7]
- **Backend Architecture Cleanup:** Purged redundant Zod validations from the `updateProfile` controller and eliminated dead code from the post detail retrieval route. [4/7]
- **Interaction Resilience:** Implemented time-based (1-hour DB window) spam prevention for the "Save Request" notification trigger and refined auto-flagging logic to ignore dismissed scholarly reports. [4/7]
- **Modal Stability Patches:** Fixed a frontend state bug in the `FeedComponent` where the metadata detail modal would fail to close upon moderation-related HTTP 403 errors. [4/7]
- **Documentation Finalization:** Synchronized `README.md` and `important_design_info.md` with latest production hardening milestones and "Premium Scholarly Obsidian" theme specs. [5/7]
- **Scholarly Identity Simplification:** Streamlined the system by removing the redundant "College/Department" field from the database, backend validators, and profile interfaces. [2/7]

## 6. Pending / Next Steps (⬜)
1. ⬜ **Production Launch:** Deploy to Railway (BE+DB) and Netlify/Vercel (FE).
2. ⬜ **Performance Tuning:** Monitor impact of complex image grids on legacy hardware.
3. ⬜ **Testing:** Unit & Integration tests for critical API routes.
4. ⬜ **Notification Cleanup Job:** Implement a scheduled task to prune notifications older than 30 days (no backend TTL currently exists).
5. ✅ **Requirements Tracking Enhancement:** Implemented status and verification checkboxes in `functional_requirements.md` and `non_functional_requirements.md` for better traceability.

## 7. Quick Setup Guide (Another Machine)
1. **DB Setup**: Ensure MySQL/MariaDB is on port 3306. 
   - Option A: Run `setup_db.sql` in your MySQL client to create the schema and seed categories.
   - Option B: Create `adet_bsitdb22` manually and run `npx prisma db push`.
2. **BE Environment**: Create `adet-be-bsit22/.env` by copying `.env.example`.
   - Update `DATABASE_URL` with your local MySQL credentials.
   - Set a custom `JWT_SECRET`.
3. **Dependencies**:
   - `cd adet-be-bsit22 && npm install && npx prisma generate`
   - `cd adet-fe-bsit22 && npm install`
4. **Execution**:
   - For network testing (phone): `npm start -- --host 0.0.0.0 --disable-host-check`
   - For detailed instructions, see: [SETUP_GUIDE.md](file:///c:/Users/You/Desktop/adet-mainproject-bsit22/SETUP_GUIDE.md)
   - Start BE: `npm run dev`
   - Start FE: `npm run start` (available at `localhost:4200`)

## 8. AI Synchronization Rules
- **Conciseness:** Responses must be brief; prefer editing over rewriting.
- **Rule of 7:** Turn counter MUST be appended ([N/7]). Turn 7 triggers MASTER_CONTEXT sync.
- **Design:** Follow "The Academic Curator" theme; prioritize FPS performance.
- **Sync Mandate:** Any update to `GEMINI.md` MUST be mirrored in `MASTER_CONTEXT.md` to ensure project-wide state consistency.
