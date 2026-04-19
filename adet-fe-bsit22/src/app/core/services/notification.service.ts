import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, finalize } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface Notification {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
  isSaved?: boolean;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this._notifications$.asObservable();

  private _loading$ = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading$.asObservable();

  private _activeRequests = 0;

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private toast: ToastService
  ) {
    if (this.auth.isLoggedIn()) {
      this.refresh();
    }
  }

  private startLoading() {
    this._activeRequests++;
    this._loading$.next(true);
  }

  private stopLoading() {
    this._activeRequests = Math.max(0, this._activeRequests - 1);
    if (this._activeRequests === 0) {
      this._loading$.next(false);
    }
  }

  public refresh(limit: number = 20): void {
    if (!this.auth.isLoggedIn()) {
      this._notifications$.next([]);
      this._loading$.next(false);
      this._activeRequests = 0; // Reset counter for institutional hygiene
      return;
    }
    
    this.startLoading();
    this.api.get<Notification[]>(`/notifications?limit=${limit}`).pipe(
      catchError(err => {
        console.error('Institutional Notification Sync Failed:', err);
        return of([]);
      }),
      finalize(() => this.stopLoading())
    ).subscribe({
      next: (data) => {
        this._notifications$.next(Array.isArray(data) ? data : []);
      }
    });
  }

  public markAsRead(id: number): void {
    const current = this._notifications$.value;
    const index = current.findIndex(n => n.id === id);
    if (index === -1 || current[index].read) return;

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
    const kept = original.filter(n => n.isSaved);
    this._notifications$.next(kept);

    this.api.delete('/notifications/clear-all').pipe(
      catchError(err => {
        this.toast.error('Failed to clear notifications.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.toast.success('Your scholarly dispatch has been purged successfully.');
      }
    });
  }

  public toggleSave(id: number): void {
    const current = this._notifications$.value;
    const index = current.findIndex(n => n.id === id);
    if (index === -1) return;

    const original = [...current];
    const updated = current.map((n, i) => i === index ? { ...n, isSaved: !n.isSaved } : n);
    this._notifications$.next(updated);

    this.api.patch(`/notifications/${id}/save`, {}).pipe(
      catchError(err => {
        this.toast.error('Failed to star the scholarly dispatch.');
        this._notifications$.next(original);
        return of(null);
      })
    ).subscribe();
  }
}
