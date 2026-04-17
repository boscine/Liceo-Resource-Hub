import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-institutional-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './institutional-portal.component.html',
  styleUrls: ['./institutional-portal.component.scss']
})
export class InstitutionalPortalComponent {
  currentSection: 'privacy' | 'terms' | 'support' = 'privacy';

  setSection(section: 'privacy' | 'terms' | 'support') {
    this.currentSection = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
