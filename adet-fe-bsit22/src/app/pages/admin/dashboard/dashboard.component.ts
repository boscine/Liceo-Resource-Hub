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

  private postSub?: Subscription;
  private reportSub?: Subscription;

  constructor(
    private api: ApiService, 
    private postService: PostService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.postService.getAdminPosts();
    this.postService.getAdminReports();

    this.postSub = this.postService.posts$.subscribe(data => {
      this.posts = data;
      this.loading = false;
      this.cdr.detectChanges();
    });

    this.reportSub = this.postService.reports$.subscribe(data => {
      // Show only pending reports in the urgent panel
      this.urgentReports = data.filter(r => r.status === 'pending').slice(0, 3);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.postSub) this.postSub.unsubscribe();
    if (this.reportSub) this.reportSub.unsubscribe();
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
    // For 'ALL POSTS', excluding removed but showing everything else (open, fulfilled, flagged)
    return this.posts.filter(p => p.status !== 'REMOVED');
  }

  approvePost(id: any) {
    this.api.put(`/posts/${id}`, { isFlagged: false, status: 'open' }).subscribe(() => this.postService.getAdminPosts());
  }

  flagPost(id: any) {
    this.api.put(`/posts/${id}`, { isFlagged: true }).subscribe(() => this.postService.getAdminPosts());
  }

  removePost(id: any) {
    this.api.put(`/posts/${id}`, { status: 'removed' }).subscribe(() => this.postService.getAdminPosts());
  }
}
