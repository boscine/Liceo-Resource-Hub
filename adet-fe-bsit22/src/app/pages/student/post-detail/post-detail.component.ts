import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { FormsModule }       from '@angular/forms';
import { AuthService }       from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  isLoggedIn    = false;
  showContact   = false;
  showReportForm = false;
  reportReason  = '';
  reportDetails = '';

  reasons = ['Inappropriate Content', 'Spam', 'Misleading', 'Not Educational', 'Duplicate Post', 'Fake Contact Info', 'Other'];

  post = {
    id: 1, status: 'OPEN', category: 'TEXTBOOKS', timeAgo: '2 hours ago',
    title: 'Organic Chemistry 4th Ed. (Smith)',
    description: 'Looking for a physical copy to borrow for the midterms. Prepared to trade for Physics volume 1 or pay a small borrowing fee. Ideally needs to be available by this weekend. Please message me if you have a copy or know someone who does.',
    author: 'Juan Dela Cruz', college: 'College of Engineering',
    contact: { type: 'Messenger', value: 'facebook.com/juandelacruz' },
  };

  constructor(private auth: AuthService) {}
  ngOnInit() { this.isLoggedIn = this.auth.isLoggedIn(); }
  revealContact() { this.showContact = true; }
  toggleReport()  { this.showReportForm = !this.showReportForm; }
  submitReport()  { this.showReportForm = false; }
}
