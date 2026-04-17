import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { AuthResult } from '../models/auth-result';
import { LoginRequest } from '../models/login-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly httpBackend = inject(HttpBackend);
  private readonly rawHttp = new HttpClient(this.httpBackend);

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<AuthResult>>(
      `${environment.apiBaseUrl}/api/authentication/login`,
      request,
      { withCredentials: true }
    );
  }

  refreshAccessToken(accessToken: string) {
    return this.rawHttp.post<ApiResponse<AuthResult>>(
      `${environment.apiBaseUrl}/api/authentication/refresh-token`,
      { accessToken },
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'X-Client-Type': 'Web'
        })
      }
    );
  }
}
