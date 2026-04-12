import { Component, ChangeDetectorRef }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';

import { NavbarComponent }   from '../../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
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
    const normalizedEmail = this.email.trim().toLowerCase();
    this.auth.forgotPassword(normalizedEmail).subscribe({
      next: () => { 
        this.loading = false; 
        this.sent = true;
        this.cdr.detectChanges();
      },
      error: (err) => { 
        this.loading = false; 
        this.error = err.error?.message || 'Something went wrong. Please try again.'; 
        this.cdr.detectChanges();
      }
    });
  }
}
