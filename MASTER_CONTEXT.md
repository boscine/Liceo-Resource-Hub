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
- **Unified Scholarly Auth**: Domain-locked JWT auth, 64-char restoration links, and real-time institutional status verification.
- **Academic Exchange Engine**: High-fidelity post creation/editing (V4) with category selection cards (V9), image support (V16), and institutional bulk-delete.
- **"Academic Curator" UI**: Hardware-accelerated modal system (60+ FPS), responsive mobile drawer (V7), and Obsidian-grade dark mode.
- **Discovery & Navigation**: Programmatic feed filters (Repository Index), standalone detail portals, and unified breadcrumb navigation.
- **State & Notifications**: Real-time RxJS notification service with atomic inbox clearing and scholarly cooperation dispatch.
- **Institutional Standardization**: Unified `app-footer` and `app-navbar` across all portals (Auth, Student, Admin).
- **Security & Moderation**: Integrated Zod validation layer, backend inappropriate content filter (V15), and auto-flagging report system.
- **Public Scholarly Portal**: Fully redesigned Institutional Portal (Privacy, Terms, Support) with guest-enabled discovery and contact redaction.
- **Institutional Purity**: Purged legacy database tables (`accounts`, `employees`, etc.) and sanitized the schema to focus exclusively on the Liceo Academic Hub.
- **Portal Routing Optimization**: Resolved persistent footer clickability issues by transitioning to standard Angular `routerLink` directives and high-priority `z-index: 2000` layers. [7/7]

## 6. Pending / Next Steps (⬜)
1. ⬜ **Production Launch:** Deploy to Railway (BE+DB) and Netlify/Vercel (FE).
2. ⬜ **Performance Tuning:** Monitor impact of complex image grids on legacy hardware.
3. ⬜ **Testing:** Unit & Integration tests for critical API routes.
4. ⬜ **Notification Cleanup Job:** Implement a scheduled task to prune notifications older than 30 days (no backend TTL currently exists).

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
