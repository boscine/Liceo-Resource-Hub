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

  // Detail Modal properties
  showDetailModal = false;
  selectedPost: any = null;
  loadingDetail = false;
  showContact = false;
  isDescriptionExpanded = false; // "See More" toggle state

  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  
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
      const sortedNames = names.sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
      });
      this.categories = ['All Resources', ...sortedNames];
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
      if (this.viewMode === 'requests')   matchView = p.authorId === this.user?.id;

      return matchCat && matchQ && matchView;
    });
  }

  get activeCount(): string | number {
    if (!this.isLoggedIn || !this.user?.id) return 0;
    const count = this.posts.filter(p => 
      p.authorId === this.user.id && 
      p.status?.toLowerCase() === 'open'
    ).length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  get fulfilledCount(): string | number {
    if (!this.isLoggedIn || !this.user?.id) return 0;
    const count = this.posts.filter(p => p.authorId === this.user.id && p.status?.toLowerCase() === 'fulfilled').length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  get closedCount(): string | number {
    if (!this.isLoggedIn || !this.user?.id) return 0;
    const count = this.posts.filter(p => p.authorId === this.user.id && (p.status?.toLowerCase() === 'closed' || p.status?.toLowerCase() === 'removed')).length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  toggleSave(post: any) {
    if (this.savedPosts.has(post.id)) {
      this.savedPosts.delete(post.id);
    } else {
      this.savedPosts.add(post.id);
      // Notify author via backend
      if (this.isLoggedIn) {
        this.api.post(`/posts/${post.id}/save`, {}).subscribe({
          error: (e) => console.error('Failed to notify author:', e)
        });
      }
    }
    localStorage.setItem('ac_savedPosts', JSON.stringify(Array.from(this.savedPosts)));
  }

  isSaved(post: any): boolean {
    return this.savedPosts.has(post.id);
  }

  isMyPost(post: any): boolean {
    if (!this.isLoggedIn || !this.user?.id) return false;
    return post.authorId === this.user.id;
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
    
    // Using the new institutional bulk-delete endpoint for maximum efficiency
    this.api.post('/posts/bulk-delete', { ids }).subscribe({
      next: (res: any) => {
        // Remove all successfully deleted posts from local state
        ids.forEach(id => this.postService.removePostLocal(id));
        this.selectedPosts.clear();
        this.closeDeleteModal();
      },
      error: (e) => {
        console.error('Bulk deletion failed:', e);
        this.deleting = false;
        alert(e.error?.message || 'Failed to perform bulk scholarly cleanup.');
      }
    });
  }

  private closeDeleteModal() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
    this.isBulkDelete = false;
    this.deleting = false;
    this.cdr.detectChanges();
  }

  // --- DETAIL MODAL LOGIC ---
  openDetail(post: any) {
    this.selectedPost = { ...post }; // Use existing data first
    this.showDetailModal = true;
    this.loadingDetail = true;
    this.showContact = false; // Reset contact visibility
    this.isDescriptionExpanded = false; // Reset description expansion

    // Fetch full post details (contacts, etc.)
    this.api.get(`/posts/${post.id}`).subscribe({
      next: (data: any) => {
        this.selectedPost = data;
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Failed fetching post detail:', e);
        this.loadingDetail = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedPost = null;
    this.isDescriptionExpanded = false;
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  revealContact() {
    this.showContact = true;
  }

  @HostListener('document:keydown.escape')
  handleKeydown() {
    if (this.showDetailModal) this.closeDetailModal();
    if (this.showDeleteConfirm) this.cancelDelete();
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

  goToEdit(post: any) {
    if (!post) return;
    const id = post.id;
    this.closeDetailModal();
    this.router.navigate(['/post', id, 'edit']);
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