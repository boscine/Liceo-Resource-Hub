import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { FooterComponent }              from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  agreedToTos = false;
  loading = false;
  showHelp = false;
  showToS = false;

  errors: string[] = [];

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) { }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  toggleToS() {
    this.showToS = !this.showToS;
  }

  isLiceoEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@liceo\.edu\.ph$/;
    return regex.test(email.toLowerCase());
  }

  get isLowStrength(): boolean {
    if (!this.password) return false;
    return this.password.length < 8;
  }

  onSubmit() {
    if (this.loading) return;
    this.errors = [];
    const normalizedEmail = this.email.trim().toLowerCase();

    // Collect all local validation errors
    if (!this.isLiceoEmail(normalizedEmail)) {
      this.errors.push('Registration requires a valid @liceo.edu.ph university email.');
    }

    if (!this.phone || this.phone.length < 10) {
      this.errors.push('Contact number must be at least 10 digits.');
    }

    if (this.password.length < 8) {
      this.errors.push('Password must be at least 8 characters long.');
    }

    if (this.password !== this.confirmPassword) {
      this.errors.push('Passwords do not match.');
    }

    if (!this.agreedToTos) {
      this.errors.push('You must agree to the Terms of Service to create an account.');
    }

    if (this.errors.length > 0) {
      this.toast.error('Please resolve the institutional requirements listed below.');
      return;
    }

    this.loading = true;

    this.auth.register(normalizedEmail, this.password, '', this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Registration successful! Please verify your student email to activate your account.');
        this.cdr.detectChanges();
        this.router.navigate(['/verify'], { queryParams: { email: res.email } });
      },
      error: (err) => {
        this.loading = false;
        // Generic server errors are handled by error.interceptor.ts toast
        console.error('[Registration Error]:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
