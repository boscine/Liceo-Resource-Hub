import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Array<{ id: number; icon: string; text: string; time: string; read: boolean }> = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Array<{ id: number; icon: string; text: string; time: string; read: boolean }>>('/notifications').subscribe({
      next: (data) => {
        this.notifications = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.notifications = [];
        this.loading = false;
      }
    });
  }

  markAsRead(n: any): void {
    if (n.read) return;
    n.read = true;
    this.api.put(`/notifications/${n.id}/read`, {}).subscribe();
  }

  markAllAsRead(): void {
    if (this.notifications.every(n => n.read)) return;
    this.notifications.forEach(n => n.read = true);
    this.api.put('/notifications/mark-all-read', {}).subscribe();
  }
}
