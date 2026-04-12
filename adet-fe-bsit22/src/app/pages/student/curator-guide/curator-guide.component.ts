import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-curator-guide',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './curator-guide.component.html',
  styleUrls: ['./curator-guide.component.scss']
})
export class CuratorGuideComponent {
  isLoggedIn = false;
  constructor(private auth: AuthService) {
    this.isLoggedIn = this.auth.isLoggedIn();
  }
}
