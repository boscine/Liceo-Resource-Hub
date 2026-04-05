import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
export class PostCreateComponent implements OnInit {
  title = '';
  categoryId = '';
  description = '';
  loading = false;
  success = false;
  isAdmin = false;
  user: any = {};

  categories: any[] = [];

  constructor(
    private auth: AuthService, 
    private api: ApiService, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }
    
    // Dynamically pull allowed categories
    this.api.get<any[]>('/categories').subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Failed to load categories', e)
    });
  }

  onSubmit() {
    this.loading = true;
    this.api.post('/posts', { 
      title: this.title, 
      categoryId: parseInt(this.categoryId, 10), 
      description: this.description 
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();

        // Elegantly shift focus back to feed after user reads the success message
        setTimeout(() => this.router.navigate(['/feed']), 1800);
      },
      error: (e) => {
        console.error('Failed creating request', e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}