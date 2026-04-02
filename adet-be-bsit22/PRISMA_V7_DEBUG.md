# Prisma v7 + Hono Backend — Debug Log

**Date:** 2026-04-03  
**Project:** Liceo Resource Hub (ADET BSIT22)  
**Stack:** Hono · Prisma v7.6.0 · MySQL · Node.js v24 · tsx

---

## Issues Encountered & Fixes Applied

---

### 1. `AuthVariables` Not Exported

**Error:**
```
Module '"../middleware/auth.middleware"' has no exported member 'AuthVariables'.
```

**Cause:**  
`auth.middleware.ts` only exported `authenticate` and `adminOnly` functions. The `AuthVariables` type used to type Hono's context variables (`c.get('userId')`) was never defined or exported.

**Fix:**  
Added the type export to `auth.middleware.ts`:
```ts
export type AuthVariables = {
  userId: number;  // matches Prisma schema: User.id Int
  role: string;
};
```

> **Note:** `userId` must be `number`, not `string` — the Prisma schema uses `Int @id @default(autoincrement())`.

---

### 2. `verifyToken` Not Exported

**Error:**
```
Module '"./middleware/auth.middleware"' has no exported member 'verifyToken'.
```

**Cause:**  
`index.ts` imported `verifyToken` but the middleware only had a function named `authenticate`.

**Fix:**  
Added an alias export at the bottom of `auth.middleware.ts`:
```ts
export const verifyToken = authenticate;
```

---

### 3. Missing `@types/jsonwebtoken`

**Error (lint):**
```
Could not find a declaration file for module 'jsonwebtoken'.
Try `npm i --save-dev @types/jsonwebtoken`
```

**Fix:**
```bash
npm i --save-dev @types/jsonwebtoken
```

---

### 4. `PrismaClientInitializationError` — No Connection String

**Error:**
```
PrismaClientInitializationError: `PrismaClient` needs to be constructed
with a non-empty, valid `PrismaClientOptions`
```

**Cause (multiple layers):**

#### Layer 1 — `url` removed from `schema.prisma` in Prisma v7
Prisma v7 no longer reads the `url` field from the `datasource` block in `schema.prisma`. Adding it causes:
```
P1012: The datasource property `url` is no longer supported in schema files.
```

**Fix:** Created `prisma.config.ts` at the project root for CLI/migration config:
```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

#### Layer 2 — `datasources` constructor option removed in Prisma v7
Passing `{ datasources: { db: { url } } }` to `new PrismaClient()` throws:
```
PrismaClientConstructorValidationError: Unknown property datasources
```

#### Layer 3 — Prisma v7 requires a Driver Adapter for MySQL
Prisma v7 removed the built-in query engine. **A driver adapter is now required** in the `PrismaClient` constructor.

For MySQL, the correct package is `@prisma/adapter-mariadb`:
```bash
npm install @prisma/adapter-mariadb mariadb
```

**Final Fix — `src/lib/prisma.ts` singleton:**
```ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const url = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
```

---

### 5. Schema Generator — `driverAdapters` Preview Feature

**Warning during `prisma generate`** (non-blocking but required for adapter support):

**Fix:** Updated `prisma/schema.prisma` generator block:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

> **Note:** In Prisma v7.6.0, `driverAdapters` was deprecated as a preview feature (it's now stable), so the warning `Preview feature "driverAdapters" is deprecated` is safe to ignore.

---

### 6. PrismaClient Used in Multiple Route Files (Anti-pattern)

**Problem:**  
Both `auth.routes.ts` and `api.routes.ts` were instantiating their own `new PrismaClient()`. This can cause connection pool exhaustion and driver adapter conflicts.

**Fix:**  
Moved all Prisma usage to a shared singleton at `src/lib/prisma.ts` and imported it in both route files:
```ts
import prisma from '../lib/prisma';
```

---

## Final File Structure (relevant files)

```
adet-be-bsit22/
├── prisma/
│   └── schema.prisma          # Added previewFeatures = ["driverAdapters"]
├── prisma.config.ts           # NEW — Prisma v7 CLI config with DATABASE_URL
├── src/
│   ├── lib/
│   │   └── prisma.ts          # NEW — Shared PrismaClient singleton w/ MariaDB adapter
│   ├── middleware/
│   │   └── auth.middleware.ts # Added: AuthVariables type, verifyToken alias
│   ├── routes/
│   │   ├── auth.routes.ts     # Updated: uses prisma singleton
│   │   └── api.routes.ts      # Updated: uses prisma singleton, removed PrismaClient import
│   └── index.ts
└── .env                       # DATABASE_URL=mysql://root:...@localhost:3306/adet_bsitdb22
```

---

## Key Prisma v7 Breaking Changes Summary

| What Changed | Old (v6) | New (v7) |
|---|---|---|
| Connection URL in schema | `url = env("DATABASE_URL")` in `datasource` block | Moved to `prisma.config.ts` → `datasource.url` |
| PrismaClient constructor | `new PrismaClient()` (no args needed) | Requires `{ adapter }` or `{ accelerateUrl }` |
| MySQL/MariaDB adapter | Built-in query engine | `@prisma/adapter-mariadb` + `mariadb` npm package |
| `previewFeatures` for adapters | `["driverAdapters"]` required | Now stable, warning if listed but still works |

---

## Commands Run

```bash
# Install missing type definitions
npm i --save-dev @types/jsonwebtoken

# Install Prisma v7 MariaDB driver adapter
npm install @prisma/adapter-mariadb mariadb

# Regenerate Prisma Client after schema/config changes
npx prisma generate

# Start dev server
npm run dev
# Output: Liceo Resource Hub API → http://localhost:3000 ✅
```
