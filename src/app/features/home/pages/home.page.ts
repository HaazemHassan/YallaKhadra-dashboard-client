import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DashboardSnapshot } from '../models/dashboard-snapshot.interface';
import { PeriodKey } from '../models/period-key.enum';
import { StatCard } from '../models/stat-card.interface';
import { DashboardService, DashboardTrendsDto } from '../services/dashboard.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './home.page.html'
})
export class HomePageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly periods: Array<{ key: PeriodKey; label: string }> = [
    { key: PeriodKey.All, label: 'All Time' },
    { key: PeriodKey.Yearly, label: 'Yearly' },
    { key: PeriodKey.Monthly, label: 'Monthly' },
    { key: PeriodKey.Weekly, label: 'Weekly' }
  ];

  period = signal<PeriodKey>(PeriodKey.All);
  snapshot = signal<DashboardSnapshot | null>(null);
  trends = signal<DashboardTrendsDto | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  setPeriod(period: PeriodKey): void {
    this.period.set(period);
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    forkJoin({
      analytics: this.dashboardService.getAnalytics(this.period()),
      trends: this.dashboardService.getTrends(this.period())
    }).subscribe({
      next: (data) => {
        this.snapshot.set(data.analytics);
        this.trends.set(data.trends);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load dashboard data.');
        this.isLoading.set(false);
      }
    });
  }

  reportCards = computed<StatCard[]>(() => {
    const data = this.snapshot()?.reports;
    if (!data) return [];
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
  });

  userCards = computed<StatCard[]>(() => {
    const data = this.snapshot()?.users;
    if (!data) return [];
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
  });

  ecommerceCards = computed<StatCard[]>(() => {
    const data = this.snapshot()?.ecommerce;
    if (!data) return [];
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
  });

  // Chart configuration
  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#888' }
      }
    }
  };

  reportsChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.snapshot()?.reports;
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [data.pending, data.inProgress, data.completed],
          backgroundColor: ['#f59e0b', '#0ea5e9', '#059669'],
          hoverBackgroundColor: ['#d97706', '#0284c7', '#047857'],
          borderWidth: 0
        }
      ]
    };
  });

  usersChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.snapshot()?.users;
    if (!data) return { labels: [], datasets: [] };
    const customers = Math.max(0, data.total - data.workers - data.admins);
    return {
      labels: ['Workers', 'Admins', 'Customers'],
      datasets: [
        {
          data: [data.workers, data.admins, customers],
          backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981'],
          hoverBackgroundColor: ['#0284c7', '#7c3aed', '#059669'],
          borderWidth: 0
        }
      ]
    };
  });

  // Line chart configuration
  readonly lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#888' } }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  reportsTrendData = computed<ChartData<'line'>>(() => {
    const data = this.trends()?.reportsTrend;
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.map(d => d.dateLabel),
      datasets: [
        {
          data: data.map(d => d.value),
          label: 'Reports Submitted',
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  });

  ordersTrendData = computed<ChartData<'line'>>(() => {
    const data = this.trends()?.ordersTrend;
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.map(d => d.dateLabel),
      datasets: [
        {
          data: data.map(d => d.value),
          label: 'Orders Placed',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  });
}
