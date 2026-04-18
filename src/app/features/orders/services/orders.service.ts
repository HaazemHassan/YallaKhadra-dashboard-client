import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/paginated-result.model';
import { OrderApiResponse } from '../models/order-api-response.model';
import { OrderDetails } from '../models/order-details.model';
import { GetOrdersRequest } from '../models/get-orders-request.model';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/order-status.enum';

interface OrderListItemApiDto {
  id: number;
  userFullName: string;
  date: string;
  itemsCount: number;
  totalPoints: number;
  status: OrderStatus;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${environment.apiBaseUrl}/api/admin/order`;

  getOrders(request: GetOrdersRequest): Observable<PaginatedResult<Order>> {
    let params = new HttpParams()
      .set('PageNumber', request.pageNumber.toString())
      .set('PageSize', request.pageSize.toString());

    if (request.userFullName && request.userFullName.trim()) {
      params = params.set('UserFullName', request.userFullName.trim());
    }

    if (request.status !== undefined) {
      params = params.set('Status', request.status.toString());
    }

    return this.http.get<PaginatedResult<OrderListItemApiDto>>(this.ordersUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load orders from API.');
        }

        return {
          ...response,
          data: (response.data ?? []).map((order) => ({
            id: order.id,
            userName: order.userFullName,
            date: order.date,
            itemCount: order.itemsCount,
            totalPoints: order.totalPoints,
            status: order.status
          }))
        };
      })
    );
  }

  getOrderById(orderId: number): Observable<OrderDetails> {
    return this.http.get<OrderApiResponse<OrderDetails>>(`${this.ordersUrl}/${orderId}`).pipe(
      map((response) => {
        if (!response.succeeded || !response.data) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to load order details.');
        }

        return {
          ...response.data,
          orderItems: response.data.orderItems ?? []
        };
      })
    );
  }

  cancelOrder(orderId: number): Observable<string> {
    return this.http.patch<OrderApiResponse<unknown>>(`${this.ordersUrl}/${orderId}/cancel`, {}).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to cancel order.');
        }

        return response.message ?? `Order #${orderId} has been canceled successfully.`;
      })
    );
  }

  advanceOrderStatus(orderId: number): Observable<string> {
    return this.http.patch<OrderApiResponse<unknown>>(`${this.ordersUrl}/${orderId}/status/next`, {}).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to advance order status.');
        }

        return response.message ?? `Order #${orderId} status updated successfully.`;
      })
    );
  }
}
