import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError, of } from 'rxjs';

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

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private toast: ToastService
  ) {
    if (this.auth.isLoggedIn()) {
      this.refresh();
    }
  }

  public refresh(limit: number = 20): void {
    if (!this.auth.isLoggedIn()) return;
    this._loading$.next(true);
    this.api.get<Notification[]>(`/notifications?limit=${limit}`).subscribe({
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
    const index = current.findIndex(n => n.id === id);
    if (index === -1 || current[index].read) return;

    // Save state for rollback
    const original = [...current];
    const updated = current.map((n, i) => i === index ? { ...n, read: true } : n);
    
    this._notifications$.next(updated);

    this.api.put(`/notifications/${id}/read`, {}).pipe(
      catchError(err => {
        this.toast.error('Failed to mark notification as read.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe();
  }

  public markAllRead(): void {
    const current = this._notifications$.value;
    if (current.every(n => n.read)) return;

    const original = [...current];
    const updated = current.map(n => ({ ...n, read: true }));
    
    this._notifications$.next(updated);

    this.api.put('/notifications/mark-all-read', {}).pipe(
      catchError(err => {
        this.toast.error('Failed to mark all notifications as read.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe();
  }

  public delete(id: number): void {
    const current = this._notifications$.value;
    const original = [...current];
    const filtered = current.filter(n => n.id !== id);
    
    this._notifications$.next(filtered);

    this.api.delete(`/notifications/${id}`).pipe(
      catchError(err => {
        this.toast.error('Failed to delete notification.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe();
  }

  public clearAll(): void {
    const original = this._notifications$.value;
    this._notifications$.next([]);

    this.api.delete('/notifications/clear-all').pipe(
      catchError(err => {
        this.toast.error('Failed to clear notifications.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe();
  }
}
