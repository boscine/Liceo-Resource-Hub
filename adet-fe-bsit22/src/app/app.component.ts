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
    
    <!-- Institutional Utility Tab (Right Edge) -->
    @if (isLoggedIn()) {
      <div class="utility-tab-right">
        <button class="theme-utility-btn" (click)="themeService.toggleTheme()" [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span class="material-symbols-outlined">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          <span class="utility-label">THEME</span>
        </button>
      </div>
    }

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent {
  constructor(
    public themeService: ThemeService,
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

        // EXCLUDE 'INSTITUTIONAL PORTALS' (/public, /curator-guide) FROM DEFAULT SCROLL RESET
        // This ensures archival reading remains stable and internal smooth-scrolling 
        // logic (if any) takes precedence over the global viewport refresh.
        const excludedPaths = ['/public', '/curator-guide'];
        const isExcluded = excludedPaths.some(p => event.urlAfterRedirects.startsWith(p));
        
        if (!isExcluded) {
          window.scrollTo(0, 0);
        }
      }
    });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}