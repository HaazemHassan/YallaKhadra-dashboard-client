import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ReportStatus, REPORT_STATUS_LABELS, WASTE_TYPE_LABELS, WasteReport } from '../../models/waste-report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-details.component.html'
})
export class ReportDetailsComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();

  report: WasteReport | null = null;
  isLoading = true;
  loadError: string | null = null;
  ReportStatus = ReportStatus;

  ngOnInit(): void {
    const reportId = Number(this.route.snapshot.paramMap.get('id'));

    if (isNaN(reportId) || reportId <= 0) {
      this.loadError = 'Invalid report ID.';
      this.isLoading = false;
      return;
    }

    this.loadReportDetails(reportId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    void this.router.navigate(['/dashboard/reports']);
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
        return 'bg-transparent text-foreground border border-input';
      case ReportStatus.InProgress:
        return 'bg-secondary text-secondary-foreground border-transparent';
      case ReportStatus.Done:
        return 'bg-primary text-primary-foreground border-transparent';
      default:
        return 'bg-transparent text-foreground border border-input';
    }
  }

  getMapUrl(lat: number, lng: number): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private loadReportDetails(id: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.reportService
      .getReportById(id)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.report = response.data ?? null;
          if (!this.report) {
            this.loadError = 'Report details not found.';
          }
        },
        error: (error: unknown) => {
          this.loadError = error instanceof Error ? error.message : 'Failed to load report details.';
          this.toastr.error(this.loadError);
        }
      });
  }
}
