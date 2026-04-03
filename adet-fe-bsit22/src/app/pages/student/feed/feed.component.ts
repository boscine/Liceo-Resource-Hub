import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { ApiService }    from '../../../core/services/api.service';
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

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
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

  /** Posts filtered by the active category chip and the search query */
  get filteredPosts() {
    const cat = (this.activeCategory || 'All Resources').toUpperCase();
    const q   = (this.searchQuery || '').trim().toUpperCase();
    
    return this.posts.filter(p => {
      // Safety checks: if post or needed fields are missing, skip or return false
      if (!p || !p.title) return false;

      const pCategory = (p.category || 'OTHER').toUpperCase();
      const pTitle = (p.title || '').toUpperCase();
      const pDesc = (p.description || '').toUpperCase();

      const matchCat = cat === 'ALL RESOURCES' || pCategory === cat;
      const matchQ   = !q ||
        pTitle.includes(q) ||
        pDesc.includes(q) ||
        pCategory.includes(q);
        
      return matchCat && matchQ;
    });
  }

  setCategory(cat: string) { this.activeCategory = cat; }

  getStatusClass(status: string) {
    return {
      'status-open':      status === 'OPEN',
      'status-fulfilled': status === 'FULFILLED',
      'status-urgent':    status === 'URGENT',
    };
  }
}