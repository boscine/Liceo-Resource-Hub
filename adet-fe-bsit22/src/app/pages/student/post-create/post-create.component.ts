import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { PostService } from '../../../core/services/post.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  title = '';
  categoryId = '';
  description = '';
  imageUrl = '';
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
    private toast: ToastService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
    }
    
    this.catSub = this.postService.categories$.subscribe((cats: any[]) => {
      this.categories = [...cats].sort((a, b) => {
        if (a.name === 'Miscellaneous Resources') return 1;
        if (b.name === 'Miscellaneous Resources') return -1;
        return a.name.localeCompare(b.name);
      });
      this.cdr.detectChanges();
    });

    this.postService.getCategories();
  }

  ngOnDestroy() {
    if (this.catSub) this.catSub.unsubscribe();
  }

  getCategoryIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Academic Textbooks': 'auto_stories',
      'Lecture Chronicles': 'history_edu',
      'Scientific Apparatus': 'biotech',
      'Computing & Digital Assets': 'terminal',
      'Mathematical Instruments': 'calculate',
      'Technical & Vocational Tools': 'construction',
      'Artistic Tools & Mediums': 'palette',
      'Clinical & Medical Supplies': 'medical_services',
      'Physical Education Kits': 'fitness_center',
      'Institutional Equipment': 'account_balance',
      'Scholarly Manuscripts': 'menu_book',
      'Miscellaneous Resources': 'extension'
    };
    return icons[name] || 'label';
  }

  onSubmit() {
    if (this.loading || !this.title || !this.categoryId || !this.description) return;

    this.loading = true;
    this.api.post('/posts', { 
      title: this.title, 
      categoryId: parseInt(this.categoryId, 10), 
      description: this.description,
      imageUrl: this.imageUrl
    }).subscribe({
      next: () => {
        this.postService.refreshPosts();
        this.notifService.refresh();
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