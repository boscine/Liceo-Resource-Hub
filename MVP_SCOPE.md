# Liceo Resource Hub — MVP Scope

The current implementation serves as the production-ready MVP, focusing on secure academic resource exchange with robust moderation and administrative oversight.

## 🚀 Core Value Proposition (Implemented)
*   **Verified Academic Commons:** Secure environment exclusively for `@liceo.edu.ph` email holders.
*   **Administrative Oversight:** High-friction moderation tools ensuring scholarly conduct.
*   **Curator-Level Control:** Automated post-status lifecycle (Open -> Fulfilled -> Closed/Flagged).
*   **Engagement Tracking:** Data-driven metrics (Contact Reveals/Saves) to identify community resource needs.

## 🛠 Feature Set
*   **Auth:** JWT-based secure institutional sign-in.
*   **Curated Feed:** Categorized requests for textbooks and tools.
*   **Moderation:** 
    *   Administrative dashboard with real-time reporting.
    *   One-tap Flag/Resolve workflows.
    *   Auto-close triggered by flagging.
*   **UI/UX:** "Academic Curator" design language (Glassmorphism, Maroon/Gold palette).
*   **Privacy:** Verified institutional contact reveal mechanism.

## 📈 Next Phases (Post-MVP)
*   **Trending Algorithm:** Implement priority sorting based on `PostSave` and `ContactReveal` metrics.
*   **Notification TTL:** Automated cleanup of expired activity notifications.
*   **Performance:** Audit for large image-grid rendering on low-end devices.
*   **Scaling:** CI/CD integration and multi-region deployment.
