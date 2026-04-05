import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService }        from '../../../core/services/api.service';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="edit-page">
  <header class="app-nav"><div class="nav-inner"><a class="nav-brand" routerLink="/">Liceo Resource Hub</a><nav class="nav-links"><a routerLink="/feed">Requests</a></nav></div></header>
  <main class="edit-main">
    <div class="edit-inner">
      <a routerLink="/feed" class="breadcrumb"><span class="material-symbols-outlined">arrow_back</span> Back to Feed</a>
      
      <div class="page-header" *ngIf="!loadingMeta">
        <h1>Edit <em class="serif-italic">Resource Request</em></h1>
        <p>Update the status or details of your material request.</p>
      </div>

      <div class="loading-state" *ngIf="loadingMeta" style="padding: 3rem; text-align: center;">
        Loading request details...
      </div>

      <div class="form-card" *ngIf="!loadingMeta">
        <form (ngSubmit)="onSubmit()" #editForm="ngForm" class="edit-form">
          <div class="field"><label class="field-label" for="title">Request Title</label><input class="input-academic" id="title" type="text" [(ngModel)]="title" name="title" required/></div>
          <div class="field">
            <label class="field-label" for="category">Category</label>
            <div class="select-wrap">
              <select class="input-academic" id="category" [(ngModel)]="categoryId" name="category" required>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
              <span class="material-symbols-outlined select-icon">expand_more</span>
            </div>
          </div>
          <div class="field"><label class="field-label" for="description">Details</label><textarea class="input-academic" id="description" [(ngModel)]="description" name="description" rows="5" required></textarea></div>
          <div class="status-field">
            <label class="field-label">Post Status <span style="font-weight:400; color:#570000; font-size:0.8rem; margin-left: 0.5rem;">(Change this when your request is answered)</span></label>
            <div class="status-options">
              <label class="status-option" *ngFor="let s of statuses" [class.selected]="status === s.value">
                <input type="radio" [(ngModel)]="status" [value]="s.value" name="status"/>
                {{ s.label }}
              </label>
            </div>
          </div>
          <div class="form-actions">
            <a routerLink="/feed" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-primary" [disabled]="saving || !editForm.valid">
              <span *ngIf="!saving">Save Changes</span>
              <span *ngIf="!saving" class="material-symbols-outlined">save</span>
              <span *ngIf="saving" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
  <footer class="app-footer"><div class="footer-brand">Liceo de Cagayan University<span>© 2026 The Academic Curator.</span></div></footer>
</div>`,
  styleUrls: ['../post-create/post-create.component.scss'],
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
    { value: 'open', label: 'Open' }, 
    { value: 'fulfilled', label: 'Fulfilled' }, 
    { value: 'closed', label: 'Closed' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
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
        this.router.navigate(['/feed']);
      },
      error: (e) => {
        console.error(e);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
