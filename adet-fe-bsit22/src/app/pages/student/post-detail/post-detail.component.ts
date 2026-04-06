import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule, ActivatedRoute }      from '@angular/router';
import { FormsModule }       from '@angular/forms';
import { AuthService }       from '../../../core/services/auth.service';
import { ApiService }        from '../../../core/services/api.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  isLoggedIn    = false;
  showContact   = false;
  showReportForm = false;
  reportReason  = '';
  reportDetails = '';
  user: any = {};
  loading = true;

  reasons = ['Inappropriate Content', 'Spam', 'Misleading', 'Not Educational', 'Duplicate Post', 'Fake Contact Info', 'Other'];

  post: any = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.auth.getUser() || {};
    }

    // Use paramMap subscription for robust navigation
    this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.fetchPost(postId);
      } else {
        this.loading = false;
      }
    });
  }

  fetchPost(id: string) {
    this.loading = true;
    this.api.get<any>(`/posts/${id}`).subscribe({
      next: (data) => {
        this.post = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load post detail:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  revealContact() { this.showContact = true; }
  toggleReport()  { this.showReportForm = !this.showReportForm; }
  submitReport()  { this.showReportForm = false; }
}