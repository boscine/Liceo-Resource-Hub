import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  activeTab = 'PENDING';
  tabs      = ['PENDING', 'REVIEWED', 'DISMISSED'];

  reports = [
    { id: 'RPT-001', postId: 'REQ-2024-7712', postTitle: 'Ethics in Modern Journalism - Draft',    reportedBy: '#2023-4102', reason: 'Inappropriate Content', details: 'The attached PDF contains non-academic promotional material...', status: 'pending',   timeAgo: '2m ago'  },
    { id: 'RPT-002', postId: 'REQ-2024-6651', postTitle: 'Marketing Strategy Masterclass Vol. 4', reportedBy: '#2024-0012', reason: 'Copyright Violation',   details: 'This resource is a full copy of a licensed textbook chapter...', status: 'pending',   timeAgo: '15m ago' },
    { id: 'RPT-003', postId: 'REQ-2024-5540', postTitle: 'Organic Chemistry Lab Manual Reprints', reportedBy: '#2024-0099', reason: 'Spam',                  details: 'Repeated identical post.',                                        status: 'reviewed',  timeAgo: '1h ago'  },
    { id: 'RPT-004', postId: 'REQ-2024-4210', postTitle: 'Architectural Drafting Tools Set',       reportedBy: '#2023-7821', reason: 'Fake Contact Info',    details: 'Messenger link is invalid.',                                      status: 'dismissed', timeAgo: '2h ago'  },
  ];

  setTab(tab: string) { this.activeTab = tab; }
  getFiltered()       { return this.reports.filter(r => r.status === this.activeTab.toLowerCase()); }
  dismiss(r: any)     { r.status = 'dismissed'; }
  review(r: any)      { r.status = 'reviewed'; }
}
