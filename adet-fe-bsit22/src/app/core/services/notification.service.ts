import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this._notifications$.asObservable();

  private _loading$ = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading$.asObservable();

  constructor(private api: ApiService, private auth: AuthService) {
    if (this.auth.isLoggedIn()) {
      this.refresh();
    }
  }

  public refresh(): void {
    if (!this.auth.isLoggedIn()) return;
    this._loading$.next(true);
    this.api.get<Notification[]>('/notifications').subscribe({
      next: (data) => {
        this._notifications$.next(Array.isArray(data) ? data : []);
        this._loading$.next(false);
      },
      error: () => {
        this._loading$.next(false);
      }
    });
  }

  public markAsRead(id: number): void {
    const current = this._notifications$.value;
    const notif = current.find(n => n.id === id);
    if (!notif || notif.read) return;

    notif.read = true;
    this._notifications$.next([...current]);
    this.api.put(`/notifications/${id}/read`, {}).subscribe();
  }

  public markAllRead(): void {
    const current = this._notifications$.value;
    if (current.every(n => n.read)) return;

    current.forEach(n => n.read = true);
    this._notifications$.next([...current]);
    this.api.put('/notifications/mark-all-read', {}).subscribe();
  }
}
