// app.route.ts
import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify',
    loadComponent: () => import('./pages/auth/verify').then(m => m.VerifyComponent)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/student/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'post/create',
    loadComponent: () => import('./pages/student/post-create/post-create.component').then(m => m.PostCreateComponent)
  },
  {
    path: 'admin/dashboard',
    canActivate: [AdminGuard], // You need to create this guard
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./pages/student/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  {
    path: 'post/edit/:id',
    loadComponent: () => import('./pages/student/post-edit/post-edit.component').then(m => m.PostEditComponent)
  },
  {
    path: 'admin/posts',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin/posts/posts.component').then(m => m.PostsComponent)
  },
  { path: '**', redirectTo: 'feed' }
];