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
      <div class="auth-icon"><span class="material-symbols-outlined">restart_alt</span></div>
      <h2>Archival Restoration</h2>
      <p>A recovery code has been sent to {{ email }}. Enter it below along with your new credentials.</p>
      
      <div class="error-box" *ngIf="error"><span class="material-symbols-outlined">error</span>{{ error }}</div>
      
      <form (ngSubmit)="onSubmit()" #rpForm="ngForm">
        <div class="field">
          <label class="field-label" for="code">Restoration Code</label>
          <input class="input-academic" id="code" type="text" [(ngModel)]="token" name="code" placeholder="000000" maxlength="6" required/>
        </div>

        <div class="field">
          <label class="field-label" for="pw">New Scholarly Password</label>
          <input class="input-academic" id="pw" type="password" [(ngModel)]="password" name="pw" placeholder="••••••••" required minlength="8"/>
        </div>

        <div class="field">
          <label class="field-label" for="cpw">Confirm Password</label>
          <input class="input-academic" id="cpw" type="password" [(ngModel)]="confirm" name="cpw" placeholder="••••••••" required/>
        </div>

        <button type="submit" class="btn-primary" [disabled]="loading || !rpForm.valid || token.length < 6">
          <span *ngIf="!loading">Restore Access</span>
          <span *ngIf="!loading" class="material-symbols-outlined">history_edu</span>
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
  email    = '';
  password = '';
  confirm  = '';
  token    = '';
  loading  = false;
  error    = '';

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() { 
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.token = this.route.snapshot.queryParams['token'] || ''; // Fallback for links
  }

  onSubmit() {
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    this.error = '';
    
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { restored: true } }),
      error: (err) => { 
        this.loading = false; 
        this.error = err.error?.message || 'Invalid or expired restoration code.'; 
      }
    });
  }
}
