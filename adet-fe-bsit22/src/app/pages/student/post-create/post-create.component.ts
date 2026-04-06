import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { PostService } from '../../../core/services/post.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  title = '';
  categoryId = '';
  description = '';
  loading = false;
  success = false;
  isAdmin = false;
  user: any = {};

  categories: any[] = [];
  private catSub?: Subscription;

  constructor(
    private auth: AuthService, 
    private api: ApiService, 
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }
    
    // Use stateful categories
    this.catSub = this.postService.categories$.subscribe(cats => {
      this.categories = cats;
      this.cdr.detectChanges();
    });

    this.postService.getCategories();
  }

  ngOnDestroy() {
    if (this.catSub) this.catSub.unsubscribe();
  }

  onSubmit() {
    if (!this.title || !this.categoryId || !this.description) return;

    this.loading = true;
    this.api.post('/posts', { 
      title: this.title, 
      categoryId: parseInt(this.categoryId, 10), 
      description: this.description 
    }).subscribe({
      next: () => {
        // Trigger a background refresh of the post list so the Feed is ready
        this.postService.refreshPosts();
        
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();

        // Redirect back to feed after showing success message
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