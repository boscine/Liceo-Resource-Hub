import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  activeTab = 'ALL POSTS';
  tabs      = ['ALL POSTS', 'FLAGGED', 'REMOVED'];

  stats = [
    { label: 'Total Requests',     value: '1,284', note: '+12% from last academic week', icon: 'library_books',  highlighted: false },
    { label: 'Reported Posts',     value: '42',    note: 'Requires immediate review',   icon: 'report',         highlighted: true  },
    { label: 'Fulfilled Requests', value: '956',   note: '84% Success Rate',            icon: 'check_circle',   highlighted: false },
  ];

  urgentReports = [
    { type: 'INAPPROPRIATE CONTENT', reportedBy: '#2023-4102', timeAgo: '2m ago',  excerpt: '"The attached PDF contains non-academic promotional material..."' },
    { type: 'COPYRIGHT VIOLATION',   reportedBy: '#2024-0012', timeAgo: '15m ago', excerpt: '"This resource is a full copy of a licensed textbook chapter..."' },
  ];

  posts = [
    { id: 'REQ-2024-8892', title: 'Calculus III Advanced Synthesis Notes',  author: 'Juan Dela Cruz',  college: 'College of Engineering',    status: 'Active',             flagged: false, removed: false },
    { id: 'REQ-2024-7712', title: 'Ethics in Modern Journalism - Draft',     author: 'Maria Santos',    college: 'College of Arts & Sciences', status: 'FLAGGED',           flagged: true,  removed: false },
    { id: 'REQ-2024-6651', title: 'Marketing Strategy Masterclass Vol. 4',  author: 'Prof. Arnold Lee', college: 'Business Admin',            status: 'Permanently Removed', flagged: false, removed: true  },
    { id: 'REQ-2024-5540', title: 'Organic Chemistry Lab Manual Reprints',  author: 'Kevin Wu',        college: 'College of Pharmacy',        status: 'Active',             flagged: false, removed: false },
  ];

  setTab(tab: string) { this.activeTab = tab; }

  getFilteredPosts() {
    if (this.activeTab === 'FLAGGED') return this.posts.filter(p => p.flagged);
    if (this.activeTab === 'REMOVED') return this.posts.filter(p => p.removed);
    return this.posts;
  }
}
