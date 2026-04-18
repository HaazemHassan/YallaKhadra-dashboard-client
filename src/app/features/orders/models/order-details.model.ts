import { OrderItemDetails } from './order-item-details.model';
import { OrderShippingDetails } from './order-shipping-details.model';
import { OrderStatus } from './order-status.enum';

export interface OrderDetails {
  id: number;
  orderDate: string;
  totalPoints: number;
  status: OrderStatus;
  statusName: string;
  shippingDetails: OrderShippingDetails;
  orderItems: OrderItemDetails[];
}
