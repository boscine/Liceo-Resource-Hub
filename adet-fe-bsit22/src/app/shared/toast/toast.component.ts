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
      z-index: 10001; /* Above modas and nav */
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none; /* Allow clicking through container */

      @media (max-width: 600px) {
        bottom: 1.5rem;
        left: 1rem;
        right: 1rem;
        top: auto;
        max-width: none;
      }
    }

    .toast {
      pointer-events: auto; /* Re-enable clicks for actual toasts */
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.1rem 1.4rem;
      background: #ffffff;
      border-radius: 1rem;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--outline-variant);
      border-left: 5px solid var(--primary);
      cursor: pointer;
      animation: slideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      transition: transform 0.2s, opacity 0.2s;

      &:active {
        transform: scale(0.98);
      }

      @media (max-width: 600px) {
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
      }

      &.error {
        border-left-color: var(--error);
        .material-symbols-outlined:first-child { color: var(--error); }
      }

      &.success {
        border-left-color: var(--success);
        .material-symbols-outlined:first-child { color: var(--success); }
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
        font-weight: 600;
        color: #191c1d; /* Always dark text for high-contrast on white background */
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
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (min-width: 601px) {
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    }
    
    @media (max-width: 600px) {
      @keyframes slideIn {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
