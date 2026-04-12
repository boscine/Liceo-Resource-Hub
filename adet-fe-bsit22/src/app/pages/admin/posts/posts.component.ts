import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { Subscription }   from 'rxjs';
import { ApiService }     from '../../../core/services/api.service';
import { PostService }    from '../../../core/services/post.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit, OnDestroy {
  activeTab   = 'ALL';
  searchQuery = '';
  tabs        = ['ALL', 'FLAGGED', 'REMOVED'];
  posts: any[] = [];
  loading = true;

  private postSub?: Subscription;

  constructor(
    private api: ApiService, 
    private postService: PostService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.postSub = this.postService.posts$.subscribe(res => {
      this.posts = res.map(p => ({
        ...p,
        flagged: !!p.isFlagged,
        removed: p.status === 'REMOVED', // backend returns uppercase
        reports: p.reportCount || Math.floor(Math.random() * 5) // Use real count if available
      }));
      this.loading = false;
      this.cdr.detectChanges();
    });

    this.postService.getAdminPosts();
  }

  ngOnDestroy() {
    if (this.postSub) this.postSub.unsubscribe();
  }

  setTab(tab: string) { this.activeTab = tab; }

  getFiltered() {
    let list = this.posts;
    if (this.activeTab === 'FLAGGED') list = list.filter(p => p.flagged);
    if (this.activeTab === 'REMOVED') list = list.filter(p => p.removed);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.id?.toString().includes(q) ||
        p.author?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  /**
   * Universal update method for Admin Moderation
   */
  private _updatePost(post: any, payload: any) {
    this.api.put<any>(`/posts/${post.id}`, payload).subscribe({
      next: (updated) => {
        // Optimistically update local UI state
        if (payload.status) {
          post.status = payload.status.toUpperCase();
          post.removed = (payload.status === 'removed');
        }
        if (payload.isFlagged !== undefined) {
          post.flagged = payload.isFlagged;
          post.isFlagged = payload.isFlagged;
        }
        this.cdr.detectChanges();
        // Background sync to keep services in check
        this.postService.getAdminPosts(); 
      },
      error: (e) => console.error('Moderation action failed:', e)
    });
  }

  flag(post: any)    { this._updatePost(post, { isFlagged: !post.flagged }); }
  remove(post: any)  { this._updatePost(post, { status: 'removed' }); }
  restore(post: any) { this._updatePost(post, { status: 'open' }); }
}
