import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.page';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: LoginPageComponent
  },
  {
    path: 'confirm-email',
    loadComponent: () => import('./pages/confirm-email/confirm-email.page').then(m => m.ConfirmEmailPageComponent)
  }
];
