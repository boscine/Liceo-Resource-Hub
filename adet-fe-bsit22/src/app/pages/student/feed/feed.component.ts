import { Component, OnInit, ChangeDetectorRef, HostListener, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription }      from 'rxjs';
import { ApiService }        from '../../../core/services/api.service';
import { AuthService }       from '../../../core/services/auth.service';
import { PostService }       from '../../../core/services/post.service';
import { ThemeService }      from '../../../core/services/theme.service';
import { ToastService }      from '../../../core/services/toast.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../../shared/footer/footer.component';
import { getInitials }       from '../../../core/utils';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  getInitials = getInitials;
  searchQuery    = '';
  activeCategories = new Set<string>(['All Resources']);
  categories     = ['All Resources'];

  loading = true;
  posts: any[] = [];
  user: any = {};
  isAdmin = false;
  isLoggedIn = false;
  viewMode: 'all' | 'saved' | 'requests' = 'all';
  
  currentPage = 1;
  pageSize = 12;

  savedPosts = new Set<number>();
  selectedPosts = new Set<string | number>();
  
  // Custom delete confirmation
  showDeleteConfirm = false;
  postToDelete: any = null; // null if bulk delete
  isBulkDelete = false;
  deleting = false;
  deleteReason = '';

  // Detail Modal properties
  showDetailModal = false;
  selectedPost: any = null;
  loadingDetail = false;
  showContact = false;
  isDescriptionExpanded = false; // "See More" toggle state
  
  // Reporting logic
  showReportForm = false;
  reportSuccess  = false;
  reportReason   = '';
  reportDetails  = '';
  reporting      = false;
  reasons = [
    { label: 'Inappropriate Content', value: 'inappropriate' },
    { label: 'Spam', value: 'spam' },
    { label: 'Misleading', value: 'misleading' },
    { label: 'Not Educational', value: 'not_educational' },
    { label: 'Duplicate Post', value: 'duplicate' },
    { label: 'Fake Contact Info', value: 'fake_contact' },
    { label: 'Other', value: 'other' }
  ];

  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  
  totalPages = 1;
  sortBy = 'newest';

  private postSub?: Subscription;
  private catSub?: Subscription;
  private pagSub?: Subscription;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private postService: PostService,
    public themeService: ThemeService,
    private toast: ToastService,
    private renderer: Renderer2
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
      this.cdr.detectChanges();
    });

    // Subscribe to pagination stream
    this.pagSub = this.postService.pagination$.subscribe(pag => {
      if (pag) {
        this.currentPage = pag.page;
        this.pageSize = pag.limit;
        this.totalPages = pag.totalPages || 1;
        this.cdr.detectChanges();
      }
    });

    // Subscribe to loading state to ensure UI doesn't hang on error
    this.postService.loading$.subscribe(l => {
      this.loading = l;
      this.cdr.detectChanges();
    });

    // Subscribe to stateful categories stream
    this.catSub = this.postService.categories$.subscribe(data => {
      const names = data.map(c => c.name);
      this.categories = ['All Resources', ...names];
      this.cdr.detectChanges();
    });

    // Initial load (Only fetch if needed to preserve backend resources)
    this.postService.getCategories();
    this.fetchPosts(false);
  }

  fetchPosts(force = false) {
    const categories = this.activeCategories.has('All Resources') ? undefined : Array.from(this.activeCategories);
    const savedIds = this.viewMode === 'saved' ? Array.from(this.savedPosts) : undefined;
    this.postService.getPosts(this.currentPage, this.pageSize, force, categories, this.viewMode, savedIds, this.sortBy);
  }

  ngOnDestroy() {
    if (this.postSub) this.postSub.unsubscribe();
    if (this.catSub) this.catSub.unsubscribe();
    if (this.pagSub) this.pagSub.unsubscribe();
  }

  /** Posts filtered by the active categories, search query, and view mode */
  get allFilteredPosts() {
    const q = (this.searchQuery || '').trim().toUpperCase();
    
    // Server already filters by category and viewMode (all/requests/saved)
    let filtered = this.posts;

    // Extra safety: ensure 'requests' only shows user's posts if frontend still has old data
    if (this.viewMode === 'requests' && this.user?.id) {
      filtered = filtered.filter(p => p.authorId === this.user.id);
    }
    
    // Extra safety: ensure 'saved' only shows saved posts
    if (this.viewMode === 'saved') {
      filtered = filtered.filter(p => this.isSaved(p));
    }

    if (!q) return filtered;

    return filtered.filter(p => {
      if (!p || !p.title) return false;

      const pTitle = (p.title || '').toUpperCase();
      const pDesc = (p.description || '').toUpperCase();
      const pCategory = (p.category || '').toUpperCase();

      return pTitle.includes(q) || pDesc.includes(q) || pCategory.includes(q);
    });
  }

  private getCountByStatus(statuses: string[]): string | number {
    if (!this.isLoggedIn || !this.user?.id) return 0;
    const count = this.posts.filter(p => 
      p.authorId === this.user.id && 
      statuses.includes((p.status || '').toLowerCase())
    ).length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  get activeCount(): string | number {
    return this.getCountByStatus(['open']);
  }

  get fulfilledCount(): string | number {
    return this.getCountByStatus(['fulfilled']);
  }

  get closedCount(): string | number {
    return this.getCountByStatus(['closed', 'removed']);
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
    if (!this.isLoggedIn || !this.user?.id || !post) return false;
    // Handle both property names that might exist in the post object
    const authorId = post.authorId || post.userId;
    return authorId === this.user.id;
  }

  // Trigger single delete confirmation
  requestDelete(post: any) {
    this.postToDelete = post;
    this.isBulkDelete = false;
    this.showDeleteConfirm = true;
    this.renderer.addClass(document.body, 'modal-open');
  }

  // Trigger bulk delete confirmation
  requestBulkDelete() {
    if (this.selectedPosts.size === 0) return;
    this.postToDelete = null;
    this.isBulkDelete = true;
    this.showDeleteConfirm = true;
    this.renderer.addClass(document.body, 'modal-open');
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
    this.isBulkDelete = false;
    this.renderer.removeClass(document.body, 'modal-open');
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
    const url = this.isAdmin && this.deleteReason 
      ? `/posts/${id}?reason=${encodeURIComponent(this.deleteReason)}` 
      : `/posts/${id}`;

    this.api.delete(url).subscribe({
      next: () => {
        this.postService.removePostLocal(id);
        this.selectedPosts.delete(id);
        this.closeDeleteModal();
      },
      error: (e) => {
        console.error('Failed deleting post:', e);
        this.deleting = false;
        this.toast.error('Failed to perform academic deletion. Please try again.');
      }
    });
  }

  private deleteSelected() {
    this.deleting = true;
    const ids = Array.from(this.selectedPosts);
    
    // Using the new institutional bulk-delete endpoint for maximum efficiency
    const payload: any = { ids };
    if (this.isAdmin && this.deleteReason) payload.reason = this.deleteReason;

    this.api.post('/posts/bulk-delete', payload).subscribe({
      next: (res: any) => {
        // Remove all successfully deleted posts from local state
        ids.forEach(id => this.postService.removePostLocal(id));
        this.selectedPosts.clear();
        this.closeDeleteModal();
      },
      error: (e) => {
        console.error('Bulk deletion failed:', e);
        this.deleting = false;
        this.toast.error(e.error?.message || 'Failed to perform bulk scholarly cleanup.');
      }
    });
  }

  private closeDeleteModal() {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
    this.isBulkDelete = false;
    this.deleting = false;
    this.deleteReason = '';

    // Close detail modal if it was open for the deleted post
    this.showDetailModal = false;
    this.selectedPost = null;

    // Restore background scrolling
    this.renderer.removeClass(document.body, 'modal-open');

    this.cdr.detectChanges();
  }
  // --- DETAIL MODAL LOGIC ---
  openDetail(post: any) {
    this.selectedPost = { ...post }; // Use existing data first
    this.showDetailModal = true;
    this.loadingDetail = true;
    this.showContact = false; // Reset contact visibility
    this.isDescriptionExpanded = false; // Reset description expansion
    
    // Prevent background scrolling
    this.renderer.addClass(document.body, 'modal-open');

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
        this.closeDetailModal();
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedPost = null;
    this.isDescriptionExpanded = false;
    this.showReportForm = false;
    this.reportSuccess  = false;
    this.reportReason   = '';
    this.reportDetails  = '';

    // Restore background scrolling
    this.renderer.removeClass(document.body, 'modal-open');
  }

  toggleReport() {
    this.showReportForm = !this.showReportForm;
    if (!this.showReportForm) {
      // Full reset when closing the panel
      this.reportSuccess = false;
      this.reportReason  = '';
      this.reportDetails = '';
    }
  }

  submitReport() {
    if (this.reporting || !this.reportReason || !this.selectedPost) return;

    this.reporting = true;

    this.api.post(`/posts/${this.selectedPost.id}/report`, {
      reason: this.reportReason,
      details: this.reportDetails
    }).subscribe({
      next: () => {
        this.reporting      = false;
        this.reportSuccess  = true;
        this.reportReason   = '';
        this.reportDetails  = '';
        this.toast.success('Report submitted. Thank you for maintaining HUB integrity.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reporting = false;
        const msg = err.error?.message || 'Failed to submit the report.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  revealContact(post?: any) {
    this.showContact = true;
    // Trigger the scholarly cooperation notification to the author
    if (post && this.isLoggedIn && !this.isMyPost(post)) {
      this.api.post(`/posts/${post.id}/cooperate`, {}).subscribe({
        error: (e) => console.error('Failed to notify author on cooperation:', e)
      });
    }
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

  getSelectedPostPreviews() {
    return this.posts.filter(p => this.selectedPosts.has(p.id));
  }

  hasOthersPostsSelected(): boolean {
    if (!this.isLoggedIn || !this.user?.id) return false;
    return this.getSelectedPostPreviews().some(p => p.authorId !== this.user.id);
  }

  get paginatedPosts() {
    return this.allFilteredPosts;
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
      this.fetchPosts(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setViewMode(mode: 'all' | 'saved' | 'requests') {
    this.viewMode = mode;
    this.currentPage = 1;
    if (mode !== 'all') {
      this.activeCategories.clear();
      this.activeCategories.add('All Resources');
    }
    // Loophole Fix: Refresh posts from server for the new view mode
    this.fetchPosts(true);
  }

  resetFilters() {
    this.searchQuery = '';
    this.activeCategories.clear();
    this.activeCategories.add('All Resources');
    this.currentPage = 1;
    this.fetchPosts(true);
    this.cdr.detectChanges();
  }

  setCategory(cat: string) { 
    if (cat === 'All Resources') {
      this.activeCategories.clear();
      this.activeCategories.add('All Resources');
    } else {
      this.activeCategories.delete('All Resources');
      if (this.activeCategories.has(cat)) {
        this.activeCategories.delete(cat);
        if (this.activeCategories.size === 0) {
          this.activeCategories.add('All Resources');
        }
      } else {
        this.activeCategories.add(cat);
      }
    }
    this.currentPage = 1;
    this.fetchPosts(true);
  }

  isActiveCategory(cat: string): boolean {
    return this.activeCategories.has(cat);
  }

  updatingStatus: Set<number | string> = new Set();

  updateStatus(post: any, status: string) {
    if (this.updatingStatus.has(post.id)) return;
    
    this.updatingStatus.add(post.id);
    this.postService.updateStatus(post, status).subscribe({
      next: () => {
        post.status = status.toUpperCase();
        post.resolved = (status === 'fulfilled');
        this.postService.updatePostLocal(post);
        this.toast.success(`Status updated to ${status.toUpperCase()}.`);
        this.updatingStatus.delete(post.id);
      },
      error: () => {
        this.toast.error('Failed to update status.');
        this.updatingStatus.delete(post.id);
      }
    });
  }

  getStatusClass(status: string) {
    const s = (status || '').toLowerCase();
    return {
      'status-open':      s === 'open',
      'status-fulfilled': s === 'fulfilled',
      'status-closed':    s === 'closed' || s === 'removed'
    };
  }

  getCategoryIcon(name: string): string {
    const icons: { [key: string]: string } = {
      // Premium Scholarly Names
      'Academic Textbooks': 'auto_stories',
      'Lecture Chronicles': 'history_edu',
      'Laboratory & Scientific Tools': 'biotech',
      'Scientific Apparatus': 'biotech',
      'Computing & Digital Assets': 'terminal',
      'Technical & Artistic Equipment': 'palette',
      'Technical & Vocational Tools': 'construction',
      'Scholarly Manuscripts': 'menu_book',
      'Physical Education Kits': 'fitness_center',
      'Miscellaneous Resources': 'extension',
      'Mathematical Instruments': 'calculate',
      'Artistic Tools & Mediums': 'palette',
      'Clinical & Medical Supplies': 'medical_services',
      'Institutional Equipment': 'account_balance',

      // Legacy/Seed Names
      'Textbooks & Modules': 'auto_stories',
      'Study Notes & Reviewers': 'history_edu',
      'Laboratory & Science Tools': 'biotech',
      'Laptops & Gadgets': 'terminal',
      'Calculators & Math Tools': 'calculate',
      'Engineering & Tech Tools': 'construction',
      'Art & Creative Supplies': 'palette',
      'Medical & Nursing Kits': 'medical_services',
      'PE & Sports Equipment': 'fitness_center',
      'Campus & General Equipment': 'account_balance',
      'Research & Manuscripts': 'menu_book',
      'Other Academic Items': 'extension'
    };
    return icons[name] || 'bookmark';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}