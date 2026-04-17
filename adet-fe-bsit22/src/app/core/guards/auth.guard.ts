import { Injectable }          from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService }         from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.auth.isLoggedIn()) return true;

    // Safety net: ALLOW access to limited public informational pages regardless of auth state.
    // The feed and posts are now RESTRICTED to students only.
    const publicPages = ['/public', '/curator-guide'];
    if (publicPages.some(path => state.url.toLowerCase().startsWith(path.toLowerCase()))) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
