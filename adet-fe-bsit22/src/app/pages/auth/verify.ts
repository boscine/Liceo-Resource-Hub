import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify.html',
  styles: [`
    .verify-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--surface); }
    .verify-card { 
      background: var(--surface-container-lowest); padding: 3rem; border-radius: var(--radius-lg); 
      box-shadow: var(--shadow-card); width: 100%; max-width: 450px; text-align: center;
      animation: fadeUp 0.5s ease both;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    h2 { font-family: var(--font-headline); font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: var(--on-surface-variant); margin-bottom: 2rem; }
    .v-input { 
      font-size: 2rem; letter-spacing: 0.4em; text-align: center; border: none; 
      border-bottom: 2px solid var(--secondary-container); background: none; 
      width: 100%; margin-bottom: 1rem; color: var(--primary); font-weight: 700;
      &:focus { outline: none; border-bottom-color: var(--primary); }
    }
    .error-box { 
      background: var(--error-container); color: var(--error); padding: 0.75rem; 
      border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1.5rem; 
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .resend-link { font-size: 0.8rem; color: var(--on-surface-variant); margin-top: 1.5rem; display: block; }
    .resend-link a { color: var(--primary); font-weight: 700; cursor: pointer; text-transform: uppercase; text-decoration: none; }
    .btn-primary { 
      width: 100%; padding: 1rem; border-radius: var(--radius-pill); 
      background: var(--primary); color: white; border: none; font-weight: 600; 
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `],
})
export class VerifyComponent implements OnInit {
  email = '';
  code = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (!this.code || this.code.length < 6) return;
    this.error = '';
    this.loading = true;

    this.auth.verify(this.email, this.code).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Verification failed. Try again.';
      }
    });
  }
}
