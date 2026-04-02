# CLAUDE.md — Liceo Resource Hub
> Grand Archive & context synchronization point. Paste this at the start of any new session to resume work.

---

## 1. Project Summary

A web-based academic resource-sharing platform for **Liceo de Cagayan University** students. Students post material requests (textbooks, tools, notes), others contact them externally. Admins moderate content through a dedicated dashboard.

- **Theme:** The Academic Curator — Maroon `#570000`, Gold `#735c00`, fonts: Newsreader (serif) + Work Sans (sans)
- **Restriction:** @liceo.edu.ph emails only
- **Contact:** Hidden from guests, revealed only to logged-in students

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18, custom SCSS (no Angular Material), jwt-decode |
| Backend | Hono (TypeScript, ESM), tsx watch |
| ORM | Prisma |
| Database | MySQL — `adet_bsitdb22`, password: `12345` |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod (planned) |

---

## 3. Directory Structure

```
liceo-backend/   (also named adet-be-bsit22)
├── prisma/
│   ├── schema.prisma       ← 6 tables defined
│   └── seed.ts             ← 8 categories + admin account
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts  ← login + register (Prisma, bcrypt, JWT)
│   │   └── api.routes.ts   ← protected routes placeholder
│   ├── middleware/
│   │   └── auth.middleware.ts ← JWT verify
│   └── index.ts            ← Hono server, CORS, route mounting
└── .env

liceo-frontend/  (also named adet-fe-bsit22)
└── src/app/
    ├── core/
    │   ├── services/
    │   │   ├── auth.service.ts     ← login, register, logout, isAdmin, forgotPassword
    │   │   └── api.service.ts      ← get/post/put/patch/delete wrappers
    │   ├── interceptors/
    │   │   └── jwt.interceptor.ts  ← auto-attach Bearer token
    │   └── guards/
    │       ├── auth.guard.ts       ← redirect guests to /login
    │       ├── admin.guard.ts      ← redirect non-admins to /feed
    │       └── guest.guard.ts      ← redirect logged-in users to /feed
    ├── pages/
    │   ├── auth/
    │   │   ├── login/              ✅ Built
    │   │   ├── register/           ✅ Built
    │   │   ├── forgot-password/    ✅ Built
    │   │   └── reset-password/     ✅ Built
    │   ├── student/
    │   │   ├── feed/               ✅ Built
    │   │   ├── post-create/        ✅ Built
    │   │   ├── post-detail/        ✅ Built
    │   │   ├── post-edit/          ✅ Built
    │   │   └── profile/            ✅ Built
    │   └── admin/
    │       ├── dashboard/          ✅ Built
    │       ├── posts/              ✅ Built
    │       └── reports/            ✅ Built
    ├── app.module.ts
    ├── app.component.ts
    └── app-routing.module.ts       ← all 12 routes wired
```

---

## 4. Environment

**.env (backend)**
```
DATABASE_URL="mysql://root:12345@localhost:3306/adet_bsitdb22"
JWT_SECRET=adet$bsit22@liceo#2025!secretKey
```

**proxy.conf.json (frontend)**
```json
{ "/api": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true } }
```

---

## 5. Database

**Name:** `adet_bsitdb22`

| Table | Key Fields |
|---|---|
| user | id, email, password_hash, display_name, role (student\|admin), status (active\|suspended\|banned) |
| contact | id, user_id FK, type (messenger\|phone\|other), value |
| category | id, name — hardcoded, seeded, no admin UI |
| post | id, user_id FK, category_id FK, title, description, status (open\|fulfilled\|closed\|removed), is_flagged |
| post_report | id, post_id FK, reporter_id FK, reason (enum), details, status (pending\|reviewed\|dismissed) |
| password_reset | id, user_id FK, token, expires_at (15 min), used_at |

**Seeded data:**
- 8 categories: Textbook, Notes, Drafting Tools, Laboratory Equipment, Art Supplies, Calculator, USB/Storage, Other
- Admin: `admin@liceo.edu.ph` / `Admin@1234`

---

## 6. API Routes

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | /api/auth/login | Public | ✅ Working |
| POST | /api/auth/register | Public | ✅ Working |
| POST | /api/auth/forgot-password | Public | ⬜ Not built |
| POST | /api/auth/reset-password | Public | ⬜ Not built |
| GET | /api/v1/posts | Protected | ⬜ Not built |
| POST | /api/v1/posts | Protected | ⬜ Not built |
| GET | /api/v1/posts/:id | Protected | ⬜ Not built |
| PATCH | /api/v1/posts/:id | Protected | ⬜ Not built |
| DELETE | /api/v1/posts/:id | Admin | ⬜ Not built |
| POST | /api/v1/posts/:id/report | Protected | ⬜ Not built |
| GET | /api/v1/categories | Public | ⬜ Not built |
| GET | /api/v1/admin/posts | Admin | ⬜ Not built |
| GET | /api/v1/admin/reports | Admin | ⬜ Not built |
| PATCH | /api/v1/admin/posts/:id | Admin | ⬜ Not built |

---

## 7. Key Decisions

- Registration restricted to `@liceo.edu.ph` only
- Admin accounts are manually assigned — no self-register
- Admin uses same login page, redirected by role to `/admin`
- Contact info hidden from unauthenticated guests
- Removed posts stay in DB, visible only to admins
- Pagination: Previous/Next (not infinite scroll)
- Forgot password reset link valid 15 minutes
- 3+ reports → auto-flag post for admin review
- One report per user per post (DB unique constraint)
- CATEGORY is seeded — no admin UI needed
- Route prefix: public = `/api/auth/*`, protected = `/api/v1/*`

---

## 8. Commands

```bash
# Backend
cd adet-be-bsit22
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                          # → http://localhost:3000

# Frontend
cd adet-fe-bsit22
npm install jwt-decode
ng serve --proxy-config proxy.conf.json   # → http://localhost:4200
```

---

## 9. Resolved Issues (from previous session)

- ✅ `jwt-decode` — install with `npm install jwt-decode`
- ✅ Backend login now uses bcrypt (not plain-text passwords)
- ✅ `POST /api/auth/register` endpoint built and tested
- ✅ Login returns signed JWT token
- ✅ Angular ↔ Hono bridge tested via curl — working

---

## 10. Known Issues / Still Pending

- ⬜ All backend routes beyond auth are not yet built
- ⬜ Frontend pages use placeholder/mock data — not connected to API
- ⬜ Forgot password email sending not implemented (needs Resend or Nodemailer)
- ⬜ `ng serve` with the new design files has not been tested end-to-end yet
- ⬜ Input validation with Zod not yet added to backend

---

## 11. Next TODOs (in order)

1. Run `ng serve --proxy-config proxy.conf.json` and confirm login page works
2. Wire register page to `POST /api/auth/register`
3. Build `GET /api/v1/categories` route
4. Build `GET /api/v1/posts` with pagination
5. Build `POST /api/v1/posts` (create post)
6. Connect feed and post-create pages to real API
7. Build contact reveal on post-detail page
8. Build forgot/reset password (Nodemailer or Resend)
9. Build admin routes (flag, remove, view reports)
10. Deploy — Railway (backend + DB) + Vercel (frontend)

---

## 12. Deliverables Produced

| File | Description |
|---|---|
| SRS_ADET_Group5.pdf | Full software requirements specification |
| ERD_ADET_Group5.png | Entity relationship diagram (dark theme) |
| Architecture_ADET_Group5.png | System architecture diagram |
| adet-be-bsit22.zip | Complete backend (Hono + Prisma) |
| adet-fe-bsit22.zip | Complete frontend (Angular, all 12 pages built) |
| hono-mvc-activity.zip | Separate professor activity (MVC + mysql2) |
| PROMPT.md | Continuation prompt for new Claude sessions |
| WEBSITE_ABOUT.md | Plain-language description of the platform |

---

## 13. Members

- Jhan Lhoyd Mandahinog
- Jose Saturnino Malong
- Jade Pagumpana

**Subject:** Application Development and Emerging Trends
**Section:** BSIT 2-2 — Group 5
**School:** Liceo de Cagayan University
