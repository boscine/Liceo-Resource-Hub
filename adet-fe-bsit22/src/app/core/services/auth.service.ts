// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

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
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/login', { email, password })
      .pipe(tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        console.log(`✅ User Login | Email: ${email}`);
      }));
  }

  register(email: string, password: string, displayName: string) {
    return this.http.post<{ token: string }>('/api/auth/register', { email, password, displayName })
      .pipe(tap(res => localStorage.setItem(TOKEN_KEY, res.token)));
  }

  logout() { localStorage.removeItem(TOKEN_KEY); }
  getToken() { return localStorage.getItem(TOKEN_KEY); }
  isLoggedIn() { return !!this.getToken(); }

  forgotPassword(email: string) { return this.http.post('/api/auth/forgot-password', { email }); }
  resetPassword(token: string, password: string) { return this.http.post('/api/auth/reset-password', { token, password }); }

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