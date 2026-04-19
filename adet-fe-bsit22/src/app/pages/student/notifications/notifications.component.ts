import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  allNotifications: Notification[] = [];
  notifications: Notification[] = [];
  loading = true;
  unreadCount = 0;
  sidebarOpen = false;
  
  private subs = new Subscription();
  
  constructor(
    private notifService: NotificationService, 
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleSidebar(): void { 
    this.sidebarOpen = !this.sidebarOpen; 
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.notifService.refresh(100);
    
    this.subs.add(this.notifService.notifications$.subscribe(data => {
      this.allNotifications = data;
      this.notifications = data;
      this.unreadCount = data.filter(n => !n.read).length;
      this.cdr.detectChanges();
    }));

    this.subs.add(this.notifService.loading$.subscribe(loading => {
      this.loading = loading;
      this.cdr.detectChanges();
    }));
  }

  toggleStar(e: Event, n: Notification): void {
    e.stopPropagation();
    this.notifService.toggleSave(n.id);
  }

  markAsRead(n: Notification): void {
    this.notifService.markAsRead(n.id);
  }

  markAllAsRead(): void {
    this.notifService.markAllRead();
  }

  deleteNotification(e: Event, id: number): void {
    e.stopPropagation();
    this.notifService.delete(id);
  }

  archiving = false;
  showConfirmModal = false;

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  executeArchiveAll(): void {
    this.showConfirmModal = false;
    this.archiving = true;
    this.notifService.clearAll();
    
    setTimeout(() => {
      this.archiving = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  clearAll(): void {
    this.openConfirmModal();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
