import { Component, OnInit, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription }      from 'rxjs';
import { ApiService }        from '../../../core/services/api.service';
import { AuthService }       from '../../../core/services/auth.service';
import { PostService }       from '../../../core/services/post.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  searchQuery    = '';
  activeCategory = 'All Resources';
  categories     = ['All Resources', 'Textbooks', 'Lab Tools', 'Lecture Notes', 'Art Supplies', 'Calculator', 'USB / Storage', 'Other'];

  loading = true;
  posts: any[] = [];
  user: any = {};
  isAdmin = false;
  isNearBottom = false;
  isLoggedIn = false;
  viewMode: 'all' | 'saved' | 'requests' = 'all';
  
  currentPage = 1;
  pageSize = 12;

  savedPosts = new Set<string>();
  selectedPosts = new Set<string | number>();
  
  // Custom delete confirmation
  showDeleteConfirm = false;
  postToDelete: any = null; // null if bulk delete
  isBulkDelete = false;
  deleting = false;
  
  private postSub?: Subscription;
  private catSub?: Subscription;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const threshold = 100; 
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;
    this.isNearBottom = (position > (height - threshold));
  }

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isAdmin = this.auth.isAdmin();
    if (this.isLoggedIn) {
      this.user = this.auth.getUser() || {};
    }

    const localSaved = localStorage.getItem('ac_savedPosts');
    if (localSaved) {
      try { this.savedPosts = new Set(JSON.parse(localSaved)); } 
      catch (e) { console.error('Failed parsing saved posts', e); }
    }

    // Subscribe to stateful post stream
    this.postSub = this.postService.posts$.subscribe(data => {
      this.posts = data;
      this.loading = false;
      this.cdr.detectChanges();
    });

    // Subscribe to stateful categories stream
    this.catSub = this.postService.categories$.subscribe(data => {
      const names = data.map(c => c.name);
      this.categories = ['All Resources', ...names];
      this.cdr.detectChanges();
    });

    // Initial load (will check cache automatically)
    this.postService.getCategories();
    this.postService.getPosts();
  }

  ngOnDestroy() {
    if (this.postSub) this.postSub.unsubscribe();
    if (this.catSub) this.catSub.unsubscribe();
  }

  /** Posts filtered by the active category chip, search query, and view mode */
  get allFilteredPosts() {
    const cat = (this.activeCategory || 'All Resources').toUpperCase();
    const q   = (this.searchQuery || '').trim().toUpperCase();
    
    return this.posts.filter(p => {
      if (!p || !p.title) return false;

      const pCategory = (p.category || 'OTHER').toUpperCase();
      const pTitle = (p.title || '').toUpperCase();
      const pDesc = (p.description || '').toUpperCase();

      const matchCat = cat === 'ALL RESOURCES' || pCategory === cat;
      const matchQ   = !q || pTitle.includes(q) || pDesc.includes(q) || pCategory.includes(q);

      let matchView = true;
      if (this.viewMode === 'saved')      matchView = this.isSaved(p);
      if (this.viewMode === 'requests')   matchView = p.author === (this.user.display_name || this.user.displayName || this.user.name);

      return matchCat && matchQ && matchView;
    });
  }

  get activeCount(): string | number {
    if (!this.isLoggedIn || !this.user) return 0;
    const myName = this.user.displayName || this.user.display_name || this.user.name;
    const count = this.posts.filter(p => 
      p.author === myName && 
      p.status?.toLowerCase() === 'open'
    ).length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  get fulfilledCount(): number {
    if (!this.isLoggedIn || !this.user) return 0;
    const myName = this.user.displayName || this.user.display_name || this.user.name;
    return this.posts.filter(p => p.author === myName && p.status?.toLowerCase() === 'fulfilled').length;
  }

  toggleSave(post: any) {
    if (this.savedPosts.has(post.id)) {
      this.savedPosts.delete(post.id);
    } else {
      this.savedPosts.add(post.id);
    }
    localStorage.setItem('ac_savedPosts', JSON.stringify(Array.from(this.savedPosts)));
  }

  isSaved(post: any): boolean {
    return this.savedPosts.has(post.id);
  }

  isMyPost(post: any): boolean {
    if (!this.isLoggedIn || !this.user) return false;
    const myName = this.user.displayName || this.user.display_name || this.user.name;
    return post.author === myName;
  }

  // Trigger single delete confirmation
  requestDelete(post: any) {
    this.postToDelete = post;
    this.isBulkDelete = false;
    this.showDeleteConfirm = true;
  }

  // Trigger bulk delete confirmation
  requestBulkDelete() {
    if (this.selectedPosts.size === 0) return;
    this.postToDelete = null;
    this.isBulkDelete = true;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
    this.isBulkDelete = false;
  }

  confirmDelete() {
    if (this.isBulkDelete) {
      this.deleteSelected();
    } else if (this.postToDelete) {
      this.performDelete(this.postToDelete.id);
    }
  }

  private performDelete(id: string | number) {
    this.deleting = true;
    this.api.delete(`/posts/${id}`).subscribe({
      next: () => {
        this.postService.removePostLocal(id);
        this.selectedPosts.delete(id);
        this.closeDeleteModal();
      },
      error: (e) => {
        console.error('Failed deleting post:', e);
        this.deleting = false;
        alert('Failed to delete the request.');
      }
    });
  }

  private deleteSelected() {
    this.deleting = true;
    const ids = Array.from(this.selectedPosts);
    
    // We'll perform sequential deletes or if the API supports it, a bulk endpoint.
    // Assuming no bulk endpoint for now, we'll loop or use forkJoin if needed.
    // For simplicity and immediate UI feedback, we loop and update local state.
    
    let completed = 0;
    ids.forEach(id => {
      this.api.delete(`/posts/${id}`).subscribe({
        next: () => {
          this.postService.removePostLocal(id);
          this.selectedPosts.delete(id);
          completed++;
          if (completed === ids.length) {
            this.closeDeleteModal();
          }
        },
        error: (e) => {
          console.error(`Failed deleting post ${id}:`, e);
          completed++;
          if (completed === ids.length) {
            this.closeDeleteModal();
          }
        }
      });
    });
  }

  private closeDeleteModal() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
    this.isBulkDelete = false;
    this.deleting = false;
    this.cdr.detectChanges();
  }

  toggleSelect(id: string | number) {
    if (this.selectedPosts.has(id)) {
      this.selectedPosts.delete(id);
    } else {
      this.selectedPosts.add(id);
    }
  }

  isAllSelected(): boolean {
    const posts = this.paginatedPosts;
    if (posts.length === 0) return false;
    return posts.every(p => this.selectedPosts.has(p.id));
  }

  toggleSelectAll() {
    const posts = this.paginatedPosts;
    if (this.isAllSelected()) {
      posts.forEach(p => this.selectedPosts.delete(p.id));
    } else {
      posts.forEach(p => this.selectedPosts.add(p.id));
    }
  }

  activeEditPost: any = null;

  startEdit(post: any) {
    this.activeEditPost = {
      ...post,
      editTitle: post.title,
      editDescription: post.description,
      saving: false
    };
  }

  cancelEdit() {
    this.activeEditPost = null;
  }

  saveEdit() {
    if (!this.activeEditPost) return;
    this.activeEditPost.saving = true;

    this.api.put(`/posts/${this.activeEditPost.id}`, {
      title: this.activeEditPost.editTitle,
      description: this.activeEditPost.editDescription
    }).subscribe({
      next: () => {
        // Update state locally
        this.postService.updatePostLocal({
          id: this.activeEditPost.id,
          title: this.activeEditPost.editTitle,
          description: this.activeEditPost.editDescription
        });
        this.activeEditPost = null;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Failed modal update:', e);
        this.activeEditPost.saving = false;
        alert('Failed to save changes.');
        this.cdr.detectChanges();
      }
    });
  }

  get paginatedPosts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allFilteredPosts.slice(start, start + this.pageSize);
  }

  get Math() { return Math; }

  get totalPages(): number {
    return Math.ceil(this.allFilteredPosts.length / this.pageSize) || 1;
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (this.currentPage <= 3) return [1, 2, 3, 4, 5];
    if (this.currentPage >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setViewMode(mode: 'all' | 'saved' | 'requests') {
    this.viewMode = mode;
    this.currentPage = 1;
    if (mode !== 'all') {
      this.activeCategory = 'All Resources';
    }
  }

  setCategory(cat: string) { 
    this.activeCategory = cat; 
    this.currentPage = 1;
  }

  getStatusClass(status: string) {
    const s = (status || '').toLowerCase();
    return {
      'status-open':      s === 'open',
      'status-fulfilled': s === 'fulfilled',
      'status-closed':    s === 'closed' || s === 'removed'
    };
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}