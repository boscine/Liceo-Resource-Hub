import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';

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
      <div class="page-header">
        <h1>Edit <em class="serif-italic">Resource Request</em></h1>
        <p>Update the details of your material request.</p>
      </div>
      <div class="form-card">
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
            <label class="field-label">Post Status</label>
            <div class="status-options">
              <label class="status-option" *ngFor="let s of statuses" [class.selected]="status === s.value">
                <input type="radio" [(ngModel)]="status" [value]="s.value" name="status"/>
                {{ s.label }}
              </label>
            </div>
          </div>
          <div class="form-actions">
            <a routerLink="/feed" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-primary" [disabled]="loading || !editForm.valid">
              <span *ngIf="!loading">Save Changes</span>
              <span *ngIf="!loading" class="material-symbols-outlined">save</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
  <footer class="app-footer"><div class="footer-brand">Liceo de Cagayan University<span>© 2024 The Academic Curator.</span></div></footer>
</div>`,
  styleUrls: ['../post-create/post-create.component.scss'],
})
export class PostEditComponent implements OnInit {
  title       = 'Organic Chemistry 4th Ed. (Smith)';
  categoryId  = '1';
  description = 'Looking for a physical copy to borrow for the midterms.';
  status      = 'open';
  loading     = false;
  categories  = [{ id: '1', name: 'Textbook' }, { id: '2', name: 'Notes' }, { id: '3', name: 'Drafting Tools' }, { id: '4', name: 'Laboratory Equipment' }, { id: '5', name: 'Art Supplies' }, { id: '6', name: 'Calculator' }, { id: '7', name: 'USB / Storage' }, { id: '8', name: 'Other' }];
  statuses    = [{ value: 'open', label: 'Open' }, { value: 'fulfilled', label: 'Fulfilled' }, { value: 'closed', label: 'Closed' }];
  ngOnInit()  { /* TODO: load post from API */ }
  onSubmit()  { this.loading = true; setTimeout(() => this.loading = false, 1000); }
}
