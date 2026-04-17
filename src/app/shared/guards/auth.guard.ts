import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { UserStore } from '../services/user-store';

const isAuthenticated = (): boolean => {
  const userStore = inject(UserStore);
  return userStore.isAuthenticated();
};

const redirectToLogin = () => {
  const router = inject(Router);
  return router.navigateByUrl('/login');
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
