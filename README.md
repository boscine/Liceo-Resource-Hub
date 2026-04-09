# Liceo Resource Hub

> A web-based academic resource-sharing platform for Liceo de Cagayan University students.
> - **Theme:** "The Academic Curator" (Maroon `#570000`, Academia Gold `#c5a021`)
> - **Access:** `@liceo.edu.ph` only. Guests can't see contact info.
> - **Core Loop:** Students post requests (textbooks/tools) → Others contact via external links.

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