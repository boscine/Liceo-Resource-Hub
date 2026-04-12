import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ac_theme';
  
  // Using signals for modern state management in Angular 18
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.loadTheme();
  }

  private authState = false;

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    this.saveTheme();
    this.applyTheme();
  }

  setLightMode() {
    this.isDarkMode.set(false);
    this.saveTheme();
    this.applyTheme();
  }

  // Set the authentication state to determine if dark mode should be active
  syncAuthState(isLoggedIn: boolean) {
    this.authState = isLoggedIn;
    this.applyTheme();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
    this.applyTheme();
  }

  private saveTheme() {
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme() {
    // Only apply dark theme if the user is logged in
    if (this.isDarkMode() && this.authState) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
