import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ApiService } from '../../../core/services/api.service';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = 'ALL POSTS';
  tabs      = ['ALL POSTS', 'FLAGGED', 'REMOVED'];
  posts: any[] = [];
  urgentReports: any[] = [];
  loading = true;
  
  // Moderation Reason State
  reasonModalOpen = false;
  moderationReason = '';
  moderationAction: 'flag' | 'remove' | null = null;
  targetPostId: any = null;

  private postSub?: Subscription;
  private reportSub?: Subscription;
  private loadingSub?: Subscription;

  constructor(
    private api: ApiService, 
    private postService: PostService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.postService.getAdminPosts();
    this.postService.getAdminReports();

    this.loadingSub = this.postService.loading$.subscribe(l => {
      this.loading = l;
      this.cdr.detectChanges();
    });

    this.postSub = this.postService.posts$.subscribe(data => {
      this.posts = data;
      this.cdr.detectChanges();
    });

    this.reportSub = this.postService.reports$.subscribe(data => {
      this.urgentReports = data.filter(r => r.status === 'pending').slice(0, 3);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.postSub) this.postSub.unsubscribe();
    if (this.reportSub) this.reportSub.unsubscribe();
    if (this.loadingSub) this.loadingSub.unsubscribe();
  }

  get stats() {
    return [
      { label: 'Total Requests',     value: this.posts.length, note: '+12% from last academic week', icon: 'library_books',  highlighted: false },
      { label: 'Reported Posts',     value: this.posts.filter(p => !!p.isFlagged).length,    note: 'Requires immediate review',   icon: 'report',         highlighted: true  },
      { label: 'Fulfilled Requests', value: this.posts.filter(p => p.status === 'FULFILLED').length,   note: '84% Success Rate',            icon: 'check_circle',   highlighted: false },
    ];
  }

  setTab(tab: string) { this.activeTab = tab; }

  getFilteredPosts() {
    if (this.activeTab === 'FLAGGED') return this.posts.filter(p => !!p.isFlagged);
    if (this.activeTab === 'REMOVED') return this.posts.filter(p => p.status === 'REMOVED');
    return this.posts.filter(p => p.status !== 'REMOVED');
  }

  approvePost(id: any) {
    this.api.put(`/posts/${id}`, { isFlagged: false, status: 'open' }).subscribe(() => this.postService.getAdminPosts());
  }

  // --- Moderation Flow ---

  confirmModeration(id: any, action: 'flag' | 'remove') {
    this.targetPostId = id;
    this.moderationAction = action;
    this.moderationReason = '';
    this.reasonModalOpen = true;
  }

  cancelModeration() {
    this.reasonModalOpen = false;
    this.moderationReason = '';
    this.targetPostId = null;
    this.moderationAction = null;
  }

  submitModeration() {
    if (!this.targetPostId || !this.moderationAction) return;

    const payload: any = { moderationReason: this.moderationReason };
    if (this.moderationAction === 'flag') payload.isFlagged = true;
    if (this.moderationAction === 'remove') payload.status = 'removed';

    this.api.put(`/posts/${this.targetPostId}`, payload).subscribe({
      next: () => {
        this.postService.getAdminPosts();
        this.cancelModeration();
      },
      error: (err) => {
        console.error('Moderation failed:', err);
      }
    });
  }

  // Legacy stubs for existing templates if needed, but better to call confirmModeration
  flagPost(id: any) { this.confirmModeration(id, 'flag'); }
  removePost(id: any) { this.confirmModeration(id, 'remove'); }
}
