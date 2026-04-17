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
        <a routerLink="/public" [queryParams]="{ section: 'privacy' }" class="scholarly-link">Privacy Policy</a>
        <a routerLink="/public" [queryParams]="{ section: 'terms' }" class="scholarly-link">Terms of Service</a>
        <a href="https://liceo.edu.ph" target="_blank" class="scholarly-link">University Portal</a>
        <a routerLink="/public" [queryParams]="{ section: 'support' }" class="scholarly-link">Contact Support</a>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
