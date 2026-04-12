import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';  
import { ToastComponent } from './shared/toast/toast.component';
import { ThemeService }  from './core/services/theme.service';
import { AuthService }   from './core/services/auth.service';
import { filter }        from 'rxjs/operators';

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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.themeService.syncAuthState(this.authService.isLoggedIn());
    });
  }
}