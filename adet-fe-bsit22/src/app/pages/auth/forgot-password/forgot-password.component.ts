import { Component, ChangeDetectorRef }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email   = '';
  sent    = false;
  loading = false;
  error   = '';

  constructor(
    private auth: AuthService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error   = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { 
        this.loading = false; 
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: (err) => { 
        this.loading = false; 
        this.error = err.error?.message || 'Something went wrong. Please try again.'; 
        this.cdr.detectChanges();
      }
    });
  }
}
