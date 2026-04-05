import { Component, ChangeDetectorRef }    from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { FormsModule }                    from '@angular/forms';
import { RouterModule }                   from '@angular/router';
import { Router }                         from '@angular/router';
import { AuthService }                    from '../../../core/services/auth.service';

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
  error        = '';
  loading      = false;
  showPassword = false;
  isAdmin      = false;
  showHelp     = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  onSubmit() {
    this.error   = '';
    this.loading = true;
    
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.isAdmin = this.auth.isAdmin();
        this.cdr.detectChanges();
        this.router.navigate([this.isAdmin ? '/admin' : '/feed']);
      },
      error: (err) => {
        this.loading = false;
        console.error('[Login Error Detail]:', err);
        
        // Handle check if user is pending verification
        if (err.status === 403 && err.error?.pending) {
          this.router.navigate(['/verify'], { queryParams: { email: err.error.email } });
          return;
        }

        // Handle different error response formats
        if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = err.error?.message || err.message || 'Invalid credentials. Please try again.';
        }
        
        this.cdr.detectChanges(); // Ensure the error message appears immediately
      }
    });
  }
}
