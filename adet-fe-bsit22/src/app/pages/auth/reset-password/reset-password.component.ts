import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';

import { FooterComponent }   from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
<div class="auth-centered-page">
  
  <main class="auth-main" style="padding-top: 40px;">
    <div class="auth-card">
      <div class="auth-icon"><span class="material-symbols-outlined">restart_alt</span></div>
      <h2>Archival Restoration</h2>
      
      <div *ngIf="!tokenPresent" style="text-align: center; margin: 30px 0;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: #570000; margin-bottom: 15px; display: block;">link_off</span>
        <p style="color: #570000; font-weight: bold;">Invalid Cryptographic Link</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">This credential restoration link is broken or missing secure parameters. It cannot be used.</p>
        <div style="margin-top: 25px;">
           <a routerLink="/forgot-password" style="text-decoration: underline; color: #800000; font-weight: bold; font-size: 14px;">Request a New Link</a>
        </div>
      </div>

      <div *ngIf="tokenPresent">
        <p>Your scholarly credentials for <strong>{{ email }}</strong> are ready for restoration. Enter your new password below.</p>
        
        <div class="error-box" *ngIf="error"><span class="material-symbols-outlined">error</span>{{ error }}</div>
        
        <form (ngSubmit)="onSubmit()" #rpForm="ngForm">
          <div class="field">
            <label class="field-label" for="pw">New Scholarly Password</label>
            <input class="input-academic" id="pw" type="password" [(ngModel)]="password" name="pw" required minlength="8"/>
          </div>

          <div class="field">
            <label class="field-label" for="cpw">Confirm Password</label>
            <input class="input-academic" id="cpw" type="password" [(ngModel)]="confirm" name="cpw" required/>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !rpForm.valid">
            <span *ngIf="!loading">Restore Access</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>
      </div>
      <div class="back-link"><a routerLink="/login">← Back to Login</a></div>
    </div>
  </main>
  <app-footer></app-footer>
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
  tokenPresent = false;

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() { 
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (this.token) this.tokenPresent = true;
  }

  onSubmit() {
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    if (!this.token) { this.error = 'Restoration token is missing.'; return; }
    
    this.loading = true;
    this.error = '';
    
    this.auth.resetPassword(this.email, this.token, this.password).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { restored: true } }),
      error: (err) => { 
        this.loading = false; 
        this.error = err.error?.message || 'Invalid or expired restoration link.'; 
      }
    });
  }
}
