import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { ApiService }     from '../../../core/services/api.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
  activeTab   = 'ALL';
  searchQuery = '';
  tabs        = ['ALL', 'FLAGGED', 'REMOVED'];
  posts: any[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAdminPosts();
  }

  loadAdminPosts() {
    this.api.get<any[]>('/posts').subscribe(res => {
      // Map API post model to Admin local structures implicitly
      this.posts = res.map(p => ({
        ...p,
        flagged: p.status === 'FLAGGED',
        removed: p.status === 'REMOVED',
        reports: 0 // report counter mock
      }));
      this.cdr.detectChanges();
    });
  }

  setTab(tab: string) { this.activeTab = tab; }

  getFiltered() {
    let list = this.posts;
    if (this.activeTab === 'FLAGGED') list = list.filter(p => p.flagged);
    if (this.activeTab === 'REMOVED') list = list.filter(p => p.removed);
    if (this.searchQuery) list = list.filter(p => p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || p.id.toString().includes(this.searchQuery.toLowerCase()));
    return list;
  }

  // Live DB Updates via standard Put
  flag(post: any)    { this._setStatus(post, post.flagged ? 'open' : 'flagged'); }
  remove(post: any)  { this._setStatus(post, 'removed'); }
  restore(post: any) { this._setStatus(post, 'open'); }

  private _setStatus(post: any, newStatus: string) {
    // Optimistic UI updates
    post.status = newStatus.toUpperCase();
    post.flagged = (newStatus === 'flagged');
    post.removed = (newStatus === 'removed');

    // Persist
    this.api.put(`/posts/${post.id}`, { status: newStatus }).subscribe({
      next: () => {},
      error: (e) => { console.error('Failed modifying post state.', e); }
    });
  }
}
