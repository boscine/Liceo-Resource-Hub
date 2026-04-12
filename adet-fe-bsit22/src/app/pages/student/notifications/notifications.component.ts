import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  private sub?: Subscription;

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    // We want more than 20 if we are on the dedicated page
    this.notifService.refresh(100);
    
    this.sub = this.notifService.notifications$.subscribe(data => {
      this.notifications = data;
    });

    this.notifService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

  clearAll(): void {
    if (confirm('Are you sure you want to clear your scholarly dispatch inbox?')) {
      this.notifService.clearAll();
    }
  }
}
