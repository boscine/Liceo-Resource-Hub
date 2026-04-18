import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  constructor(private api: ApiService) {}

  /**
   * Loads posts from API and updates state.
   * Only fetches if state is empty or if forceRefresh is true.
   */
  getPosts(forceRefresh = false): void {
    if (!forceRefresh && this._posts.getValue().length > 0) {
      return; 
    }

    this._loading.next(true);
    this.api.get<any[]>('/posts').subscribe({
      next: (data) => {
        this._posts.next(data);
        this._loading.next(false);
      },
      error: (e) => {
        console.error('Failed to sync posts', e);
        this._loading.next(false);
      }
    });
  }

  /**
   * Refreshes the post list manually (e.g. after a new post is created)
   */
  refreshPosts(): void {
    this.getPosts(true);
  }

  /**
   * Loads allowed categories. Caches results to prevent redundant calls.
   */
  getCategories(): void {
    if (this._categoriesLoaded && this._categories.getValue().length > 0) {
      return;
    }

    this.api.get<any[]>('/categories').subscribe({
      next: (data) => {
        this._categories.next(data);
        this._categoriesLoaded = true;
      },
      error: (e) => console.error('Failed to fetch categories', e)
    });
  }

  private _reports = new BehaviorSubject<any[]>([]);
  reports$ = this._reports.asObservable();

  /**
   * Loads ALL posts for admins (including removed/flagged)
   */
  getAdminPosts(): void {
    this.api.get<any[]>('/admin/posts').subscribe({
      next: (data) => this._posts.next(data),
      error: (e) => console.error('Admin sync failed', e)
    });
  }

  /**
   * Loads pending reports for admins
   */
  getAdminReports(): void {
    this.api.get<any[]>('/admin/reports').subscribe({
      next: (data) => this._reports.next(data),
      error: (e) => console.error('Failed to sync reports', e)
    });
  }

  /**
   * Optimistically deletes a post from the local state
   */
  removePostLocal(id: string | number): void {
    const current = this._posts.getValue();
    this._posts.next(current.filter(p => p.id !== id));
  }

  /**
   * Syncs a single post update locally without full refresh
   */
  updatePostLocal(updatedPost: any): void {
    const current = this._posts.getValue();
    const index = current.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedPost };
      this._posts.next([...current]);
    }
  }
}
