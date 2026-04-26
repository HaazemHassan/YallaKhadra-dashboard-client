import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ReportApiResponse, ReportStatus, REPORT_STATUS_LABELS, WASTE_TYPE_LABELS, WasteReport } from '../../models/waste-report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-list.component.html'
})
export class ReportListComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  reports: WasteReport[] = [];

  isLoading = false;
  loadError: string | null = null;

  statusFilter: string = 'all';
  readonly statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: '0', label: 'Pending' },
    { value: '1', label: 'In Progress' },
    { value: '2', label: 'Done' }
  ];

  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20];
  totalPages = 1;
  totalCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  ngOnInit(): void {
    this.loadReports(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusLabel(status: number): string {
    return REPORT_STATUS_LABELS[status] ?? 'Unknown';
  }

  getWasteTypeLabel(type: number): string {
    return WASTE_TYPE_LABELS[type] ?? 'Unknown';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case ReportStatus.Pending:
        return 'badge-pending';
      case ReportStatus.InProgress:
        return 'badge-in-progress';
      case ReportStatus.Done:
        return 'badge-done';
      default:
        return 'badge-pending';
    }
  }

  get canGoPrevious(): boolean {
    return this.hasPreviousPage && !this.isLoading;
  }

  get canGoNext(): boolean {
    return this.hasNextPage && !this.isLoading;
  }

  get pageStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  onStatusFilterChange(): void {
    this.page = 1;
    this.loadReports(1);
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
    this.loadReports(1);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.page || this.isLoading) {
      return;
    }

    this.loadReports(pageNumber);
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.loadReports(this.page - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.loadReports(this.page + 1);
  }

  navigateToReport(report: WasteReport): void {
    void this.router.navigate(['/dashboard/reports', report.id]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private loadReports(targetPage: number): void {
    this.isLoading = true;
    this.loadError = null;

    const status = this.statusFilter === 'all' ? null : Number(this.statusFilter);

    this.reportService
      .getReports(targetPage, this.pageSize, status)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (result) => {
          this.reports = result.data ?? [];
          this.page = result.currentPage;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalCount = result.totalCount;
          this.hasPreviousPage = result.hasPreviousPage;
          this.hasNextPage = result.hasNextPage;
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load reports. Please try again.');

          this.reports = [];
          this.page = 1;
          this.totalPages = 1;
          this.totalCount = 0;
          this.hasPreviousPage = false;
          this.hasNextPage = false;
          this.loadError = message;

          this.toastr.error(message);
        }
      });
  }

  private resolveErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ReportApiResponse<unknown> | string | null;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (apiError && typeof apiError === 'object') {
        if (apiError.errors && apiError.errors.length > 0) {
          return apiError.errors[0];
        }

        if (apiError.message && apiError.message.trim()) {
          return apiError.message;
        }
      }

      if (error.message.trim()) {
        return error.message;
      }
    }

    return fallbackMessage;
  }
}
