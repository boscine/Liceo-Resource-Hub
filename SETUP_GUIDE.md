# 📖 Liceo Resource Hub — AI Agent Setup Guide
> Follow these instructions to initialize, configure, and run the project perfectly on any local machine.

---

## 🛠️ 1. Prerequisites
Ensure the environment has the following installed:
- **Node.js v18+** (Required for Hono and Angular 18)
- **MariaDB v10+** (or MySQL) running on default port **3306**
- **Git Bash** (Recommended for Windows)

---

## 🗄️ 2. Database Initialization
1.  **Create Database**: Open your MariaDB/MySQL shell and execute:
    ```sql
    CREATE DATABASE adet_bsitdb22;
    ```
2.  **Import Schema & Seed Data**:
    Run the following command while inside the root directory (or use your SQL client to source it):
    ```bash
    mysql -u root -p adet_bsitdb22 < setup_db.sql
    ```
    *(Note: Default password in development is usually `12345` per `MASTER_CONTEXT.md`)*.

---

## ⚙️ 3. Environment Configuration
### Backend (`adet-be-bsit22/.env`)
Create a `.env` file inside `adet-be-bsit22` with these exact contents:
```env
DATABASE_URL="mysql://root:12345@localhost:3306/adet_bsitdb22"
JWT_SECRET="liceo_academic_curator_secret_2026"
PORT=3000
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
- [ ] **Verification**: Enter the code from the backend console. Test the **"Dispatch New Code"** link if needed.
- [ ] **Proxy Check**: Ensure `/api/...` requests from the frontend are correctly proxied to port 3000.

---

## 🧭 6. Automation Scripts (Windows)
Alternatively, you can use the built-in startup scripts in the root directory:
- **Batch**: Double-click `start-dev.bat`
- **PowerShell**: Run `./start-dev.ps1`

---

## 📜 7. Project Architecture Notes for AI
- **Frontend**: Angular 18 (Standalone Components).
- **Backend**: Hono (Typescript) with Prisma ORM.
- **Theme**: "The Academic Curator" (Maroon & Academia Gold).
- **Auth**: JWT-based. Redirects to `/login` if unauthorized.

---
**Last Updated:** 2026-04-07
**Project Scope:** Liceo de Cagayan University - Academic Resource Hub
