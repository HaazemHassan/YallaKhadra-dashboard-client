import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UserStore } from '../services/user-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const userStore = inject(UserStore);
  const accessToken = userStore.accessToken();

  const isBackendRequest =
    request.url.startsWith(environment.apiBaseUrl) || request.url.startsWith('/api');

  if (!isBackendRequest || !accessToken) {
    return next(request);
  }

  const authorizedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return next(authorizedRequest);
};
