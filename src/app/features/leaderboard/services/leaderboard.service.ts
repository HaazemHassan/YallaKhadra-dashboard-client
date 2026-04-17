import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GetLeaderboardRequest } from '../models/requests/get-leaderboard-request.model';
import { GetLeaderboardResponse } from '../models/responses/get-leaderboard-response.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly leaderboardUrl = `${environment.apiBaseUrl}/api/Leaderboard`;

  getLeaderboard(request: GetLeaderboardRequest): Observable<GetLeaderboardResponse> {
    let params = new HttpParams();

    if (request.pageNumber !== undefined && request.pageNumber !== null) {
      params = params.set('pageNumber', request.pageNumber.toString());
    }

    if (request.pageSize !== undefined && request.pageSize !== null) {
      params = params.set('pageSize', request.pageSize.toString());
    }

    if (request.period !== undefined && request.period !== null) {
      params = params.set('period', request.period.toString());
    }

    return this.http.get<GetLeaderboardResponse>(this.leaderboardUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load leaderboard data from API.');
        }

        return {
          ...response,
          data: response.data ?? []
        };
      })
    );
  }
}
