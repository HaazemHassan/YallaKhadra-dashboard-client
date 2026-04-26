import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserApiResponse } from '../../models/user-api-response.model';
import { UserDetails, WorkerDetails } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html'
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);

  userId = 0;

  /**
   * 'user' or 'worker' — determined from route data.
   * User details → GET /api/user/{id}/details
   * Worker details → GET /api/user/{id}/worker-details
   */
  detailsType: 'user' | 'worker' = 'user';

  userDetails: UserDetails | null = null;
  workerDetails: WorkerDetails | null = null;

  isLoading = false;
  isToggling = false;
  loadError: string | null = null;
  isLocked = false;

  get isWorker(): boolean {
    return this.detailsType === 'worker';
  }

  get pageTitle(): string {
    return this.isWorker ? 'Worker Details' : 'User Details';
  }

  get displayName(): string {
    if (this.isWorker && this.workerDetails) {
      return this.workerDetails.name;
    }

    return this.userDetails?.name ?? '';
  }

  get displayEmail(): string {
    if (this.isWorker && this.workerDetails) {
      return this.workerDetails.email;
    }

    return this.userDetails?.email ?? '';
  }

  get displayPhone(): string {
    if (this.isWorker && this.workerDetails) {
      return this.workerDetails.phoneNumber ?? '—';
    }

    return this.userDetails?.phoneNumber ?? '—';
  }

  get displayAddress(): string {
    if (this.isWorker && this.workerDetails) {
      return this.workerDetails.address ?? '—';
    }

    return this.userDetails?.address ?? '—';
  }

  get displayImage(): string | null {
    if (this.isWorker && this.workerDetails) {
      return this.workerDetails.profileImage?.url ?? null;
    }

    return this.userDetails?.profileImage?.url ?? null;
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';

    return `${first}${last}`.toUpperCase();
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.detailsType = (this.route.snapshot.data['detailsType'] as 'user' | 'worker') ?? 'user';
    this.loadDetails();
  }

  goBack(): void {
    this.location.back();
  }

  toggleLock(): void {
    if (this.isToggling) {
      return;
    }

    this.isToggling = true;

    this.userService
      .toggleLock(this.userId)
      .pipe(finalize(() => (this.isToggling = false)))
      .subscribe({
        next: (response) => {
          this.isLocked = response.data?.isLocked ?? !this.isLocked;
          this.toastr.success(response.message ?? `User ${this.isLocked ? 'locked' : 'unlocked'} successfully.`);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to toggle user lock.'));
        }
      });
  }

  private loadDetails(): void {
    this.isLoading = true;
    this.loadError = null;

    if (this.isWorker) {
      this.userService
        .getWorkerDetails(this.userId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.workerDetails = response.data ?? null;
          },
          error: (error: unknown) => {
            this.loadError = this.resolveErrorMessage(error, 'Failed to load worker details.');
            this.toastr.error(this.loadError);
          }
        });
    } else {
      this.userService
        .getUserDetails(this.userId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.userDetails = response.data ?? null;
          },
          error: (error: unknown) => {
            this.loadError = this.resolveErrorMessage(error, 'Failed to load user details.');
            this.toastr.error(this.loadError);
          }
        });
    }
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
