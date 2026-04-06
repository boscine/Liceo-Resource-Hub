import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <span class="material-symbols-outlined">
            {{ toast.type === 'error' ? 'report' : 
               toast.type === 'success' ? 'check_circle' : 
               'info' }}
          </span>
          <p>{{ toast.message }}</p>
          <button class="close-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      border-left: 4px solid var(--primary);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      transition: transform 0.2s, opacity 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      &.error {
        border-left-color: var(--error);
        .material-symbols-outlined:first-child { color: var(--error); }
      }

      &.success {
        border-left-color: #2e7d32;
        .material-symbols-outlined:first-child { color: #2e7d32; }
      }

      &.info {
        border-left-color: var(--secondary);
        .material-symbols-outlined:first-child { color: var(--secondary); }
      }

      .material-symbols-outlined {
        font-size: 20px;
        opacity: 0.9;
      }

      p {
        font-family: var(--font-body);
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--on-surface);
        line-height: 1.4;
        flex: 1;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        padding: 0;
        color: var(--outline);
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
        .material-symbols-outlined { font-size: 16px; }
      }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
