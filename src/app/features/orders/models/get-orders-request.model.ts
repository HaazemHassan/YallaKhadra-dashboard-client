import { OrderStatus } from './order-status.enum';

export interface GetOrdersRequest {
  pageNumber: number;
  pageSize: number;
  userFullName?: string;
  status?: OrderStatus;
}
