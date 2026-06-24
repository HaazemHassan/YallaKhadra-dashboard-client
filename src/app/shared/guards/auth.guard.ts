import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { UserRole } from '../enums/user-role.enum';

import { UserStore } from '../services/user-store';

const isAuthenticated = (): boolean => {
  const userStore = inject(UserStore);
  return userStore.isAuthenticated();
};

const redirectToLogin = () => {
  const router = inject(Router);
  return router.parseUrl('/login');
};

const redirectToHome = () => {
  const router = inject(Router);
  return router.parseUrl('/dashboard/home');
};

export const authGuard: CanActivateFn = () => {
  if (isAuthenticated()) {
    return true;
  }

  return redirectToLogin();
};

export const authChildGuard: CanActivateChildFn = () => {
  if (isAuthenticated()) {
    return true;
  }

  return redirectToLogin();
};

export const guestGuard: CanActivateFn = () => {
  if (!isAuthenticated()) {
    return true;
  }

  return redirectToHome();
};

export const superAdminGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (userStore.roles().includes(UserRole.SuperAdmin)) {
    return true;
  }

  toastr.error('You do not have permission to access this page.');
  return router.parseUrl('/dashboard/home');
};
