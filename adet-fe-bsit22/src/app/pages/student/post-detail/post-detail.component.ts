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
  reporting = false;
  isDescriptionExpanded = false;

  reasons = [
    { label: 'Inappropriate Content', value: 'inappropriate' },
    { label: 'Spam', value: 'spam' },
    { label: 'Misleading', value: 'misleading' },
    { label: 'Not Educational', value: 'not_educational' },
    { label: 'Duplicate Post', value: 'duplicate' },
    { label: 'Fake Contact Info', value: 'fake_contact' },
    { label: 'Other', value: 'other' }
  ];

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
        this.isDescriptionExpanded = false;
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
  getCategoryIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Academic Textbooks': 'auto_stories',
      'Lecture Chronicles': 'history_edu',
      'Scientific Apparatus': 'biotech',
      'Computing & Digital Assets': 'terminal',
      'Mathematical Instruments': 'calculate',
      'Technical & Vocational Tools': 'construction',
      'Artistic Tools & Mediums': 'palette',
      'Clinical & Medical Supplies': 'medical_services',
      'Physical Education Kits': 'fitness_center',
      'Institutional Equipment': 'account_balance',
      'Scholarly Manuscripts': 'menu_book',
      'Miscellaneous Resources': 'extension'
    };
    return icons[name] || 'bookmark';
  }
  toggleReport()  { this.showReportForm = !this.showReportForm; }
  submitReport() {
    if (this.reporting || !this.reportReason) return;
    
    this.reporting = true;
    
    this.api.post(`/posts/${this.post.id}/report`, {
      reason: this.reportReason,
      details: this.reportDetails
    }).subscribe({
      next: () => {
        this.reporting = false;
        this.showReportForm = false;
        this.reportReason = '';
        this.reportDetails = '';
        alert('Report submitted. Thank you for maintaining HUB integrity.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.reporting = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleDescription() { this.isDescriptionExpanded = !this.isDescriptionExpanded; }
}