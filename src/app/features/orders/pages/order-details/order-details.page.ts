import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from '../../models/order-status.constant';
import { OrderDetails } from '../../models/order-details.model';
import { OrderStatus } from '../../models/order-status.enum';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.page.html'
})
export class OrderDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly ordersService = inject(OrdersService);
  private readonly toastr = inject(ToastrService);

  readonly timelineStatuses = ORDER_STATUS_OPTIONS.filter((status) => status.value !== OrderStatus.Canceled);

  orderId: number | null = null;
  orderDetails: OrderDetails | null = null;
  isLoading = false;
  isCancelling = false;
  isAdvancingStatus = false;
  isCancelDialogOpen = false;
  loadError: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || !Number.isInteger(parsedId) || parsedId <= 0) {
      this.loadError = 'Invalid order id.';
      return;
    }

    this.orderId = parsedId;
    this.loadOrderDetails(parsedId);
  }

  goBack(): void {
    this.location.back();
  }

  get isCanceled(): boolean {
    return this.orderDetails?.status === OrderStatus.Canceled;
  }

  get isDelivered(): boolean {
    return this.orderDetails?.status === OrderStatus.Delivered;
  }

  get isCancelableStatus(): boolean {
    return this.orderDetails?.status === OrderStatus.Pending || this.orderDetails?.status === OrderStatus.Processing;
  }

  get canCancelOrder(): boolean {
    return !!this.orderDetails && this.isCancelableStatus && !this.isCancelling;
  }

  get itemsTotalPoints(): number {
    if (!this.orderDetails) {
      return 0;
    }

    return this.orderDetails.orderItems.reduce((total, item) => total + item.totalPoints, 0);
  }

  isStepActive(status: OrderStatus): boolean {
    if (!this.orderDetails || this.isCanceled) {
      return false;
    }

    return this.orderDetails.status === status;
  }

  isStepDone(status: OrderStatus): boolean {
    if (!this.orderDetails || this.isCanceled) {
      return false;
    }

    return status < this.orderDetails.status;
  }

  canAdvanceToStatus(status: OrderStatus): boolean {
    if (!this.orderDetails || this.isCanceled || this.isDelivered || this.isAdvancingStatus || this.isCancelling) {
      return false;
    }

    return status === this.orderDetails.status + 1;
  }

  navigateToOrdersList(): void {
    void this.router.navigateByUrl('/dashboard/orders');
  }

  openCancelDialog(): void {
    if (!this.canCancelOrder) {
      return;
    }

    this.isCancelDialogOpen = true;
  }

  closeCancelDialog(): void {
    this.isCancelDialogOpen = false;
  }

  confirmCancelOrder(): void {
    if (!this.orderId || !this.canCancelOrder) {
      return;
    }

    this.isCancelling = true;

    this.ordersService
      .cancelOrder(this.orderId)
      .pipe(finalize(() => (this.isCancelling = false)))
      .subscribe({
        next: (message) => {
          if (this.orderDetails) {
            this.orderDetails = {
              ...this.orderDetails,
              status: OrderStatus.Canceled,
              statusName: 'Canceled'
            };
          }

          this.toastr.success(message);
          this.closeCancelDialog();
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to cancel order. Please try again.');
          this.toastr.error(message);
        }
      });
  }

  onTimelineStepClick(status: OrderStatus): void {
    if (!this.orderId || !this.orderDetails || !this.canAdvanceToStatus(status)) {
      return;
    }

    this.isAdvancingStatus = true;

    this.ordersService
      .advanceOrderStatus(this.orderId)
      .pipe(finalize(() => (this.isAdvancingStatus = false)))
      .subscribe({
        next: (message) => {
          this.orderDetails = {
            ...this.orderDetails!,
            status,
            statusName: getOrderStatusLabel(status)
          };

          this.toastr.success(message);
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to advance order status. Please try again.');
          this.toastr.error(message);
        }
      });
  }

  private loadOrderDetails(id: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.ordersService
      .getOrderById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (order) => {
          this.orderDetails = order;
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load order details. Please try again.');
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
