import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { clientTypeInterceptor } from './shared/interceptors/client-type.interceptor';
import { refreshTokenInterceptor } from './shared/interceptors/refresh-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([clientTypeInterceptor, authInterceptor, refreshTokenInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
      positionClass: 'toast-top-right'
    }),
    provideCharts(withDefaultRegisterables())
  ]
};
