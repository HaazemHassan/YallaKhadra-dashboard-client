import { Routes } from '@angular/router';
import { OrderDetailsPageComponent } from './pages/order-details/order-details.page';
import { OrdersPageComponent } from './pages/orders/orders.page';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OrdersPageComponent
  },
  {
    path: ':id',
    component: OrderDetailsPageComponent
  }
];
