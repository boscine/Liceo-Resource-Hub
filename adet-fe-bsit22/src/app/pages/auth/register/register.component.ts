import { Component } from '@angular/core';
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

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    this.error = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (!this.agreedToTos) {
      this.error = 'You must agree to the Terms of Service.';
      return;
    }

    this.loading = true;

    // CHANGE: Call register instead of login and include displayName
    this.auth.register(this.email, this.password, this.displayName).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        // Displays the backend's "Only @liceo.edu.ph emails allowed" or other error messages
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
