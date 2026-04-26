import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { StaffListComponent } from './pages/staff-list/staff-list.component';
import { AddPersonComponent } from './pages/add-person/add-person.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserListComponent
  },
  {
    path: ':id',
    component: UserDetailsComponent,
    data: { detailsType: 'user' }
  }
];

export const WORKERS_ROUTES: Routes = [
  {
    path: '',
    component: StaffListComponent,
    data: { role: 'Workers' }
  },
  {
    path: ':id',
    component: UserDetailsComponent,
    data: { detailsType: 'worker' }
  }
];

export const ADMINS_ROUTES: Routes = [
  {
    path: '',
    component: StaffListComponent,
    data: { role: 'Admins' }
  }
];

export const ADD_WORKER_ROUTES: Routes = [
  {
    path: '',
    component: AddPersonComponent,
    data: { role: 'Worker' }
  }
];

export const ADD_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AddPersonComponent,
    data: { role: 'Admin' }
  }
];
