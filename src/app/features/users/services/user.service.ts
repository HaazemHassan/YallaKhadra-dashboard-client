import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/paginated-result.model';
import { AddUserRequest } from '../models/add-user-request.model';
import { GetUsersByRoleRequest } from '../models/get-users-by-role-request.model';
import { UserApiResponse } from '../models/user-api-response.model';
import { ToggleLockResponse, UserByRole, UserDetails, WorkerDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userUrl = `${environment.apiBaseUrl}/api/user`;

  getUsersByRole(request: GetUsersByRoleRequest): Observable<PaginatedResult<UserByRole>> {
    let params = new HttpParams().set('Role', request.role);

    if (request.pageNumber !== undefined && request.pageNumber !== null) {
      params = params.set('PageNumber', request.pageNumber.toString());
    }

    if (request.pageSize !== undefined && request.pageSize !== null) {
      params = params.set('PageSize', request.pageSize.toString());
    }

    return this.http.get<PaginatedResult<UserByRole>>(`${this.userUrl}/by-role`, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load users from API.');
        }

        return {
          ...response,
          data: response.data ?? []
        };
      })
    );
  }

  getUserDetails(id: number): Observable<UserApiResponse<UserDetails>> {
    return this.http.get<UserApiResponse<UserDetails>>(`${this.userUrl}/${id}/details`).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load user details.');
        }

        return response;
      })
    );
  }

  getWorkerDetails(id: number): Observable<UserApiResponse<WorkerDetails>> {
    return this.http.get<UserApiResponse<WorkerDetails>>(`${this.userUrl}/${id}/worker-details`).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load worker details.');
        }

        return response;
      })
    );
  }

  toggleLock(id: number): Observable<UserApiResponse<ToggleLockResponse>> {
    return this.http.patch<UserApiResponse<ToggleLockResponse>>(`${this.userUrl}/${id}/toggle-lock`, {}).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to toggle user lock.');
        }

        return response;
      })
    );
  }

  addUser(request: AddUserRequest): Observable<UserApiResponse<unknown>> {
    return this.http.post<UserApiResponse<unknown>>(`${this.userUrl}/add-user`, request).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to add user.');
        }

        return response;
      })
    );
  }
}
