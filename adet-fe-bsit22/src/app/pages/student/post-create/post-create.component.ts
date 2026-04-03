import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
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

  categories: any[] = [];

  constructor(private auth: AuthService, private api: ApiService) { }

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }

    // Fetch actual categories from DB
    this.api.get<any[]>('/categories').subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  onSubmit() {
    this.loading = true;

    const payload = {
      title: this.title,
      categoryId: this.categoryId,
      description: this.description
    };

    this.api.post('/posts', payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to create post', err);
        alert('Failed to submit request. Please try again.');
      }
    });
  }
}