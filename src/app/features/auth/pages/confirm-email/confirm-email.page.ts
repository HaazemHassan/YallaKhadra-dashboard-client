import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-confirm-email-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './confirm-email.page.html'
})
export class ConfirmEmailPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  email = '';

  readonly confirmForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  submitted = false;
  isSubmitting = false;
  isResending = false;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) {
      this.toastr.error('Email is required for confirmation');
      void this.router.navigate(['/login']);
    }
  }

  shouldShowError(controlName: 'code'): boolean {
    const control = this.confirmForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { code } = this.confirmForm.getRawValue();

    this.authService
      .confirmEmail(this.email, code)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          if (!response.succeeded) {
            this.toastr.error(response.message || 'Failed to confirm email');
            return;
          }

          this.toastr.success('Email confirmed successfully. You can now sign in.');
          void this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(this.getErrorMessageFromBackend(error) || 'Failed to confirm email');
        }
      });
  }

  onResend(): void {
    if (this.isResending || !this.email) return;

    this.isResending = true;
    this.authService
      .requestEmailConfirmation(this.email)
      .pipe(finalize(() => (this.isResending = false)))
      .subscribe({
        next: (response) => {
          if (!response.succeeded) {
            this.toastr.error(response.message || 'Failed to resend code');
            return;
          }
          this.toastr.success('Confirmation code resent successfully');
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(this.getErrorMessageFromBackend(error) || 'Failed to resend code');
        }
      });
  }

  private getErrorMessageFromBackend(error: HttpErrorResponse): string | undefined {
    const apiError = error.error as ApiResponse<unknown> | string | null;

    if (typeof apiError === 'string') {
      return apiError;
    }

    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors[0];
    }

    return undefined;
  }
}
