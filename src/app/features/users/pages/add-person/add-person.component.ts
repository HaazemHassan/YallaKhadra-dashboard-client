import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserApiResponse } from '../../models/user-api-response.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-person.component.html'
})
export class AddPersonComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);

  /** 'Worker' or 'Admin' — set from route data */
  role: 'Worker' | 'Admin' = 'Worker';
  isSubmitting = false;

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(35)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    confirmPassword: ['', [Validators.required]],
    address: [''],
    phoneNumber: ['']
  });

  ngOnInit(): void {
    this.role = (this.route.snapshot.data['role'] as 'Worker' | 'Admin') ?? 'Worker';
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.value;

    if (values.password !== values.confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.isSubmitting = true;

    const roleValue = this.role === 'Admin' ? 1 : 2;

    this.userService
      .addUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        address: values.address || undefined,
        phoneNumber: values.phoneNumber || undefined,
        userRole: roleValue
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message ?? `${this.role} added successfully.`);
          if (this.role === 'Worker') {
            void this.router.navigate(['/dashboard/workers']);
          } else {
            void this.router.navigate(['/dashboard/admins']);
          }
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, `Failed to add ${this.role.toLowerCase()}.`));
        }
      });
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
