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
  filterModes: ('all' | 'resolved' | 'saved')[] = ['all'];
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
      this.applyFilter();
      this.unreadCount = data.filter(n => !n.read).length;
      this.cdr.detectChanges();
    }));

    this.subs.add(this.notifService.loading$.subscribe(loading => {
      this.loading = loading;
      this.cdr.detectChanges();
    }));
  }

  setFilter(mode: 'all' | 'resolved' | 'saved'): void {
    if (mode === 'all') {
      this.filterModes = ['all'];
    } else {
      const index = this.filterModes.indexOf(mode);
      if (index > -1) {
        this.filterModes.splice(index, 1);
        if (this.filterModes.length === 0) this.filterModes = ['all'];
      } else {
        const allIndex = this.filterModes.indexOf('all');
        if (allIndex > -1) this.filterModes.splice(allIndex, 1);
        this.filterModes.push(mode);
      }
    }
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.filterModes.includes('all')) {
      this.notifications = this.allNotifications;
    } else {
      this.notifications = this.allNotifications.filter(n => {
        let match = false;
        if (this.filterModes.includes('resolved') && n.type === 'resolved') match = true;
        if (this.filterModes.includes('saved') && n.isSaved) match = true;
        return match;
      });
    }
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
