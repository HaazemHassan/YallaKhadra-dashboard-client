import { Routes } from '@angular/router';
import { ReportListComponent } from './pages/report-list/report-list.component';
import { ReportDetailsComponent } from './pages/report-details/report-details.component';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportListComponent
  },
  {
    path: ':id',
    component: ReportDetailsComponent
  }
];
