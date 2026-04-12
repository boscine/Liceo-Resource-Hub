import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-brand">
        Liceo Resource Hub
        <span>© 2026 The Academic Curator.</span>
      </div>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">University Portal</a>
        <a href="#">Contact Support</a>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
