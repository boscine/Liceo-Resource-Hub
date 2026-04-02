import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent {
  activeTab   = 'ALL';
  searchQuery = '';
  tabs        = ['ALL', 'FLAGGED', 'REMOVED'];

  posts = [
    { id: 'REQ-2024-8892', title: 'Calculus III Advanced Synthesis Notes',  author: 'Juan Dela Cruz',   college: 'Engineering',    status: 'active',  flagged: false, removed: false, reports: 0,  timeAgo: '2h ago' },
    { id: 'REQ-2024-7712', title: 'Ethics in Modern Journalism - Draft',     author: 'Maria Santos',     college: 'Arts & Sciences', status: 'flagged', flagged: true,  removed: false, reports: 4,  timeAgo: '5h ago' },
    { id: 'REQ-2024-6651', title: 'Marketing Strategy Masterclass Vol. 4',  author: 'Prof. Arnold Lee', college: 'Business Admin',  status: 'removed', flagged: false, removed: true,  reports: 7,  timeAgo: '1d ago' },
    { id: 'REQ-2024-5540', title: 'Organic Chemistry Lab Manual Reprints',  author: 'Kevin Wu',         college: 'Pharmacy',        status: 'active',  flagged: false, removed: false, reports: 0,  timeAgo: '3h ago' },
    { id: 'REQ-2024-4210', title: 'Architectural Drafting Tools Set',        author: 'Liza Ramos',       college: 'Architecture',    status: 'flagged', flagged: true,  removed: false, reports: 3,  timeAgo: '6h ago' },
  ];

  setTab(tab: string) { this.activeTab = tab; }

  getFiltered() {
    let list = this.posts;
    if (this.activeTab === 'FLAGGED') list = list.filter(p => p.flagged);
    if (this.activeTab === 'REMOVED') list = list.filter(p => p.removed);
    if (this.searchQuery) list = list.filter(p => p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || p.id.toLowerCase().includes(this.searchQuery.toLowerCase()));
    return list;
  }

  flag(post: any)    { post.flagged = !post.flagged; }
  remove(post: any)  { post.removed = true; post.status = 'removed'; }
  restore(post: any) { post.removed = false; post.flagged = false; post.status = 'active'; }
}
