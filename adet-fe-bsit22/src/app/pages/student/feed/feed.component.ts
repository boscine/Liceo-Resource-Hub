import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService }        from '../../../core/services/api.service';
import { AuthService }       from '../../../core/services/auth.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check if the user has scrolled near the bottom of the page
    const threshold = 100; 
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;
    this.isNearBottom = (position > (height - threshold));
  }

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
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

    this.loadCategories();
    this.loadPosts();
  }

  loadCategories() {
    this.api.get<any[]>('/categories').subscribe({
      next: (data) => {
        const names = data.map(c => c.name);
        this.categories = ['All Resources', ...names];
        this.cdr.detectChanges(); // Ensure UI updates on initial load
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadPosts() {
    this.loading = true;
    this.api.get<any[]>('/posts').subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
        this.cdr.detectChanges(); // Force UI refresh
      },
      error: (err) => {
        console.error('Failed to load posts', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Posts filtered by the active category chip, search query, and view mode */
  get allFilteredPosts() {
    const cat = (this.activeCategory || 'All Resources').toUpperCase();
    const q   = (this.searchQuery || '').trim().toUpperCase();
    
    return this.posts.filter(p => {
      // Safety checks: if post or needed fields are missing, skip or return false
      if (!p || !p.title) return false;

      const pCategory = (p.category || 'OTHER').toUpperCase();
      const pTitle = (p.title || '').toUpperCase();
      const pDesc = (p.description || '').toUpperCase();

      // Category Filter
      const matchCat = cat === 'ALL RESOURCES' || pCategory === cat;
      
      // Search Query Filter
      const matchQ   = !q ||
        pTitle.includes(q) ||
        pDesc.includes(q) ||
        pCategory.includes(q);

      // View Mode Filter
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
      (p.status?.toLowerCase() === 'open' || p.status?.toLowerCase() === 'urgent' || p.status?.toLowerCase() === 'active')
    ).length;
    return count > 0 && count < 10 ? '0' + count : count;
  }

  get fulfilledCount(): number {
    if (!this.isLoggedIn || !this.user) return 0;
    const myName = this.user.displayName || this.user.display_name || this.user.name;
    return this.posts.filter(p => 
      p.author === myName && 
      p.status?.toLowerCase() === 'fulfilled'
    ).length;
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

  deletePost(id: string | number) {
    if (confirm('Are you sure you want to permanently delete this request? This action cannot be undone.')) {
      this.api.delete(`/posts/${id}`).subscribe({
        next: () => {
          // Instantly remove from UI feed state without reloading
          this.posts = this.posts.filter(p => p.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error('Failed deleting post:', e);
          alert('Failed to delete the request. Please try again.');
        }
      });
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

    // Push the partial payload directly back to the database
    this.api.put(`/posts/${this.activeEditPost.id}`, {
      title: this.activeEditPost.editTitle,
      description: this.activeEditPost.editDescription
    }).subscribe({
      next: () => {
        // Sync to backing feed organically
        const original = this.posts.find(p => p.id === this.activeEditPost.id);
        if (original) {
          original.title = this.activeEditPost.editTitle;
          original.description = this.activeEditPost.editDescription;
        }
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

  get Math() { return Math; } // For template

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
      this.activeCategory = 'All Resources'; // Reset category if switching mode
    }
  }

  setCategory(cat: string) { 
    this.activeCategory = cat; 
    this.currentPage = 1;
  }

  getStatusClass(status: string) {
    const s = (status || '').toLowerCase();
    return {
      'status-open':      s === 'open' || s === 'active',
      'status-fulfilled': s === 'fulfilled',
      'status-urgent':    s === 'urgent' || s === 'flagged',
      'status-closed':    s === 'closed' || s === 'removed'
    };
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}