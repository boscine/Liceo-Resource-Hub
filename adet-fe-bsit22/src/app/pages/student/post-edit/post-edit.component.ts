import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { ApiService }        from '../../../core/services/api.service';
import { AuthService }       from '../../../core/services/auth.service';
import { ToastService }      from '../../../core/services/toast.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './post-edit.component.html',
  styleUrls: ['../post-create/post-create.component.scss'],
  styles: [`
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 0.25rem;
    }
    .status-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      background: var(--surface-container-low);
      border: 2px solid var(--outline-variant);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

      input { position: absolute; opacity: 0; pointer-events: none; }

      .material-symbols-outlined {
        font-size: 24px;
        color: var(--outline);
        transition: all 0.3s;
      }

      .chip-label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--on-surface-variant);
      }

      &:hover {
        border-color: var(--secondary);
        background: rgba(197, 160, 33, 0.04);
        transform: translateY(-2px);
      }

      &.active {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        .material-symbols-outlined { transform: scale(1.1); font-variation-settings: 'FILL' 1; }

        &.chip-open {
          background: rgba(197, 160, 33, 0.1); border-color: var(--secondary);
          .material-symbols-outlined, .chip-label { color: var(--secondary); }
        }
        &.chip-fulfilled {
          background: rgba(46, 125, 50, 0.08); border-color: #2e7d32;
          .material-symbols-outlined, .chip-label { color: #2e7d32; }
        }
        &.chip-closed {
          background: rgba(87, 0, 0, 0.06); border-color: var(--primary);
          .material-symbols-outlined, .chip-label { color: var(--primary); }
        }
      }
    }
    @media (max-width: 640px) {
      .status-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PostEditComponent implements OnInit {
  postId      = '';
  title       = '';
  categoryId  = '1';
  description = '';
  imageUrl    = '';
  status      = 'open';

  loadingMeta = true;
  saving      = false;

  // Direct Upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;
  uploadProgress = false;

  categories: any[] = [];
  statuses    = [
    { value: 'open',      label: 'Open',      icon: 'radio_button_checked' },
    { value: 'fulfilled', label: 'Fulfilled',  icon: 'check_circle' },
    { value: 'closed',    label: 'Closed',     icon: 'cancel' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  hasContactInfo = true;
  checkingProfile = true;
  isAdmin = false;

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    this.isAdmin = this.auth.isAdmin();

    if (this.postId) {
      this.checkProfile();
      this.loadMeta();
    }
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
        this.hasContactInfo = false;
        this.checkingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
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

  loadMeta() {
    this.api.get<any[]>('/categories').subscribe({
      next: (cats) => {
        this.categories = [...cats].sort((a, b) => {
          if (a.name === 'Miscellaneous Resources') return 1;
          if (b.name === 'Miscellaneous Resources') return -1;
          return a.name.localeCompare(b.name);
        });
        this.loadPost();
      },
      error: (e) => console.error(e)
    });
  }

  loadPost() {
    this.api.get<any>(`/posts/${this.postId}`).subscribe({
      next: (res) => {
        this.title       = res.title;
        this.description = res.description;
        this.imageUrl    = res.imageUrl || '';
        // If it's an internal server path, show as existing preview
        if (this.imageUrl) this.previewUrl = this.imageUrl;
        this.status      = res.status.toLowerCase();
        const found = this.categories.find(c => c.name.trim().toUpperCase() === res.category.trim().toUpperCase());
        this.categoryId  = found ? found.id.toString() : (this.categories[0]?.id?.toString() || '1');
        this.loadingMeta = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to grab post info', err);
        this.loadingMeta = false;
        this.cdr.detectChanges();
      }
    });
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

  onDragLeave() { this.isDragOver = false; }

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
    if (this.previewUrl && this.selectedFile) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl   = URL.createObjectURL(file);
    this.imageUrl     = '';
    this.cdr.detectChanges();
  }

  removeImage() {
    if (this.selectedFile && this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = null;
    this.previewUrl   = null;
    this.imageUrl     = '';
    this.cdr.detectChanges();
  }

  // ── Submission ────────────────────────────────────────────────────────────
  onSubmit() {
    if (this.saving) return;
    this.saving = true;

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
        return this.api.put(`/posts/${this.postId}`, {
          title: this.title,
          categoryId: parseInt(this.categoryId, 10),
          description: this.description,
          imageUrl: res.url || '',
          status: this.status
        });
      })
    ).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Your academic request has been updated.');
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.uploadProgress = false;
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
