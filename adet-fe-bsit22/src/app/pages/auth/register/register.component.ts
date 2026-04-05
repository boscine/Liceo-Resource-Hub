import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreedToTos = false;
  error = '';
  loading = false;
  showHelp = false;

  showPassword = false;
  showConfirmPassword = false;
  isDuplicateEmail = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  isLiceoEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@liceo.edu.ph');
  }

  get isLowStrength(): boolean {
    if (!this.password) return false;
    return this.password.length < 8;
  }

  onSubmit() {
    this.error = '';
    this.isDuplicateEmail = false;

    if (!this.isLiceoEmail(this.email)) {
      this.error = 'Registration requires a valid @liceo.edu.ph university email.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters long.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (!this.agreedToTos) {
      this.error = 'You must agree to the Terms of Service to create an account.';
      return;
    }

    this.loading = true;

    // CHANGE: Call register instead of login and include displayName
    this.auth.register(this.email, this.password, this.displayName).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/verify'], { queryParams: { email: res.email } });
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'This university email is already registered.';
          this.isDuplicateEmail = true;
        } else {
          this.error = err.error?.detail || err.error?.message || 'Registration failed. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
