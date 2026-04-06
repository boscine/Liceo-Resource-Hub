import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],  
  // We use backticks (`) for the template to allow multiple lines
  template: `
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  
}