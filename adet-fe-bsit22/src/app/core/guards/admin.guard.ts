import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // 1. Check if the user is logged in and has the admin role
    const isAdmin = this.auth.isAdmin();

    if (isAdmin) {
      return true; // Allow access to the route
    }

    // 2. If not an admin, redirect to the student feed
    // This prevents default users from seeing the dashboard even if they type the URL
    return this.router.parseUrl('/feed'); 
  }
}