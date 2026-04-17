import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            if (req.url.includes('/login')) {
              errorMessage = error.error?.message || 'Invalid credentials.';
            } else {
              // ── PUBLIC PAGE SAFETY NET ───────────────────────────────────────────
              // If we are on a public page, do NOT redirect to login even if the API 
              // returns 401. This allows components like Navbar (notifications) to 
              // fail silently without kidnapping the user from the Portal/Feed.
              const publicRoutes = ['/public', '/feed', '/curator-guide', '/post/', '/login', '/register', '/forgot-password', '/reset-password'];
              const currentPath = router.url.toLowerCase(); // Use router.url instead of window.location to properly handle mid-navigation paths
              const isPublicPage = publicRoutes.some(r => currentPath === r || currentPath.startsWith(r + '/') || currentPath.startsWith(r + '?'));

              if (!isPublicPage) {
                errorMessage = 'Your session has expired. Please log in again.';
                authService.logout();
                router.navigate(['/login']);
              }
            }
            break;
          case 403:
            errorMessage = error.error?.message || 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 500:
            errorMessage = error.error?.message || 'Internal server error. Our team has been notified.';
            break;
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          default:
            errorMessage = error.error?.message || errorMessage;
            break;
        }
      }

      console.error(`[ErrorInterceptor] Status: ${error.status} | Message: ${errorMessage}`, error);
      
      // Do not duplicate toast if we are redirecting to verify
      if (!(error.status === 403 && error.error?.pending)) {
        toastService.error(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};
