# MASTER_CONTEXT.md — Liceo Resource Hub
> Unified session synchronization file. Last updated: 2026-04-07

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

## 6. Pending / Next Steps (⬜)
1. ⬜ **Email Integration:** Wire Nodemailer/Resend for OTP and Forgot Password flows.
2. ⬜ **Validation:** Backend Zod schemas for all input routes.
3. ⬜ **Testing:** Unit & Integration tests for critical API routes.
4. ⬜ **Deployment:** Railway (BE+DB) + Netlify/Vercel (FE).

## 7. Quick Setup Guide (Another Machine)
1. **DB Setup**: Ensure MySQL/MariaDB is on port 3306. 
   - Option A: Run `setup_db.sql` in your MySQL client to create the schema and seed categories.
   - Option B: Create `adet_bsitdb22` manually and run `npx prisma db push`.
2. **BE Environment**: In `adet-be-bsit22/.env`: `DATABASE_URL="mysql://root:12345@localhost:3306/adet_bsitdb22"`.
3. **Dependencies**:
   - `cd adet-be-bsit22 && npm install && npx prisma generate`
   - `cd adet-fe-bsit22 && npm install`
4. **Execution**:
   - Start BE: `npm run dev`
   - Start FE: `npm run start` (available at `localhost:4200`)

## 8. AI Synchronization Rules
- **Conciseness:** Responses must be brief; prefer editing over rewriting.
- **Rule of 13:** Turn counter MUST be appended ([N/13]). Turn 13 triggers MASTER_CONTEXT sync.
- **Design:** Follow "The Academic Curator" theme; prioritize FPS performance.

---
**Current Session History:**
- **Bulk Delete:** Implemented multi-select checkboxes and a premium confirmation modal in the Feed.
- **UX Refinement:** Prevented users from saving their own posts; moved selection checkboxes to a more integrated UI position.
- **Design Upgrade:** Enhanced `status-open` highlights with Academia Gold pulsing dots.
- **Edit Portal:** Rebuilt `PostEdit` component with V4 premium aesthetics and status-colored radio chips.
