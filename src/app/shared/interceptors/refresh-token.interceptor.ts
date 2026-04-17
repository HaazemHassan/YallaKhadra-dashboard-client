import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../features/auth/models/api-response';
import { AuthResult } from '../../features/auth/models/auth-result';
import { UserStore } from '../services/user-store';

let refreshRequest$: Observable<AuthResult> | null = null;

const isBackendRequest = (url: string): boolean =>
  url.startsWith(environment.apiBaseUrl) || url.startsWith('/api');

const isAuthRefreshOrLoginRequest = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();
  return normalizedUrl.includes('/api/authentication/login') || normalizedUrl.includes('/api/authentication/refresh-token');
};

const createRefreshRequest = (httpBackend: HttpBackend, accessToken: string): Observable<AuthResult> => {
  const rawHttpClient = new HttpClient(httpBackend);
  const refreshUrl = `${environment.apiBaseUrl}/api/authentication/refresh-token`;

  return rawHttpClient
    .post<ApiResponse<AuthResult>>(
      refreshUrl,
      { accessToken },
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'X-Client-Type': 'Web'
        })
      }
    )
    .pipe(
      map((response) => {
        if (!response.succeeded || !response.data?.accessToken) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to refresh token.');
        }

        return response.data;
      })
    );
};

export const refreshTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (!isBackendRequest(request.url) || isAuthRefreshOrLoginRequest(request.url)) {
        return throwError(() => error);
      }

      const currentAccessToken = userStore.accessToken();
      if (!currentAccessToken) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = createRefreshRequest(httpBackend, currentAccessToken).pipe(
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay(1)
        );
      }

      return refreshRequest$.pipe(
        switchMap((authResult) => {
          userStore.setSession(authResult);

          const retriedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${authResult.accessToken}`
            }
          });

          return next(retriedRequest);
        }),
        catchError((refreshError: unknown) => {
          userStore.clear();
          void router.navigateByUrl('/login');
          return throwError(() => refreshError);
        })
      );
    })
  );
};
