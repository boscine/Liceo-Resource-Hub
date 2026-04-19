# Liceo Resource Hub — Academic Curator

A web-based academic resource-sharing platform for Liceo de Cagayan University students, designed with a sophisticated "Academic Curator" aesthetic.

---

## 🎯 Status: UI Hardening
Currently refining performance and visual consistency.
- **Theme:** "The Academic Curator" (Maroon `#570000`, Academia Gold `#c5a021`)
- **Key Features:** Luminous Dark Mode, Glassmorphism, and RGB-based CSS variables.
- **Access:** Institutional Auth (`@liceo.edu.ph`) only.
- **Core Loop:** Student Resource Requests → Peer Fulfillment → Institutional Oversight.

---

## 🛠️ Tech Stack
- **Frontend:** Angular 18 (Standalone, SCSS, RxJS)
- **Backend:** Hono (Node.js, TypeScript)
- **Database:** MariaDB / MySQL (ORM: Prisma v7.6+)
- **Auth:** JWT-based institutional authentication.
- **Mailing:** Postmark/Nodemailer for scholarly dispatch.

---

## 🚀 Accomplishments
*   **Aesthetic Hardening:** Luminous Dark Mode and Glassmorphism implementation.
*   **Curatorial Oversight:** Enhanced Admin Dashboard for post and report management.
*   **UX Refinement:** Two-column Post Details (Specimen vs. Scholarly Metadata) and Two-Letter Initial profile system.
*   **Institutional Integrity:** Standardized deletion workflows and hardened Dark Mode compliance.

---

## 📦 Quick Start
For detailed installation, refer to **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

### Local Setup (macOS/Linux)
```bash
./start-dev.sh
```

### Local Setup (Windows)
```bash
./start-dev.bat
```

---

## 📜 Repository Guidelines
- **Institutional Integrity:** Only `@liceo.edu.ph` emails permitted.
- **Moderation:** Posts are filtered and auto-flagged for curatorial review.
- **Security:** Session-based spam prevention and real-time status checks.

---
**Last Updated:** 2026-04-20 (UI Hardening & Curatorial Refinement)
