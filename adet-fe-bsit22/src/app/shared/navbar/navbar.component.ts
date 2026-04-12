import { Component, OnInit, OnDestroy, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() active: 'feed' | 'create' | 'admin' | 'profile' | 'guide' | '' = '';
  @Input() showHelpButton = false;
  @Input() showMenuButton = false;
  @Input() hideLinks      = false;
  @Output() menuClick = new EventEmitter<void>();
  @Output() helpClick = new EventEmitter<void>();

  user: any       = {};
  isAdmin         = false;
  isLoggedIn      = false;
  notificationsOpen = false;

  notifications: any[] = [];
  notificationsSub: any;

  get unreadCount() { return this.notifications.filter(n => !n.read).length; }

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private api: ApiService,
    private notifService: NotificationService
  ) {}

  toggleMenu() { this.menuClick.emit(); }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isAdmin    = this.auth.isAdmin();
    if (this.isLoggedIn) {
      this.user = this.auth.getUser() || {};
      this.notificationsSub = this.notifService.notifications$.subscribe((data: any[]) => {
        this.notifications = Array.isArray(data) ? data : [];
      });
      this.notifService.refresh();
    }
  }

  ngOnDestroy() {
    if (this.notificationsSub) this.notificationsSub.unsubscribe();
  }

  toggleNotifications(e: Event) {
    e.stopPropagation();
    if (!this.notificationsOpen) {
       this.notifService.refresh();
    }
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead() { this.notifService.markAllRead(); }
  markRead(n: any) { this.notifService.markAsRead(n.id); }

  @HostListener('document:click')
  closeNotifications() { this.notificationsOpen = false; }

  closeNotificationsDeferred() {
    setTimeout(() => { this.notificationsOpen = false; }, 50);
  }

  toggleHelp() { this.helpClick.emit(); }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
