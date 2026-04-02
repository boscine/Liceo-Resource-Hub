import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  constructor(private auth: AuthService) {}

  onSubmit() {
    this.loading = true;
    this.error   = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: () => { this.loading = false; this.error = 'Something went wrong. Please try again.'; }
    });
  }
}
