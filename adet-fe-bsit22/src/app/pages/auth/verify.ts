import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

import { NavbarComponent }   from '../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../shared/footer/footer.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
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
    private toast: ToastService
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
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  resendCode() {
    if (!this.email) return;
    this.auth.resendVerificationCode(this.email.trim().toLowerCase()).subscribe({
      next: () => this.toast.info('A new verification code has been dispatched to your email.'),
      error: () => {}
    });
  }
}
