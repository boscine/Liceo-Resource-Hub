import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router }       from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email        = '';
  password     = '';
  remember     = false;
  error        = '';
  loading      = false;
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error   = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate([this.auth.isAdmin() ? '/admin' : '/feed']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
