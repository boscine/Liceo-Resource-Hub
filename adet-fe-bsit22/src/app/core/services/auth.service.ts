// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { ThemeService } from './theme.service';

const TOKEN_KEY = 'token';

// src/app/core/services/auth.service.ts

export interface TokenPayload { // Add 'export' so it's accessible elsewhere
  id: number;
  role: 'student' | 'admin';
  exp: number;
  email?: string;
  name?: string;
  displayName?: string;   // camelCase fallback
  display_name?: string;  // ← actual field the backend signs
  contacts?: { type: string; value: string }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private themeService: ThemeService) { }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/login', { email, password })
      .pipe(tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        console.log(`✅ User Login | Email: ${email}`);
      }));
  }

  register(email: string, password: string, displayName: string) {
    return this.http.post<{ message: string; email: string }>('/api/auth/register', { email, password, displayName });
  }

  verify(email: string, code: string) {
    return this.http.post<{ token: string; role: string; message: string }>('/api/auth/verify', { email, code })
      .pipe(tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
      }));
  }

  resendVerificationCode(email: string) {
    return this.http.post('/api/auth/resend-verify', { email });
  }

  logout() { 
    localStorage.removeItem(TOKEN_KEY); 
    this.themeService.setLightMode();
  }
  getToken() { return localStorage.getItem(TOKEN_KEY); }
  isLoggedIn() { return !!this.getToken(); }

  forgotPassword(email: string) { return this.http.post('/api/auth/forgot-password', { email }); }
  resetPassword(email: string, token: string, password: string) { return this.http.post('/api/auth/reset-password', { email, token, password }); }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try { return jwtDecode<TokenPayload>(token).role === 'admin'; } catch { return false; }
  }

  getUser(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try { return jwtDecode<TokenPayload>(token); } catch { return null; }
  }
}