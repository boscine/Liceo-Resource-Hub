import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription, switchMap, of } from 'rxjs';
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

  // Direct Upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;
  uploadProgress = false;

  categories: any[] = [];
  private catSub?: Subscription;

  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private postService: PostService,
    private toast: ToastService,
    private notifService: NotificationService
  ) {}

  hasContactInfo = true;
  checkingProfile = true;
  isAdmin = false;

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUser() || {};
      this.checkProfile();
    }

    this.catSub = this.postService.categories$.subscribe((cats: any[]) => {
      this.categories = cats;
      this.cdr.detectChanges();
    });

    this.postService.getCategories();
  }

  checkProfile() {
    if (this.isAdmin) {
      this.hasContactInfo = true;
      this.checkingProfile = false;
      return;
    }

    this.api.get<any>('/profile').subscribe({
      next: (profile) => {
        this.hasContactInfo = profile.contacts && profile.contacts.length > 0;
        this.checkingProfile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasContactInfo = false; // Assume no contacts if we can't fetch profile
        this.checkingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.catSub) this.catSub.unsubscribe();
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  getCategoryIcon(name: string): string {
    const icons: { [key: string]: string } = {
      // Premium Scholarly Names
      'Academic Textbooks': 'auto_stories',
      'Lecture Chronicles': 'history_edu',
      'Laboratory & Scientific Tools': 'biotech',
      'Scientific Apparatus': 'biotech',
      'Computing & Digital Assets': 'terminal',
      'Technical & Artistic Equipment': 'palette',
      'Technical & Vocational Tools': 'construction',
      'Scholarly Manuscripts': 'menu_book',
      'Physical Education Kits': 'fitness_center',
      'Miscellaneous Resources': 'extension',
      'Mathematical Instruments': 'calculate',
      'Artistic Tools & Mediums': 'palette',
      'Clinical & Medical Supplies': 'medical_services',
      'Institutional Equipment': 'account_balance',

      // Legacy/Seed Names
      'Textbooks & Modules': 'auto_stories',
      'Study Notes & Reviewers': 'history_edu',
      'Laboratory & Science Tools': 'biotech',
      'Laptops & Gadgets': 'terminal',
      'Calculators & Math Tools': 'calculate',
      'Engineering & Tech Tools': 'construction',
      'Art & Creative Supplies': 'palette',
      'Medical & Nursing Kits': 'medical_services',
      'PE & Sports Equipment': 'fitness_center',
      'Campus & General Equipment': 'account_balance',
      'Research & Manuscripts': 'menu_book',
      'Other Academic Items': 'extension'
    };
    return icons[name] || 'bookmark';
  }

  // ── File Handling ─────────────────────────────────────────────────────────
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.processFile(input.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  processFile(file: File) {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      this.toast.error('Only JPEG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be smaller than 5MB.');
      return;
    }
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.imageUrl = '';
    this.cdr.detectChanges();
  }

  removeImage() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = null;
    this.previewUrl = null;
    this.imageUrl = '';
    this.cdr.detectChanges();
  }

  // ── Submission ────────────────────────────────────────────────────────────
  onSubmit() {
    if (this.loading || !this.title || !this.categoryId || !this.description) return;
    this.loading = true;

    const upload$ = this.selectedFile
      ? (() => {
          this.uploadProgress = true;
          const form = new FormData();
          form.append('file', this.selectedFile!);
          return this.api.upload<{ url: string }>('/upload', form);
        })()
      : of({ url: this.imageUrl });

    upload$.pipe(
      switchMap((res: { url: string }) => {
        this.uploadProgress = false;
        return this.api.post('/posts', {
          title: this.title,
          categoryId: parseInt(this.categoryId, 10),
          description: this.description,
          imageUrl: res.url || ''
        });
      })
    ).subscribe({
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
        this.uploadProgress = false;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}