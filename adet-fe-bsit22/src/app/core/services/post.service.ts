import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  private _posts = new BehaviorSubject<any[]>([]);
  private _categories = new BehaviorSubject<any[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);
  
  posts$ = this._posts.asObservable();
  categories$ = this._categories.asObservable();
  loading$ = this._loading.asObservable();

  private _categoriesLoaded = false;
  private _activeRequests = 0;

  constructor(private api: ApiService) {}

  private startLoading() {
    this._activeRequests++;
    this._loading.next(true);
  }

  private stopLoading() {
    this._activeRequests = Math.max(0, this._activeRequests - 1);
    if (this._activeRequests === 0) {
      this._loading.next(false);
    }
  }

  private _pagination = new BehaviorSubject<any>(null);
  pagination$ = this._pagination.asObservable();

  /**
   * Loads posts from API and updates state.
   */
  getPosts(page = 1, limit = 12, forceRefresh = false, categories?: string[], viewMode?: string, savedIds?: number[], sortBy?: string): void {
    if (!forceRefresh && this._posts.getValue().length > 0 && page === 1) {
      return; 
    }

    this.startLoading();
    let url = `/posts?page=${page}&limit=${limit}`;
    if (categories && categories.length > 0) {
      url += `&category=${encodeURIComponent(categories.join(','))}`;
    }
    if (viewMode && viewMode !== 'all') url += `&viewMode=${viewMode}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (viewMode === 'saved' && savedIds && savedIds.length > 0) {
      url += `&savedIds=${savedIds.join(',')}`;
    }

    this.api.get<any>(url).pipe(
      finalize(() => this.stopLoading())
    ).subscribe({
      next: (res) => {
        if (res && res.posts) {
          this._posts.next(res.posts);
          this._pagination.next(res.pagination);
        } else {
          this._posts.next(res);
        }
      },
      error: (e) => console.error('Institutional Post Sync Failed:', e)
    });
  }

  refreshPosts(): void {
    this.getPosts(1, 12, true);
  }

  getCategories(): void {
    if (this._categoriesLoaded && this._categories.getValue().length > 0) {
      return;
    }

    this.startLoading();
    this.api.get<any[]>('/categories').pipe(
      finalize(() => this.stopLoading())
    ).subscribe({
      next: (data) => {
        this._categories.next(data);
        this._categoriesLoaded = true;
      },
      error: (e) => console.error('Academic Category Sync Failed:', e)
    });
  }

  private _reports = new BehaviorSubject<any[]>([]);
  reports$ = this._reports.asObservable();

  getAdminPosts(): void {
    this.startLoading();
    this.api.get<any[]>('/admin/posts').pipe(
      finalize(() => this.stopLoading())
    ).subscribe({
      next: (data) => this._posts.next(data),
      error: (e) => console.error('Admin Post Archive Sync Failed:', e)
    });
  }

  getAdminReports(): void {
    this.startLoading();
    this.api.get<any[]>('/admin/reports').pipe(
      finalize(() => this.stopLoading())
    ).subscribe({
      next: (data) => this._reports.next(data),
      error: (e) => console.error('Admin Report Archive Sync Failed:', e)
    });
  }

  removePostLocal(id: string | number): void {
    const current = this._posts.getValue();
    this._posts.next(current.filter(p => p.id !== id));
  }

  updateStatus(post: any, status: string): Observable<any> {
    const payload = {
      title: post.title,
      description: post.description,
      categoryId: post.categoryId || 1, // Fallback if necessary
      status: status
    };
    return this.api.put(`/posts/${post.id}`, payload);
  }

  updatePostLocal(updatedPost: any): void {
    const current = this._posts.getValue();
    const index = current.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      const newPosts = [...current];
      newPosts[index] = { ...newPosts[index], ...updatedPost };
      this._posts.next(newPosts);
    }
  }
}
