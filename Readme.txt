 
# Liceo Resource Hub
## Grand Archive & Context Synchronization Point
 

---

### 1. Project Overview
The Liceo Resource Hub is a specialized academic platform designed for Liceo de Cagayan University students to share and request educational related materials.

* Core Function: Students post requests for textbooks, notes, or tools; others respond via external contact.
* Security: Access is strictly restricted to @liceo.edu.ph email domains.
* Privacy: Contact information remains hidden from guests and is only revealed to authenticated students.
* Aesthetics: Branded as "The Academic Curator" using Maroon and Gold color schemes.

---

### 2. Technical Architecture
| Layer | Technology |
| :--- | :--- |
| Frontend | Angular 18 (Custom SCSS, jwt-decode) |
| Backend | Hono (TypeScript, ESM) |
| ORM | Prisma |
| Database | MySQL - adet_bsitdb22 |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |

---

### 3. Active Development Goals
1. Initialize the forgot-password logic and notification system.
2. Complete the API integration for the student Feed and Post-Create pages.
3. Implement backend route protection using the established Auth Middleware.

---

### 4. Git Management
To ensure the repository remains clean, all local utility scripts and metadata are excluded from the remote repository.

* Standard Update: Use "git add ." followed by "git commit -m 'Slight changes'".
* Branch Linking: Use "git push -u origin main" to link the local branch to the remote repository.
