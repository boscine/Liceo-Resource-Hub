# Liceo Resource Hub
## Integrated Academic Material Exchange Platform

### 1. Project Overview
The Liceo Resource Hub is a specialized academic platform for Liceo de Cagayan University. It enables students to share, request, and exchange educational materials (textbooks, lab tools, lecture notes, etc.) within a secure environment.

### 2. Core Functionality & Recent Updates
*   **Authentication (Completed):** Fully integrated JWT-based login and registration restricted to `@liceo.edu.ph` domains.
*   **Dynamic Feed (Live):** The main feed is now connected to the backend. It pulls real-time requests from the MySQL database and supports filtering by category.
*   **Request Creation (Live):** Students can post new material requests which are instantly saved to the database and attributed to their user profile.
*   **Visual Identity:** Branded as "The Academic Curator" with a premium Maroon and Gold theme, consistent across the Navbar, Feed, and Profile sections.

### 3. Technical Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 18 (Standalone Components, SCSS, RxJS) |
| **Backend**  | Hono Framework (Node.js/TypeScript) |
| **Database** | MySQL (Database: `adet_bsitdb22`) |
| **ORM**      | Prisma (v7.6+) |
| **Security** | Auth Interceptor (JWT), Password hashing (BcryptJS) |

### 4. Project Structure (Crucial Files)
*   `adet-be-bsit22/src/routes/api.routes.ts`: Main API endpoints for posts and categories.
*   `adet-be-bsit22/src/middleware/auth.middleware.ts`: JWT verification and role-based access logic.
*   `adet-fe-bsit22/src/app/pages/student/feed/`: Feed logic and display.
*   `adet-fe-bsit22/src/app/core/services/api.service.ts`: Centralized HTTP communication.

### 5. Development Management
*   **Start Services:** Use `start-dev.ps1` to launch both Backend and Frontend with proper memory limits and proxy configurations.
*   **Stop Services:** Use `stop-dev.ps1` to safely terminate all Node.js and Angular processes.
*   **Database:** Managed via Prisma. Use `npx prisma studio` to view data or `npx prisma migrate dev` for schema changes.

### 6. Git Workflow
*   **Branches:** Active development on `main`.
*   **Exclusions:** Project metadata (`.gemini`, `.claude`), temporary diagnostics, and local-only scripts should be reset/restored before pushing to keep the repo clean.
