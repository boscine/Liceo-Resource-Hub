# MASTER_CONTEXT.md — Liceo Resource Hub
> Unified session synchronization file. Last updated: 2026-04-07

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
- **Bulk Delete:** Support for multi-request deletion with a custom premium confirmation modal.
- **Security:** Privacy-gated profiles (no contacts for guests/self-saving blocked) and security-leak fixes.
- **Design System:** Vibrant "Academia Gold" (`#c5a021`) accents + Maroon. Pulse-active status dots for "Open" posts.
- **Performance Optimization:** GPU-accelerated animations (transform: translateZ(0)) for modals and overlays to maintain 60+ FPS.
- **Empty States:** Dynamic, context-aware empty state components for Saved, My Requests, and Feed views.
- **Notifications (V1):** Real-time backend-integrated notification system with a dedicated standalone `/notifications` page.
- **Footer Standardization:** Unified `app-footer` across all student/admin pages (Privacy, Terms, Portal, Support links).
- **Design Unification (V5):** Redesigned the self-profile portal (`/profile`) to perfectly match the "The Academic Curator" scholarly aesthetic used in public profile views.
- **Backend Hardening:** Implemented missing `resend-verify` route and added robust foreign-key validation for category selection during post creation.

## 6. Pending / Next Steps (⬜)
1. ⬜ **Email Integration:** Wire Nodemailer/Resend for OTP and Forgot Password flows.
2. ⬜ **Full Validation:** Backend Zod schemas for all input routes.
3. ⬜ **Notification Triggers:** Ensure backend correctly emits notifications on bookmark/fulfillment.
4. ⬜ **Testing:** Unit & Integration tests for critical API routes.
5. ⬜ **Deployment:** Railway (BE+DB) + Netlify/Vercel (FE).

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
   - For detailed instructions, see: [SETUP_GUIDE.md](file:///c:/Users/You/Desktop/adet-mainproject-bsit22/SETUP_GUIDE.md)
   - Start BE: `npm run dev`
   - Start FE: `npm run start` (available at `localhost:4200`)

## 8. AI Synchronization Rules
- **Conciseness:** Responses must be brief; prefer editing over rewriting.
- **Rule of 13:** Turn counter MUST be appended ([N/13]). Turn 13 triggers MASTER_CONTEXT sync.
- **Design:** Follow "The Academic Curator" theme; prioritize FPS performance.

---
**Current Session History (Last Sync: 2026-04-07):**
- **Performance:** Optimized feed modals with hardware GPU acceleration and specific property transitions for 60fps.
- **UX Refinement:** Implemented dynamic empty states for saved items, personal requests, and filtered searches.
- **Activity Sidebar:** Added "CLOSED" request tracking to the user activity card.
- **Notifications:** Built a full backend-integrated notifications system with a dedicated full-page view and real-time navigation.
- **Cleanup:** Removed public status indicators and moved sensitive security settings out of public profile views.
- **Design Unification:** Synced self-profile and public profile aesthetics with premium "Academia Gold" gradients and verified badges.
- **Footer Sync:** Standardized the Academic Curator footer across 10+ student and administrative layouts.
- **Bug Fixes:** Implemented the missing `resend-code` API and resolved Angular template warnings and logout redirection loops.
- **API Robustness:** Added category existence checks and admin-deletion notifications to the backend pipeline.
