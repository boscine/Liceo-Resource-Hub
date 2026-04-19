import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  private lastToast: string = '';
  private lastToastTime: number = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const now = Date.now();
    // Throttle duplicate messages within 2 seconds
    if (message === this.lastToast && (now - this.lastToastTime) < 2000) {
      return;
    }
    this.lastToast = message;
    this.lastToastTime = now;

    const id = this.counter++;
    const toast: Toast = { message, type, id };
    this.toasts.update((t) => [...t, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  remove(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
