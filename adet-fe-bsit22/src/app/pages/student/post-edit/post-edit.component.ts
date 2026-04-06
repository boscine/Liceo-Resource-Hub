import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService }        from '../../../core/services/api.service';
import { ToastService }      from '../../../core/services/toast.service';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="create-page">
  <header class="app-nav">
    <div class="nav-inner">
      <a class="nav-brand" routerLink="/">Liceo Resource Hub</a>
      <nav class="nav-links">
        <a routerLink="/feed">Requests</a>
        <a routerLink="/curator-guide">Protocol</a>
      </nav>
    </div>
  </header>

  <main class="create-main">
    <div class="create-inner">
      <a routerLink="/feed" class="breadcrumb">
        <span class="material-symbols-outlined">arrow_back</span> Return to feed
      </a>
      
      <div class="page-header" *ngIf="!loadingMeta">
        <div class="header-badge">
          <span class="material-symbols-outlined">edit_note</span>
          <span class="badge-text">Modification Portal</span>
        </div>
        <h1>Edit <em class="serif-italic">Resource Request</em></h1>
        <p>Update the status or specific details of your scholarly request to keep the academic community informed.</p>
      </div>

      <div class="loading-state" *ngIf="loadingMeta" style="padding: 5rem 0; text-align: center; color: var(--outline);">
        <div class="spinner" style="margin: 0 auto 1.5rem; border-top-color: var(--primary);"></div>
        <p class="serif-italic" style="font-size: 1.2rem;">Curating your request details...</p>
      </div>

      <div class="form-card" *ngIf="!loadingMeta">
        <form (ngSubmit)="onSubmit()" #editForm="ngForm" class="create-form">
          
          <div class="field">
            <label class="field-label" for="title">Request Title</label>
            <input class="input-academic" id="title" type="text" [(ngModel)]="title" name="title" placeholder="e.g., Engineering Drawing Set" required/>
          </div>

          <div class="field">
            <label class="field-label" for="category">Academic Category</label>
            <div class="select-wrap">
              <select class="input-academic" id="category" [(ngModel)]="categoryId" name="category" required>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
              <span class="material-symbols-outlined select-icon">expand_more</span>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="description">
              Specific Details
              <span class="char-counter" [class.near-limit]="description.length > 450">{{ description.length }}/500</span>
            </label>
            <textarea class="input-academic" id="description" [(ngModel)]="description" name="description" rows="5" maxlength="500" placeholder="Describe current condition, duration of use, or specific location..." required></textarea>
          </div>

          <div class="field">
            <label class="field-label">Current Status</label>
            <div class="status-grid">
              <label class="status-chip" *ngFor="let s of statuses" 
                     [class.active]="status === s.value"
                     [class.chip-open]="s.value === 'open'"
                     [class.chip-fulfilled]="s.value === 'fulfilled'"
                     [class.chip-closed]="s.value === 'closed'">
                <input type="radio" [(ngModel)]="status" [value]="s.value" name="status"/>
                <span class="material-symbols-outlined">{{ s.icon }}</span>
                <span class="chip-label">{{ s.label }}</span>
              </label>
            </div>
          </div>

          <div class="privacy-notice">
            <span class="material-symbols-outlined privacy-icon">verified_user</span>
            <div>
              <h4>Scholarly Integrity</h4>
              <p>Updating your post status to 'Fulfilled' helps other curators know your request has been met and preserves the platform's efficiency.</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving || !editForm.valid">
              <span *ngIf="!saving">Publish Updates</span>
              <span *ngIf="!saving" class="material-symbols-outlined">cloud_upload</span>
              <span *ngIf="saving" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <div class="help-section" *ngIf="!loadingMeta">
        <p class="help-text">Need to remove this request entirely? Use the <a routerLink="/feed">Delete Option</a> on your dashboard.</p>
      </div>
    </div>
  </main>

  <footer class="app-footer">
    <div class="footer-brand">Liceo de Cagayan University<span>© 2026 The Academic Curator.</span></div>
  </footer>
</div>`,
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
    .btn-primary {
      width: 100%;
      height: 4rem !important;
      font-size: 1rem !important;
      border-radius: var(--radius-full) !important;
    }
    .breadcrumb {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: opacity 0.2s;
      &:hover { opacity: 0.7; }
      .material-symbols-outlined { font-size: 20px; }
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
  status      = 'open';
  
  loadingMeta = true;
  saving      = false;
  
  categories: any[] = [];
  statuses    = [
    { value: 'open', label: 'Open', icon: 'radio_button_checked' }, 
    { value: 'fulfilled', label: 'Fulfilled', icon: 'check_circle' }, 
    { value: 'closed', label: 'Closed', icon: 'cancel' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() { 
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    if (this.postId) {
      this.loadMeta();
    }
  }

  loadMeta() {
    this.api.get<any[]>('/categories').subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadPost();
      },
      error: (e) => console.error(e)
    });
  }

  loadPost() {
    this.api.get<any>(`/posts/${this.postId}`).subscribe({
      next: (res) => {
        this.title = res.title;
        this.description = res.description;
        this.status = res.status.toLowerCase();
        
        // Find matching category object to extract the ID for the form select
        const found = this.categories.find(c => c.name.toUpperCase() === res.category.toUpperCase());
        if (found) this.categoryId = found.id.toString();

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

  onSubmit() { 
    this.saving = true;
    this.api.put(`/posts/${this.postId}`, {
      title: this.title,
      categoryId: parseInt(this.categoryId, 10),
      description: this.description,
      status: this.status
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Your academic request has been updated.');
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
