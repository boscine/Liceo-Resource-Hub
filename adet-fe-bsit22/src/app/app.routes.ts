// app.route.ts
import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { PublicPortalComponent } from './pages/public/public-portal.component';

export const routes: Routes = [
  {
    path: 'public',
    component: PublicPortalComponent
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [GuestGuard],
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify',
    loadComponent: () => import('./pages/auth/verify').then(m => m.VerifyComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'feed',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/student/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'post/create',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/student/post-create/post-create.component').then(m => m.PostCreateComponent)
  },
  {
    path: 'curator-guide',
    loadComponent: () => import('./pages/student/curator-guide/curator-guide.component').then(m => m.CuratorGuideComponent)
  },
  {
    path: 'admin/dashboard',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  {
    path: 'post/:id',
    canActivate: [AuthGuard], // Protection for deep links
    loadComponent: () => import('./pages/student/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  {
    path: 'post/:id/edit',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/student/post-edit/post-edit.component').then(m => m.PostEditComponent)
  },
  {
    path: 'admin/posts',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin/posts/posts.component').then(m => m.PostsComponent)
  },
  {
    path: 'admin/reports',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/student/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  { path: 'notifactions', redirectTo: 'notifications' },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/student/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/student/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
  },
  { path: '**', redirectTo: '/login' }
];