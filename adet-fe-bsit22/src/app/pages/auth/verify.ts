import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

import { FooterComponent }   from '../../shared/footer/footer.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  templateUrl: './verify.html',
  styleUrls: ['./verify.scss'] // Assuming there is a verify.scss or adding styles locally
})
export class VerifyComponent implements OnInit {
  email = '';
  code = '';
  loading = false;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private route: ActivatedRoute,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.loading) return;
    if (!this.code || this.code.length < 6) {
      this.toast.error('The educational access code must be exactly 6 digits.');
      return;
    }
    this.loading = true;

    this.auth.verify(this.email.trim().toLowerCase(), this.code).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Account activated! Welcome to the Liceo Resource Hub.');
        this.cdr.detectChanges();
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        // Reset the input field for a fresh attempt
        this.code = '';
        this.cdr.detectChanges(); // <-- Critical fix to reset the submit button state
        // The errorInterceptor handles the toast message for 400/500 errors
        console.error('[Verification Error]:', err);
      }
    });
  }

  resendCode() {
    if (!this.email) return;
    this.auth.resendVerificationCode(this.email.trim().toLowerCase()).subscribe({
      next: () => this.toast.info('A new verification code has been dispatched to your email.'),
      error: (err) => {
        // Fallback toast if the interceptor is bypassed or needs specific messaging
        this.toast.error('Failed to dispatch a new code. Please try again in a few moments.');
        console.error('[Resend Error]:', err);
      }
    });
  }
}
