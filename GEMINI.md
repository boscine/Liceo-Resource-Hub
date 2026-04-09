# MASTER_CONTEXT.md — Liceo Resource Hub
> Unified session synchronization file. Last updated: 2026-04-09 (Backend Audit & Bug Sync)

## 🏁 Getting Started & Installation

Follow these steps to set up the repository precisely after git cloning.

### 1. Prerequisites
*   **Node.js v18+** (LTS recommended)
*   **MariaDB v10+** (Default port 3306)
*   **Git Bash** or similar terminal

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
*   `./start-dev.bat` (Windows Batch) OR
*   `./start-dev.ps1` (PowerShell)

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
- **Auth:** JWT + bcryptjs + 6-digit Email OTP (Dev-logged)
- **Ports:** BE: 3000 | FE: 4200 (Proxy: `/api` → `localhost:3000`)
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
- **user:** id, email, password_hash, role (student/admin), status (pending/active/banned), college
- **contact:** user_id FK, type (messenger/phone/other), value
- **post:** user_id FK, category_id FK, status (open/fulfilled/closed/removed), title, description
- **category:** 8 seeded types: Textbook, Notes, Tools, Equipment, Art, Calculator, USB, Other.
- **post_report:** 3+ reports = auto-flag for admin review.

## 5. Completed Milestones (✅)
- **Auth System:** Domain-locked registration, JWT interceptors, OTP Verification flow.
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
- **Routing Redesign:** Updated academic request modification paths to follow the RESTful `post/:id/edit` pattern.
- **Modal UX Hardening:** Restructured the detail modal to prioritize curator profiles and introduced the "Offer Scholarly Cooperation" call-to-action with handshake iconography.
- **Navbar Mobile Optimization (V7):** Reduced mobile navbar height (60px) and padding (1rem) for better real estate. Hardened notification panel responsiveness.
- **Post Edit Unification:** Standardized the `/post/:id/edit` redirection flow to use the global `NavbarComponent` and match the scholarly full-page layout.
- **System Capacity (V2):** Increased `Post.title` capacity to 255 chars and implemented P2000 Prisma error handling to ensure data-overflow stability during scholarly archiving.
- **Navigation Simplification (V8):** Relocated core actions (Requests, Create, Profile, Dashboard) to context-aware quick-navigation sidebars, stripping them from the global navbar header for a cleaner, profile-first header.
- **"Static Fidelity" Strategy:** Completely transitioned the modal system (Delete, Metadata) and notification panels to a static, animation-free UI to ensure ultra-snappy, zero-latency scholarly feedback.
- **Admin Control Integration:** Successfully unified the main feed's sidebar with institutional controls (Profile/Dashboard) for verified administrative accounts.
- **Navigation Breadcrumbs:** Optimized the Post Creation portal with a "Return to Library" breadcrumb, matching the established profile-page navigation pattern.
- **Profile Hardening:** Restricted header username reflection until successful sync and refined "Institutional Email" read-only styling with premium pill-backgrounds and locked iconography.
- **Category Selection Cards (V9):** Replaced standard dropdowns with a premium, responsive grid of selectable academic cards in both the Create and Edit portals.
- **Navigation Standardization:** Unified all internal breadcrumbs to "Return to feed" and restored navbar brand visibility on mobile with a responsive "Liceo Hub" title.
- **Repository Indexing:** Redesigned the feed filter with a "Repository Index" anchor and premium scholarly chips that support alphabetical sorting and "Other-last" priority.
- **Author Notifications:** Implemented backend-integrated notifications that alert authors when fellow scholars save their requests.
- **Interaction Fidelity:** Introduced the "Offer Scholarly Cooperation" handshake call-to-action across the metadata modal and detail views.
- **Email Integration (V12):** Fully implemented real-time academic dispatch system using Nodemailer. Integrated forgot-password and reset-password flows with secure archival tokens and themed scholarly email templates.
- **Credential Restoration:** Established a secure restoration portal using the `PasswordReset` database model and atomic prisma transactions.
- **Backend Hardening (V14):** Patched `verifyToken` middleware for guest access, optimized bulk delete with `createMany`, redacted contact info for guests, and unified Zod validation across routes and controllers.

## 6. Pending / Next Steps (⬜)
1. ⬜ **Performance Tuning:** Monitor `backdrop-filter` impact on low-end mobile hardware.
2. ⬜ **Testing:** Unit & Integration tests for critical API routes.
3. ⬜ **Deployment:** Railway (BE+DB) + Netlify/Vercel (FE).

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

---
- **Header & Navigation Pivot:** De-cluttered the global navbar by removing "Requests" and "Create" links, centralizing them in the Feed's responsive Quick Navigation sidebar.
- **Admin Sidebar Integration:** Integrated institutional control portals (Profile/Dashboard) into the Feed sidebar for restricted access by verified administrative accounts.
- **"No Animation" UI:** Completely stripped all entry/exit animations from modals (Delete, Metadata) and overlays to achieve a lightning-fast, static academic interface prioritizing zero-latency feedback.
- **Data-Overflow Hardening:** Implemented title length constraints (200 chars FE / 255 chars DB) and proactive P2000 error handling in the API routes to prevent crash loops.
- **Design Unification:** Aligned the "Confirm Deletion" modal with the minimalist "Metadata" popup aesthetics while maintaining high-stakes visibility.
- **Portal Breadcrumbs:** Added curated "Return to Library" breadcrumbs to the Creation portal to standardize return-to-feed patterns across the platform.
- **Profile UI Hardening:** Fixed real-time header reflection in the Profile page and upgraded institutional email hints with locked scholarly pill designs.
- **Category Card UI:** Replaced legacy selects with a tactile, card-based selection grid for scholarly categories.
- **Navigation Unification:** Standardized all breadcrumb navigation to "Return to feed" and enabled the mobile menu button globally for consistent access.
- **Notification Integration:** Fixed the author notification flow, ensuring real-time feedback when a request is bookmarked by another scholar.
- **Filter Design Upgrade:** Introduced the "Repository Index" filter label and improved chip interactions for better scholarly browsing.
- **Device-Agnostic Metadata:** Hardened the detail modal with wrapping layouts and fluid typography to handle long academic titles on mobile screens.
- **Email Infrastructure (V12):** Deployed a centralized `mail.service.ts` and hardened `auth.routes.ts` with real-time SMTP dispatching for verification and password restoration.
- **Credential Recovery Logic:** Integrated the `PasswordReset` model with secure token generation, establishing a scholarly restoration flow for institutional accounts.
- **Backend Audit (V13):** Identified critical logic gaps in guest access, foreign-key validation, and bulk notification performance. Established a roadmap for backend hardening.
- **Backend Hardening (V14):** Realized the institutional roadmap by patching guest access middlewares, optimizing bulk notification dispatch via atomic `createMany`, and enforcing redacted scholarly contact privacy for unauthenticated users.
- **Backend Compilation Fixes (V15):** Resolved TypeScript build errors in `profile.controller.ts` (casting `c.req.json()`) and `api.routes.ts` (`Number(categoryId)`) to ensure robust production-ready builds.
- **Backend Audit & Bug Sync (V16):** Completed a comprehensive backend audit, confirming the correct implementation of guest access control and contact information redaction. No new bugs related to these critical security aspects were identified.
