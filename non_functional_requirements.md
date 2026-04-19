# Non-Functional Requirements

## Performance
*   [x] Optimized for 60+ FPS with GPU-accelerated UI components.
*   [x] "Static Fidelity" approach for low-latency feedback.
*   [ ] Performance audit for heavy image grids on low-end hardware.

## Security
*   [x] JWT, bcryptjs, and 64-char hex tokens for secure sessions.
*   [x] Zod-based strict input validation on all API endpoints.
*   [x] Real-time auth middleware enforcing account/suspension status.
*   [x] Secure, authenticated interaction tracking (Saves/Contact Reveals).

## User Experience (UX)
*   [x] "Academic Curator" design: Scholarly gold/maroon palette.
*   [x] Responsive mobile-first design with hardware-accelerated modals.
*   [x] Intuitive admin feedback flows for moderation actions.

## Scalability
*   [x] Database schema designed for high-concurrency interaction tracking.
*   [ ] Multi-region deployment planned for Railway/Vercel platforms.

## Maintainability
*   [ ] Unit/Integration tests for API routes.
*   [x] Clean architecture: Separated concerns between Frontend, API, and Persistence layers.
