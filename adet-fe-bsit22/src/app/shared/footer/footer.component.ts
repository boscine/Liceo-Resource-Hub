import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="app-footer">
      <div class="footer-brand">
        Liceo Resource Hub
        <span>© 2026 The Academic Curator.</span>
      </div>
      <div class="footer-links">
        <a routerLink="/portal" [queryParams]="{ section: 'privacy' }">Privacy Policy</a>
        <a routerLink="/portal" [queryParams]="{ section: 'terms' }">Terms of Service</a>
        <a href="https://liceo.edu.ph" target="_blank">University Portal</a>
        <a routerLink="/portal" [queryParams]="{ section: 'support' }">Contact Support</a>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
