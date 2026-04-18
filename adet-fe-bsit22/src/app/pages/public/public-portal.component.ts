import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-public-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './public-portal.component.html',
  styleUrls: ['./public-portal.component.scss']
})
export class PublicPortalComponent implements OnInit {
  currentSection: 'privacy' | 'terms' | 'support' = 'privacy';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section === 'privacy' || section === 'terms' || section === 'support') {
        this.currentSection = section;
      }
    });
  }

  setSection(section: 'privacy' | 'terms' | 'support') {
    this.currentSection = section;
  }
}
