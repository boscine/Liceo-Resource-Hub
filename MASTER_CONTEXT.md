# MASTER_CONTEXT.md — Liceo Resource Hub
> Unified session synchronization file. Paste at the start of any new AI session.
> Last updated: 2026-04-05

---

## 1. Project Summary

A web-based academic resource-sharing platform for **Liceo de Cagayan University** students. Students post material requests (textbooks, tools, notes); others contact them externally. Admins moderate via a dedicated dashboard.

- **Theme:** The Academic Curator — Maroon `#570000`, Pleasant Gold `#9c7c00`, fonts: Newsreader (serif) + Work Sans (sans)
- **Restriction:** @liceo.edu.ph emails only
- **Contact:** Hidden from guests, revealed only to logged-in students


---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 (Standalone Components, SCSS, RxJS, jwt-decode) |
| Backend | Hono (TypeScript, ESM, tsx watch) |
| ORM | Prisma v7.6+ |
| Database | MySQL — `adet_bsitdb22`, password: `12345` (this is only local mysql) |  
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Adapter | `@prisma/adapter-mariadb` + `mariadb` (required in Prisma v7) |

---

## 3. Directory & File Tree

```
liceo-resource-hub/
├── MASTER_CONTEXT.md               ← This file
├── important_design_info.md        ← UI/color decisions
├── start.vbs                       ← Silent background launcher
├── stop-dev.vbs                    ← Silent process killer
├── package.json                    ← npm start / npm stop scripts
│
├── adet-be-bsit22/                 (Backend — Hono)
│   ├── .env
│   ├── prisma.config.ts            ← Prisma v7 CLI config (DATABASE_URL)
│   ├── prisma/
│   │   ├── schema.prisma           ← 6 tables, previewFeatures driverAdapters
│   │   └── seed.ts                 ← 8 categories + admin account
│   └── src/
│       ├── index.ts                ← Hono server, CORS, route mounting
│       ├── lib/
│       │   └── prisma.ts           ← Shared PrismaClient singleton (MariaDB adapter)
│       ├── middleware/
│       │   └── auth.middleware.ts  ← JWT verify, AuthVariables type, verifyToken alias
│       └── routes/
│           ├── auth.routes.ts      ← login, register, verify (email OTP), forgot/reset
│           └── api.routes.ts       ← protected + admin routes
│
└── adet-fe-bsit22/                 (Frontend — Angular 18)
    └── src/app/
        ├── app.module.ts
        ├── app.component.ts
        ├── app-routing.module.ts   ← All 12+ routes wired
        ├── core/
        │   ├── services/
        │   │   ├── auth.service.ts ← login, register, logout, isAdmin, forgotPassword
        │   │   └── api.service.ts  ← get/post/put/patch/delete wrappers
        │   ├── interceptors/
        │   │   └── jwt.interceptor.ts ← auto-attach Bearer token
        │   └── guards/
        │       ├── auth.guard.ts   ← redirect guests → /login
        │       ├── admin.guard.ts  ← redirect non-admins → /feed
        │       └── guest.guard.ts  ← redirect logged-in → /feed
        └── pages/
            ├── auth/
            │   ├── login/          ✅ Built
            │   ├── register/       ✅ Built
            │   ├── verify/         ✅ Built (6-digit OTP, pending status)
            │   ├── forgot-password/ ✅ Built
            │   └── reset-password/ ✅ Built
            ├── student/
            │   ├── feed/           ✅ Live (real API, category filter, FAB scroll)
            │   ├── post-create/    ✅ Live (saves to DB)
            │   ├── post-detail/    ✅ Built
            │   ├── post-edit/      ✅ Built
            │   └── profile/        ✅ Built
            └── admin/
                ├── dashboard/      ✅ Built
                ├── posts/          ✅ Built
                └── reports/        ✅ Built
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

## 5. Database Schema

**Name:** `adet_bsitdb22`

| Table | Key Fields |
|---|---|
| user | id (Int PK), email, password_hash, display_name, role (student\|admin), status (pending\|active\|suspended\|banned) |
| contact | id, user_id FK, type (messenger\|phone\|other), value |
| category | id, name — seeded, no admin UI |
| post | id, user_id FK, category_id FK, title, description, status (open\|fulfilled\|closed\|removed), is_flagged |
| post_report | id, post_id FK, reporter_id FK, reason (enum), details, status (pending\|reviewed\|dismissed) |
| password_reset | id, user_id FK, token, expires_at (15 min), used_at |

**Seeded:**
- 8 categories: Textbook, Notes, Drafting Tools, Laboratory Equipment, Art Supplies, Calculator, USB/Storage, Other
- Admin: `admin@liceo.edu.ph` / `Admin@1234`

---

## 6. API Routes

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | /api/auth/login | Public | ✅ |
| POST | /api/auth/register | Public | ✅ |
| POST | /api/auth/verify | Public | ✅ (OTP email flow) |
| POST | /api/auth/forgot-password | Public | ⬜ Email not wired |
| POST | /api/auth/reset-password | Public | ⬜ |
| GET | /api/v1/categories | Public | ✅ |
| GET | /api/v1/posts | Protected | ✅ |
| POST | /api/v1/posts | Protected | ✅ |
| GET | /api/v1/posts/:id | Protected | ✅ |
| PUT | /api/v1/posts/:id | Protected | ✅ (Status/Details update) |
| DELETE | /api/v1/posts/:id | Protected | ✅ (Admin/Author delete) |
| POST | /api/v1/posts/:id/report | Protected | ⬜ |
| GET | /api/v1/profile | Protected | ✅ |
| GET | /api/v1/admin/posts | Admin | ✅ |
| GET | /api/v1/admin/reports | Admin | ⬜ |
| PATCH | /api/v1/admin/posts/:id | Admin | ✅ |

---

## 7. Prisma v7 Breaking Changes (Critical)

| What Changed | Old (v6) | New (v7) |
|---|---|---|
| Connection URL | `url = env(...)` in schema datasource | `prisma.config.ts` → `datasource.url` |
| PrismaClient constructor | `new PrismaClient()` | Requires `{ adapter }` |
| MySQL adapter | Built-in | `@prisma/adapter-mariadb` + `mariadb` |
| `previewFeatures` | `["driverAdapters"]` required | Now stable, warning is safe to ignore |

**Singleton pattern (`src/lib/prisma.ts`):**
```ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname, port: Number(url.port) || 3306,
  user: url.username, password: url.password,
  database: url.pathname.replace('/', ''),
});
export default new PrismaClient({ adapter });
```

---

## 8. Service Management

```bash
npm start    # Runs start.vbs silently — launches BE (port 3000) + FE (port 4200)
npm stop     # Runs stop-dev.vbs — kills all node/tsx/angular processes
```

- Backend starts fast; Angular takes **45–90 seconds** to be ready
- Memory limits: 512MB (BE) / 1.5GB (FE) set via `NODE_OPTIONS`
- After `prisma db push` always run `npx prisma generate`

---

## 9. Key Design Decisions

- Registration: `@liceo.edu.ph` only; new accounts set to `status: pending` until OTP verified
- Email OTP: 6-digit code, logged to console in dev (email not yet wired)
- Admin: manually assigned, same login page, redirected by role to `/admin`
- Contact info: hidden from unauthenticated guests
- Removed posts: stay in DB, visible only to admins
- Pagination: Previous/Next (not infinite scroll)
- 3+ reports → auto-flag post for admin review
- One report per user per post (DB unique constraint)
- FAB: `z-index: 100`, `isNearBottom` scroll state in FeedComponent

---

## 10. Resolved Issues

- ✅ `jwt-decode` installed
- ✅ bcrypt login/register
- ✅ JWT payload includes `id`, `display_name`, `email`
- ✅ AuthGuard on `/feed` and `/post/:id`
- ✅ Profile reads `display_name` from decoded token
- ✅ `AuthVariables` type exported from middleware
- ✅ `verifyToken` alias exported
- ✅ `@types/jsonwebtoken` installed
- ✅ Prisma v7 MariaDB adapter configured
- ✅ Shared PrismaClient singleton (no per-route instantiation)
- ⬜ 409 conflict on register — component handler is correct (`err.status === 409` → sets `error` + `isDuplicateEmail`). Root cause is `auth.service.ts` swallowing the error before it reaches the component. Template binding confirmed present in HTML. — when a user submits an already-registered `@liceo.edu.ph` email, the backend returns `409 Conflict` and the frontend displays an inline error (e.g. "This email is already registered."). Console shows `register:1 Failed to load resource: 409 (Conflict)` — this is expected behavior, not a bug.
- ✅ Full error stack returned on 500 (`detail` field)
- ✅ `prisma db push` + `db pull` used for external table merge without data loss
- ✅ Feed connected to real API with category filtering
- ✅ Post creation saves to DB natively instead of mockup delays
- ✅ Register 409 conflict: spinner stops and inline error displays correctly (NgZone.run() fix)
- ✅ Native missing route configurations added (`post/:id`, `post/edit/:id`, `admin/posts`)
- ✅ Saved Items functional filter mapped cleanly into localStorage `ac_savedPosts`
- ✅ Dynamic inline post editing constructed using premium glassmorphic modal
- ✅ Post Deletion mechanics built securely into feed flow
- ✅ Admin Dashboard loaded cleanly from `GET /posts` database layer

---

## 11. Pending / Next Steps

1. ⬜ Wire forgot/reset password email (Nodemailer or Resend)
2. ⬜ `POST /api/v1/posts/:id/report` — report post mechanics
3. ⬜ Contact reveal on post-detail (auth-gated)
4. ⬜ Global Angular error interceptor
5. ⬜ Input validation with Zod on backend
6. ⬜ Unit/integration tests for API routes
7. ⬜ Deploy: Railway (BE + DB) + Netlify or Vercel (FE)

---

## 12. AI Agent Rules (Skills)

- Responses must be **brief**
- Think before acting — read files before writing code
- Prefer **editing** over rewriting whole files
- Do not re-read files already in context
- Test code before declaring done
- No sycophantic openers or closing fluff
- Keep solutions simple and direct
- **User instructions always override everything**
- Append **[N/20]** to every response, incrementing each turn
