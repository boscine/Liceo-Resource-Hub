import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { PostService } from '../../../core/services/post.service';
import { ToastService } from '../../../core/services/toast.service';
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
  user: any = {};

  categories: any[] = [];
  private catSub?: Subscription;

  constructor(
    private auth: AuthService, 
    private api: ApiService, 
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private postService: PostService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }
    
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
        this.postService.refreshPosts();
        this.toast.success('Your academic request has been published successfully.');
        
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();

        setTimeout(() => this.router.navigate(['/feed']), 1800);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}