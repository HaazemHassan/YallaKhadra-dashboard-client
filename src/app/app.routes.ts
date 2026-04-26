import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { authChildGuard, authGuard, superAdminGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    component: HomeLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./features/home/home.routes').then((m) => m.HOME_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES)
      },
      {
        path: 'leaderboard',
        loadChildren: () =>
          import('./features/leaderboard/leaderboard.routes').then((m) => m.LEADERBOARD_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'workers',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.WORKERS_ROUTES)
      },
      {
        path: 'admins',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.ADMINS_ROUTES),
        canActivate: [superAdminGuard]
      },
      {
        path: 'add-worker',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.ADD_WORKER_ROUTES)
      },
      {
        path: 'add-admin',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.ADD_ADMIN_ROUTES),
        canActivate: [superAdminGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
