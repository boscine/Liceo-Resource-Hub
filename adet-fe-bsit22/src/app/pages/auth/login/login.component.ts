import { Component, ChangeDetectorRef }    from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { FormsModule }                    from '@angular/forms';
import { RouterModule }                   from '@angular/router';
import { Router }                         from '@angular/router';
import { AuthService }                    from '../../../core/services/auth.service';
import { ToastService }                   from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email        = '';
  password     = '';
  remember     = false;
  loading      = false;
  showPassword = false;
  isAdmin      = false;
  showHelp     = false;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  onSubmit() {
    this.loading = true;
    
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.isAdmin = this.auth.isAdmin();
        
        const user = this.auth.getUser();
        this.toast.success(`Welcome back, ${user?.display_name || 'Academic Curator'}!`);
        
        this.cdr.detectChanges();
        this.router.navigate([this.isAdmin ? '/admin' : '/feed']);
      },
      error: (err) => {
        this.loading = false;
        
        // Handle specific case for pending verification
        if (err.status === 403 && err.error?.pending) {
          this.router.navigate(['/verify'], { queryParams: { email: err.error.email } });
          return;
        }

        // Generic errors are handled by error.interceptor.ts toast
        console.error('[Login Error]:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
