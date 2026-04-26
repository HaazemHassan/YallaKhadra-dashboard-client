import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardSnapshot } from '../models/dashboard-snapshot.interface';
import { PeriodKey } from '../models/period-key.enum';

export interface DashboardApiResponse {
  statusCode?: number;
  meta?: unknown;
  succeeded: boolean;
  message?: string;
  errors?: string[] | null;
  data?: DashboardAnalyticsDto | null;
}

export interface DashboardAnalyticsDto {
  reportsAnalytics: {
    totalReports: number;
    pendingReports: number;
    inProgressReports: number;
    completedReports: number;
    wasteCollectedInKg: number;
    aiScans: number;
  };
  usersOverview: {
    totalUsers: number;
    workers: number;
    admins: number;
  };
  eCommerceAnalytics: {
    categories: number;
    products: number;
    orders: number;
    itemsSold: number;
  };
}

export interface TrendDataPoint {
  dateLabel: string;
  value: number;
}

export interface DashboardTrendsDto {
  reportsTrend: TrendDataPoint[];
  ordersTrend: TrendDataPoint[];
}

export interface DashboardTrendsApiResponse {
  statusCode?: number;
  meta?: unknown;
  succeeded: boolean;
  message?: string;
  errors?: string[] | null;
  data?: DashboardTrendsDto | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly dashboardUrl = `${environment.apiBaseUrl}/api/dashboard`;

  getAnalytics(period: PeriodKey): Observable<DashboardSnapshot> {
    const periodQuery = this.mapPeriodKeyToQuery(period);
    let params = new HttpParams();
    if (periodQuery) {
      params = params.set('Period', periodQuery);
    }

    return this.http.get<DashboardApiResponse>(`${this.dashboardUrl}/analytics`, { params }).pipe(
      map((response) => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load dashboard analytics.');
        }
        
        return this.mapToSnapshot(response.data);
      })
    );
  }

  private mapPeriodKeyToQuery(period: PeriodKey): string {
    switch (period) {
      case PeriodKey.All:
        return 'AllTime';
      case PeriodKey.Yearly:
        return 'Yearly';
      case PeriodKey.Monthly:
        return 'Monthly';
      case PeriodKey.Weekly:
        return 'Weekly';
      default:
        return 'AllTime';
    }
  }

  getTrends(period: PeriodKey): Observable<DashboardTrendsDto> {
    const periodQuery = this.mapPeriodKeyToQuery(period);
    let params = new HttpParams();
    if (periodQuery) {
      params = params.set('Period', periodQuery);
    }
    return this.http.get<DashboardTrendsApiResponse>(`${this.dashboardUrl}/trends`, { params }).pipe(
      map((response) => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load dashboard trends.');
        }
        return response.data;
      })
    );
  }

  private mapToSnapshot(dto: DashboardAnalyticsDto): DashboardSnapshot {
    return {
      reports: {
        total: dto.reportsAnalytics.totalReports,
        pending: dto.reportsAnalytics.pendingReports,
        inProgress: dto.reportsAnalytics.inProgressReports,
        completed: dto.reportsAnalytics.completedReports,
        waste: dto.reportsAnalytics.wasteCollectedInKg,
        aiScans: dto.reportsAnalytics.aiScans
      },
      users: {
        total: dto.usersOverview.totalUsers,
        workers: dto.usersOverview.workers,
        admins: dto.usersOverview.admins
      },
      ecommerce: {
        categories: dto.eCommerceAnalytics.categories,
        products: dto.eCommerceAnalytics.products,
        orders: dto.eCommerceAnalytics.orders,
        itemsSold: dto.eCommerceAnalytics.itemsSold
      }
    };
  }
}
