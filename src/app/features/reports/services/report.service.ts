import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/paginated-result.model';
import { ReportApiResponse, ReportStatus, WasteReport } from '../models/waste-report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/wastereport`;

  getReports(
    pageNumber: number,
    pageSize: number,
    status?: ReportStatus | null
  ): Observable<PaginatedResult<WasteReport>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (status !== null && status !== undefined) {
      params = params.set('Status', status.toString());
    }

    return this.http.get<PaginatedResult<WasteReport>>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load reports.');
        }

        return {
          ...response,
          data: response.data ?? []
        };
      })
    );
  }

  getReportById(id: number): Observable<ReportApiResponse<WasteReport>> {
    return this.http.get<ReportApiResponse<WasteReport>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load report details.');
        }

        return response;
      })
    );
  }
}
