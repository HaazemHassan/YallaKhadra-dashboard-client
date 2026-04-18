import { OrderStatus } from './order-status.enum';

export interface Order {
  id: number;
  date: string;
  totalPoints: number;
  status: OrderStatus;
  itemCount: number;
  userName: string;
}
