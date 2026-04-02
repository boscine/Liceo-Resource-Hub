import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="auth-centered-page">
  <header class="app-nav"><div class="nav-inner"><a class="nav-brand" routerLink="/">Liceo Resource Hub</a></div></header>
  <main class="auth-main">
    <div class="auth-card">
      <div class="auth-icon"><span class="material-symbols-outlined">lock</span></div>
      <h2>New Password</h2>
      <p>Enter a new password for your Liceo account.</p>
      <div class="error-box" *ngIf="error"><span class="material-symbols-outlined">error</span>{{ error }}</div>
      <form (ngSubmit)="onSubmit()" #rpForm="ngForm">
        <div class="field">
          <label class="field-label" for="pw">New Password</label>
          <input class="input-academic" id="pw" type="password" [(ngModel)]="password" name="pw" placeholder="••••••••" required minlength="8"/>
        </div>
        <div class="field">
          <label class="field-label" for="cpw">Confirm Password</label>
          <input class="input-academic" id="cpw" type="password" [(ngModel)]="confirm" name="cpw" placeholder="••••••••" required/>
        </div>
        <button type="submit" class="btn-primary" [disabled]="loading || !rpForm.valid">
          <span *ngIf="!loading">Set New Password</span>
          <span *ngIf="!loading" class="material-symbols-outlined">check</span>
          <span *ngIf="loading" class="spinner"></span>
        </button>
      </form>
      <div class="back-link"><a routerLink="/login">← Back to Login</a></div>
    </div>
  </main>
</div>`,
  styleUrls: ['../forgot-password/forgot-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirm  = '';
  token    = '';
  loading  = false;
  error    = '';

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() { this.token = this.route.snapshot.queryParams['token'] || ''; }

  onSubmit() {
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => { this.loading = false; this.error = 'Reset link is invalid or expired.'; }
    });
  }
}
