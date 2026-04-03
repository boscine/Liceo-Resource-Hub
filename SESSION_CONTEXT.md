# Session Summary: Authentication and Feed API Fixes

This document summarizes the steps taken to resolve the authentication issues and the missing feed functionality in the Liceo Resource Hub project.

## 1. Resolved 401 Unauthorized on POST /posts
**Issue:** Submitting a post failed with a 401 error even if the user was logged in.
**Fixes:**
-   **Backend:** Updated `auth.middleware.ts` to support both `id` and `userId` fields as fallbacks.
-   **Backend:** Added detailed server-side logging to track decoded payloads.
-   **Frontend:** Added debug logs to `JwtInterceptor` to confirm the token is being attached to outgoing requests.
-   **Action:** Required the user to Log Out and Log In again to generate a fresh token containing the correct user identity.

## 2. Resolved 404 Not Found on GET /posts
**Issue:** After fixing authentication, the Feed page failed to load posts with a 404 error.
**Fixes:**
-   **Backend:** Implemented `router.get('/posts', ...)` in `api.routes.ts` to fetch real data from Prisma, including relations for categories and users.
-   **Frontend:** Refactored `FeedComponent.ts` to use `ApiService` to fetch both live posts and dynamic category filters.
-   **Environment:** Cleaned up dangling Node.js processes and performed a full restart of both services to ensure the new routes were loaded into memory.

## 3. Current Environment State
-   **Backend (Port 3000):** Running with `tsx watch`. Supports `/api/v1/posts` (GET/POST), `/api/v1/categories` (GET), and `/api/v1/profile` (GET).
-   **Frontend (Port 4200):** Running with `ng serve`. Standardized to use the Angular Proxy for `/api` requests.
