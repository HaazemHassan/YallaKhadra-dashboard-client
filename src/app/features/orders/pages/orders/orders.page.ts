import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from '../../models/order-status.constant';
import { Order } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.page.html'
})
export class OrdersPageComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly searchChanged$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  readonly orderStatuses = ORDER_STATUS_OPTIONS;
  readonly allStatusesFilterValue = 'all';
  readonly perPage = 8;

  orders: Order[] = [];
  searchTerm = '';
  statusFilter: OrderStatus | 'all' = this.allStatusesFilterValue;

  page = 1;
  pageSize = this.perPage;
  totalPages = 1;
  totalCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  isLoading = false;
  loadError: string | null = null;

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadOrders(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pagedOrders(): Order[] {
    return this.orders;
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

    return Math.min(this.pageStart + this.pagedOrders.length - 1, this.totalCount);
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.searchChanged$.next(this.searchTerm.trim());
  }

  onStatusFilterChange(filter: OrderStatus | 'all' | string): void {
    if (filter === this.allStatusesFilterValue) {
      this.statusFilter = this.allStatusesFilterValue;
      this.page = 1;
      this.loadOrders(1);
      return;
    }

    const parsedStatus = Number(filter);
    if (!Number.isInteger(parsedStatus)) {
      return;
    }

    this.statusFilter = parsedStatus as OrderStatus;
    this.page = 1;
    this.loadOrders(1);
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.loadOrders(this.page - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.loadOrders(this.page + 1);
  }

  getStatusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  openOrderDetails(orderId: number): void {
    void this.router.navigate(['/dashboard/orders', orderId]);
  }

  private loadOrders(targetPage: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.ordersService
      .getOrders({
        pageNumber: targetPage,
        pageSize: this.perPage,
        userFullName: this.searchTerm,
        status: this.getSelectedStatus()
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.orders = result.data ?? [];
          this.page = result.currentPage;
          this.pageSize = result.pageSize > 0 ? result.pageSize : this.perPage;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalCount = result.totalCount;
          this.hasPreviousPage = result.hasPreviousPage;
          this.hasNextPage = result.hasNextPage;
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load orders. Please try again.');

          this.orders = [];
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

  private getSelectedStatus(): OrderStatus | undefined {
    if (this.statusFilter === this.allStatusesFilterValue) {
      return undefined;
    }

    return this.statusFilter;
  }

  private setupSearchDebounce(): void {
    this.searchChanged$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadOrders(1);
      });
  }

  private resolveErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string; messages?: string[] } | string | null;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (apiError && typeof apiError === 'object') {
        if ('messages' in apiError && Array.isArray(apiError.messages) && apiError.messages.length > 0) {
          return apiError.messages[0] ?? fallbackMessage;
        }

        if ('message' in apiError && typeof apiError.message === 'string' && apiError.message.trim()) {
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
