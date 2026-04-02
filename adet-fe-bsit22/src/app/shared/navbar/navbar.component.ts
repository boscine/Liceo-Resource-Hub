import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  /** Which nav link should be highlighted as active. Pass 'feed' | 'create' | 'admin' | 'profile' */
  @Input() active: 'feed' | 'create' | 'admin' | 'profile' | '' = '';

  user: any       = {};
  isAdmin         = false;
  isLoggedIn      = false;
  notificationsOpen = false;

  notifications = [
    { id: 1, icon: 'check_circle',   text: 'Your request for <b>Organic Chemistry 4th Ed.</b> was fulfilled.',  time: '2 min ago',   read: false },
    { id: 2, icon: 'chat_bubble',    text: '<b>Maria Santos</b> commented on your Lab Tools request.',           time: '1 hour ago',  read: false },
    { id: 3, icon: 'notifications',  text: 'New resource posted in <b>Textbooks</b> matching your search.',      time: '3 hours ago', read: false },
    { id: 4, icon: 'person_add',     text: '<b>Juan dela Cruz</b> responded to your request.',                   time: 'Yesterday',   read: true  },
    { id: 5, icon: 'bookmark_added', text: 'Your post <b>Anatomy Dissection Kit</b> has been bookmarked.',       time: '2 days ago',  read: true  },
  ];

  get unreadCount() { return this.notifications.filter(n => !n.read).length; }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isAdmin    = this.auth.isAdmin();
    if (this.isLoggedIn) {
      this.user = this.auth.getUser() || {};
    }
  }

  toggleNotifications(e: Event) {
    e.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead() { this.notifications.forEach(n => n.read = true); }
  markRead(n: any) { n.read = true; }

  @HostListener('document:click')
  closeNotifications() { this.notificationsOpen = false; }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
