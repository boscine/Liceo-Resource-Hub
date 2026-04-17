# 📖 Liceo Resource Hub — AI Agent Setup Guide
> Follow these instructions to initialize, configure, and run the project perfectly on any local machine.

---

## 🛠️ 1. Prerequisites
Ensure the environment has the following installed:
- **Node.js v18+** (Required for Hono and Angular 18)
- **MariaDB v10+** (or MySQL) running on default port **3306**
- **Terminal Requirements**:
  - **Windows**: Git Bash (Recommended) or PowerShell
  - **macOS (MacBook)**: Standard Terminal (zsh/bash)
- **Package Manager (macOS)**: [Homebrew](https://brew.sh/) is highly recommended.

---

## 🗄️ 2. Database Initialization
1.  **Create Database**: Open your MariaDB/MySQL shell and execute:
    ```sql
    CREATE DATABASE adet_bsitdb22;
    ```
2.  **Import Schema & Seed Data**:
    Run the following command while inside the root directory (or use your SQL client to source it):
    - **Windows**: `mysql -u root -p adet_bsitdb22 < setup_db.sql`
    - **macOS (MacBook)**: `mysql -u root -p adet_bsitdb22 < setup_db.sql` (Ensure `mysql` is in your PATH via `brew link mariadb`)
    *(Note: Default password in development is usually `12345` per `MASTER_CONTEXT.md`)*.

---

## ⚙️ 3. Environment Configuration
### Backend (`adet-be-bsit22/.env`)
Create a `.env` file inside `adet-be-bsit22` with these contents:
```env
# Database & Auth
DATABASE_URL="mysql://root:12345@localhost:3306/adet_bsitdb22"
JWT_SECRET="liceo_academic_curator_secret_2026"
PORT=3000

# Frontend & CORS
FRONTEND_URL="http://localhost:4200"

# Postmark (Email)
POSTMARK_SERVER_TOKEN="your_postmark_token"
POSTMARK_FROM="noreply@liceo.edu.ph"
```
*(Update `root:12345` if your local shell uses a different username or password)*.

---

## 🚀 4. Installation & Execution

### Step A: Backend Setup
Open a terminal and run:
```bash
cd adet-be-bsit22
npm install
npx prisma generate
npm run dev
```
- **Success Criteria**: Terminal shows `Server is running on http://localhost:3000`.

---

### Step B: Frontend Setup
Open a **new** terminal and run:
```bash
cd adet-fe-bsit22
npm install
npm run start
```
- **Success Criteria**: Terminal shows `Angular application is running at http://localhost:4200`.

---

## 🧪 5. Verification Checklist
- [ ] **Database Connection**: Backend logs should not show Prisma connection errors.
- [ ] **Login/Register**: Navigate to `http://localhost:4200`. Use an `@liceo.edu.ph` email for registration.
- [ ] **Verification**: Enter the OTP code from your email inbox. Test **"Dispatch New Code"** if needed.
- [ ] **Admin Elevation**: After verifying your account, run in your DB shell:
  ```sql
  UPDATE `user` SET `role` = 'admin' WHERE `email` = 'your-email@liceo.edu.ph';
  ```
- [ ] **Proxy Check**: Ensure `/api/...` requests from the frontend are correctly proxied to port 3000.

---

## 🧭 6. Automation Scripts (Windows)
Alternatively, you can use the built-in startup scripts in the root directory:
- **Windows (Batch)**: Double-click `start-dev.bat`
- **Windows (PowerShell)**: Run `./start-dev.ps1`
- **macOS (MacBook)**: Run `npm run be:dev` and `npm run fe:start` in separate terminal tabs, or use a custom `start.sh`.

---

## 📜 7. Project Architecture Notes for AI
- **Frontend**: Angular 18 (Standalone Components).
- **Backend**: Hono (Typescript) with Prisma ORM.
- **Theme**: "The Academic Curator" (Maroon & Academia Gold).
- **Auth**: JWT-based. Redirects to `/login` if unauthorized.

---
**Last Updated:** 2026-04-07
**Project Scope:** Liceo de Cagayan University - Academic Resource Hub
