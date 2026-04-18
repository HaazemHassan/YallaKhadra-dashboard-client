import { OrderStatus } from './order-status.enum';

export interface OrderStatusOption {
  value: OrderStatus;
  label: string;
}

export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { value: OrderStatus.Pending, label: 'Pending' },
  { value: OrderStatus.Processing, label: 'Processing' },
  { value: OrderStatus.Shipped, label: 'Shipped' },
  { value: OrderStatus.Delivered, label: 'Delivered' },
  { value: OrderStatus.Canceled, label: 'Canceled' }
];

const ORDER_STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Processing]: 'Processing',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Canceled]: 'Canceled'
};

export const getOrderStatusLabel = (status: OrderStatus): string => ORDER_STATUS_LABEL_MAP[status] ?? 'Unknown';
