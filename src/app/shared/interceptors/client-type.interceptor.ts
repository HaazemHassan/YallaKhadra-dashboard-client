import { HttpInterceptorFn } from '@angular/common/http';

export const clientTypeInterceptor: HttpInterceptorFn = (request, next) => {
  const clientRequest = request.clone({
    setHeaders: {
      'X-Client-Type': 'Web'
    }
  });

  return next(clientRequest);
};
