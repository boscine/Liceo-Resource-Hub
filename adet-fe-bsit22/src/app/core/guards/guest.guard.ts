import { Injectable }          from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService }         from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('[GuestGuard] Target URL:', state.url);
    if (!this.auth.isLoggedIn()) {
      console.log('[GuestGuard] Not logged in, allowing access.');
      return true;
    }

    // Safety net: If already logged in, STILL allow access to public routes 
    // instead of forcing a redirect to /feed.
    const publicPages = ['/public', '/curator-guide'];
    if (publicPages.some(path => state.url.toLowerCase().startsWith(path.toLowerCase()))) {
      console.log('[GuestGuard] Logged in but target is public, allowing.');
      return true;
    }

    console.log('[GuestGuard] Logged in and target is guest-only. Redirecting to /feed.');
    this.router.navigate(['/feed']);
    return false;
  }
}
