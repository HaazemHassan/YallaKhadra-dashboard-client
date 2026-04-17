import { EcommerceSnapshot } from './ecommerce-snapshot.interface';
import { ReportsSnapshot } from './reports-snapshot.interface';
import { UsersSnapshot } from './users-snapshot.interface';

export interface DashboardSnapshot {
  reports: ReportsSnapshot;
  users: UsersSnapshot;
  ecommerce: EcommerceSnapshot;
}
