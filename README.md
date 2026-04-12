# Liceo Resource Hub — Academic Curator

A web-based academic resource-sharing platform for Liceo de Cagayan University students.
- **Theme:** "The Academic Curator" (Maroon `#570000`, Academia Gold `#c5a021`)
- **Access:** `@liceo.edu.ph` only. Guests can't see contact info.
- **Core Loop:** Students post requests (textbooks/tools) → Others contact via external links.

---

## 🛠️ Tech Stack
- **Frontend:** Angular 18 (Standalone, SCSS, RxJS, jwt-decode)
- **Backend:** Hono (Typescript, ESM)
- **Database:** MariaDB / MySQL (ORM: Prisma v7.6+)
- **Auth:** JWT-based institutional authentication.
- **Mailing:** Postmark API for scholarly dispatch (forgot password, etc.)

---

## 🚀 Quick Start
For detailed installation and database configuration, please refer to:
👉 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Local Setup (Windows)
Use the provided automation scripts in the root directory:
- ⚡ **Start**: `./start-dev.bat` or `./start-dev.ps1`
- 🛑 **Stop**: `./stop-dev.bat` or `./stop-dev.ps1`

### Backend Setup (`adet-be-bsit22`)
```bash
npm install
npx prisma generate
npm run dev
```

### Frontend Setup (`adet-fe-bsit22`)
```bash
npm install
npm run start
```

---

## 📜 Repository Guidelines
- **Institutional Integrity:** Only `@liceo.edu.ph` emails are permitted.
- **Moderation:** Posts are filtered for inappropriate content and auto-flagged after 3 reports.
- **Security:** Session-based spam prevention and real-time user status checks.

---
**Last Updated:** 2026-04-12 (Production Hardening & Bug Fixes)
