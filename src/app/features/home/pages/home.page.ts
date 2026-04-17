import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardSnapshot } from '../models/dashboard-snapshot.interface';
import { PeriodKey } from '../models/period-key.enum';
import { StatCard } from '../models/stat-card.interface';

const SNAPSHOTS: Record<PeriodKey, DashboardSnapshot> = {
  [PeriodKey.All]: {
    reports: { total: 1284, pending: 47, inProgress: 23, completed: 1214, waste: 8740, aiScans: 3621 },
    users: { total: 2450, workers: 38, admins: 5 },
    ecommerce: { categories: 12, products: 86, orders: 634, itemsSold: 2180 }
  },
  [PeriodKey.Yearly]: {
    reports: { total: 1284, pending: 47, inProgress: 23, completed: 1214, waste: 8740, aiScans: 3621 },
    users: { total: 2450, workers: 38, admins: 5 },
    ecommerce: { categories: 12, products: 86, orders: 634, itemsSold: 2180 }
  },
  [PeriodKey.Monthly]: {
    reports: { total: 156, pending: 12, inProgress: 8, completed: 136, waste: 1024, aiScans: 412 },
    users: { total: 185, workers: 6, admins: 1 },
    ecommerce: { categories: 12, products: 86, orders: 71, itemsSold: 245 }
  },
  [PeriodKey.Weekly]: {
    reports: { total: 38, pending: 5, inProgress: 3, completed: 30, waste: 256, aiScans: 98 },
    users: { total: 42, workers: 2, admins: 0 },
    ecommerce: { categories: 12, products: 86, orders: 18, itemsSold: 62 }
  }
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html'
})
export class HomePageComponent {
  readonly periods: Array<{ key: PeriodKey; label: string }> = [
    { key: PeriodKey.All, label: 'All Time' },
    { key: PeriodKey.Yearly, label: 'Yearly' },
    { key: PeriodKey.Monthly, label: 'Monthly' },
    { key: PeriodKey.Weekly, label: 'Weekly' }
  ];

  period: PeriodKey = PeriodKey.All;

  setPeriod(period: PeriodKey): void {
    this.period = period;
  }

  get reportCards(): StatCard[] {
    const data = SNAPSHOTS[this.period].reports;
    return [
      {
        title: 'Total Reports',
        value: data.total,
        hint: 'Total waste reports submitted',
        colorClass: 'text-primary'
      },
      {
        title: 'Pending',
        value: data.pending,
        hint: 'Reports awaiting review',
        colorClass: 'text-amber-500'
      },
      {
        title: 'In Progress',
        value: data.inProgress,
        hint: 'Reports currently being handled',
        colorClass: 'text-sky-500'
      },
      {
        title: 'Completed',
        value: data.completed,
        hint: 'Successfully resolved reports',
        colorClass: 'text-emerald-600'
      },
      {
        title: 'Waste Collected (Kg)',
        value: data.waste,
        hint: 'Total waste collected in kilograms',
        colorClass: 'text-primary'
      },
      {
        title: 'AI Scans',
        value: data.aiScans,
        hint: 'Waste identified via AI scanning',
        colorClass: 'text-violet-500'
      }
    ];
  }

  get userCards(): StatCard[] {
    const data = SNAPSHOTS[this.period].users;
    return [
      {
        title: 'Total Users',
        value: data.total,
        hint: 'All registered platform users',
        colorClass: 'text-primary'
      },
      {
        title: 'Workers',
        value: data.workers,
        hint: 'Active field workers',
        colorClass: 'text-sky-500'
      },
      {
        title: 'Admins',
        value: data.admins,
        hint: 'System administrators',
        colorClass: 'text-violet-500'
      }
    ];
  }

  get ecommerceCards(): StatCard[] {
    const data = SNAPSHOTS[this.period].ecommerce;
    return [
      {
        title: 'Categories',
        value: data.categories,
        hint: 'Product categories in store',
        colorClass: 'text-primary'
      },
      {
        title: 'Products',
        value: data.products,
        hint: 'Listed products',
        colorClass: 'text-sky-500'
      },
      {
        title: 'Orders',
        value: data.orders,
        hint: 'Total orders placed',
        colorClass: 'text-amber-500'
      },
      {
        title: 'Items Sold',
        value: data.itemsSold,
        hint: 'Total individual items sold',
        colorClass: 'text-emerald-600'
      }
    ];
  }
}
