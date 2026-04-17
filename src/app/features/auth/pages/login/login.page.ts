import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { ApiResponse } from '../../models/api-response';
import { LoginFormControls } from '../../models/login-form-controls.interface';
import { UserStore } from '../../../../shared/services/user-store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html'
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly toastr = inject(ToastrService);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  showPassword = false;
  submitted = false;
  isSubmitting = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  shouldShowError(controlName: keyof LoginFormControls): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();

    this.authService
      .login({ email, password })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          if (!response.succeeded || !response.data) {
            this.rejectLogin(response.message);
            return;
          }

          this.userStore.setSession(response.data);

          if (!this.userStore.canAccessAdminDashboard()) {
            this.rejectLogin(response.message);
            return;
          }

          void this.router.navigateByUrl('/dashboard/home');
        },
        error: (error: HttpErrorResponse) => {
          this.rejectLogin(this.getErrorMessageFromBackend(error));
        }
      });
  }

  private rejectLogin(message?: string): void {
    this.userStore.clear();
    this.toastr.error(message ?? 'Login failed');
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
