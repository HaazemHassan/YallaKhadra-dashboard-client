import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { UserApiResponse } from '../../models/user-api-response.model';
import { UserByRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly searchChanged$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  users: UserByRole[] = [];
  searchTerm = '';

  isLoading = false;
  isToggling = false;
  loadError: string | null = null;

  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20];
  totalPages = 1;
  totalCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  confirmUser: UserByRole | null = null;

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadUsers(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredUsers(): UserByRole[] {
    if (!this.searchTerm.trim()) {
      return this.users;
    }

    const term = this.searchTerm.toLowerCase();
    return this.users.filter((u) => u.email.toLowerCase().includes(term));
  }

  get canGoPrevious(): boolean {
    return this.hasPreviousPage && !this.isLoading;
  }

  get canGoNext(): boolean {
    return this.hasNextPage && !this.isLoading;
  }

  get pageStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  onSearchTermChange(): void {
    this.searchChanged$.next();
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
    this.loadUsers(1);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.page || this.isLoading) {
      return;
    }

    this.loadUsers(pageNumber);
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.loadUsers(this.page - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.loadUsers(this.page + 1);
  }

  navigateToUser(user: UserByRole): void {
    void this.router.navigate(['/dashboard/users', user.id]);
  }

  getUserInitials(user: UserByRole): string {
    const parts = user.name.split(' ');
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';

    return `${first}${last}`.toUpperCase();
  }

  openConfirmDialog(user: UserByRole): void {
    this.confirmUser = user;
  }

  closeConfirmDialog(): void {
    this.confirmUser = null;
  }

  confirmToggleLock(): void {
    if (!this.confirmUser || this.isToggling) {
      return;
    }

    const targetUser = this.confirmUser;
    this.isToggling = true;

    this.userService
      .toggleLock(targetUser.id)
      .pipe(finalize(() => (this.isToggling = false)))
      .subscribe({
        next: (response) => {
          const newState = response.data?.isLocked ?? !targetUser.isLocked;
          this.users = this.users.map((u) =>
            u.id === targetUser.id ? { ...u, isLocked: newState } : u
          );
          this.toastr.success(response.message ?? `User ${newState ? 'locked' : 'unlocked'} successfully.`);
          this.closeConfirmDialog();
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to toggle user lock. Please try again.'));
        }
      });
  }

  private loadUsers(targetPage: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.userService
      .getUsersByRole({
        role: 'User',
        pageNumber: targetPage,
        pageSize: this.pageSize
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.users = result.data ?? [];
          this.page = result.currentPage;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalCount = result.totalCount;
          this.hasPreviousPage = result.hasPreviousPage;
          this.hasNextPage = result.hasNextPage;
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load users. Please try again.');

          this.users = [];
          this.page = 1;
          this.totalPages = 1;
          this.totalCount = 0;
          this.hasPreviousPage = false;
          this.hasNextPage = false;
          this.loadError = message;

          this.toastr.error(message);
        }
      });
  }

  private setupSearchDebounce(): void {
    this.searchChanged$
      .pipe(
        debounceTime(400),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private resolveErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as UserApiResponse<unknown> | string | null;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (apiError && typeof apiError === 'object') {
        if (apiError.errors && apiError.errors.length > 0) {
          return apiError.errors[0];
        }

        if (apiError.message && apiError.message.trim()) {
          return apiError.message;
        }
      }

      if (error.message.trim()) {
        return error.message;
      }
    }

    return fallbackMessage;
  }
}
