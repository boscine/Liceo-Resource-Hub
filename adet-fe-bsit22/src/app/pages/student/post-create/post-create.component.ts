import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent {
  title = '';
  categoryId = '';
  description = '';
  loading = false;
  success = false;
  isAdmin = false;
  user: any = {};

  categories = [
    { id: '1', name: 'Textbook' },
    { id: '2', name: 'Notes' },
    { id: '3', name: 'Drafting Tools' },
    { id: '4', name: 'Laboratory Equipment' },
    { id: '5', name: 'Art Supplies' },
    { id: '6', name: 'Calculator' },
    { id: '7', name: 'USB / Storage' },
    { id: '8', name: 'Other' },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }
  }

  onSubmit() {
    this.loading = true;
    // TODO: connect to API
    setTimeout(() => { this.loading = false; this.success = true; }, 1000);
  }
}