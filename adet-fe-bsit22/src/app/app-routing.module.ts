import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { GuestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent), canActivate: [GuestGuard] },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent), canActivate: [GuestGuard] },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent), canActivate: [GuestGuard] },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), canActivate: [GuestGuard] },

  // Student
  { path: 'feed', loadComponent: () => import('./pages/student/feed/feed.component').then(m => m.FeedComponent), canActivate: [AuthGuard] },   { path: 'post/create', loadComponent: () => import('./pages/student/post-create/post-create.component').then(m => m.PostCreateComponent), canActivate: [AuthGuard] },
  { path: 'post/:id', loadComponent: () => import('./pages/student/post-detail/post-detail.component').then(m => m.PostDetailComponent), canActivate: [AuthGuard] },  
  { path: 'post/:id/edit', loadComponent: () => import('./pages/student/post-edit/post-edit.component').then(m => m.PostEditComponent), canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./pages/student/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'profile/:id', loadComponent: () => import('./pages/student/profile-view/profile-view.component').then(m => m.ProfileViewComponent), canActivate: [AuthGuard] },

  // Admin
  {
    path: 'admin', canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'posts', loadComponent: () => import('./pages/admin/posts/posts.component').then(m => m.PostsComponent) },
      { path: 'reports', loadComponent: () => import('./pages/admin/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },

  { path: '**', redirectTo: '/feed' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
