import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { ThemeService }  from './core/services/theme.service';
import { AuthService }   from './core/services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],  
  // We use backticks (`) for the template to allow multiple lines
  template: `
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    // Sync theme auth state on initialization
    this.themeService.syncAuthState(this.authService.isLoggedIn());

    // Watch for route changes to re-sync (in case of login/logout redirects)
    this.router.events.subscribe(event => {
      // Diagnostic logging to track all navigation events
      if (event && (event as any).url) {
        console.log(`[Router] ${event.constructor.name}:`, (event as any).url, '| ID:', (event as any).id);
      }
      if ((event as any).reason) console.warn('[Router Cancel Reason]:', (event as any).reason);

      if (event instanceof NavigationEnd) {
        this.themeService.syncAuthState(this.authService.isLoggedIn());
      }
    });
  }
}