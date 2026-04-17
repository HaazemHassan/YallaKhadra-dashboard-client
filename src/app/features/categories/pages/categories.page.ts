import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { AddCategoryModalComponent } from '../components/add-category-modal/add-category-modal.component';
import { CategoryFormValue } from '../components/category-form-value.type';
import { EditCategoryModalComponent } from '../components/edit-category-modal/edit-category-modal.component';
import { AddCategoryRequest } from '../models/add-category-request.model';
import { CategoryApiResponse } from '../models/category-api-response.model';
import { Category } from '../models/category.model';
import { UpdateCategoryRequest } from '../models/update-category-request.model';
import { CategoryService } from '../services/category.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { DeleteConfirmationModel } from '../../../shared/components/delete-confirmation-modal/delete-confirmation.model';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddCategoryModalComponent,
    EditCategoryModalComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './categories.page.html'
})
export class CategoriesPageComponent implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly toastr = inject(ToastrService);
  private readonly searchChanged$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  categories: Category[] = [];
  searchTerm = '';

  isLoading = false;
  isSubmitting = false;
  loadError: string | null = null;

  page = 1;
  readonly perPage = 8;
  totalPages = 1;
  totalCount = 0;

  isAddModalOpen = false;
  isEditModalOpen = false;
  editingCategory: Category | null = null;

  isDeleteDialogOpen = false;
  deleteTarget: Category | null = null;
  deleteModal: DeleteConfirmationModel = {
    label: '',
    message: ''
  };

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategories(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pagedCategories(): Category[] {
    return this.categories;
  }

  get canGoPrevious(): boolean {
    return this.page > 1 && !this.isLoading;
  }

  get canGoNext(): boolean {
    return this.page < this.totalPages && !this.isLoading;
  }

  get pageStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.page - 1) * this.perPage + 1;
  }

  get pageEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.page * this.perPage, this.totalCount);
  }

  onSearchTermChange(): void {
    this.page = 1;
    this.searchChanged$.next();
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  handleAddCategory(payload: CategoryFormValue): void {
    if (this.isSubmitting) {
      return;
    }

    const request: AddCategoryRequest = {
      name: payload.name,
      description: payload.description
    };

    this.isSubmitting = true;

    this.categoryService
      .addCategory(request)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message ?? 'Category added successfully');
          this.closeAddModal();
          this.loadCategories(1);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to add category. Please try again.'));
        }
      });
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingCategory = null;
  }

  handleUpdateCategory(payload: CategoryFormValue): void {
    if (!this.editingCategory || this.isSubmitting) {
      return;
    }

    const request: UpdateCategoryRequest = {
      name: payload.name,
      description: payload.description
    };

    this.isSubmitting = true;

    this.categoryService
      .updateCategory(this.editingCategory.id, request)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message ?? 'Category updated successfully');
          this.closeEditModal();
          this.loadCategories(this.page);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to update category. Please try again.'));
        }
      });
  }

  openDeleteDialog(category: Category): void {
    this.deleteTarget = category;
    this.deleteModal = {
      label: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    };
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.deleteTarget = null;
    this.deleteModal = {
      label: '',
      message: ''
    };
  }

  confirmDelete(): void {
    if (!this.deleteTarget || this.isSubmitting) {
      return;
    }

    const targetCategory = this.deleteTarget;
    let targetPage = this.page;

    if (this.categories.length === 1 && this.page > 1) {
      targetPage = this.page - 1;
    }

    this.isSubmitting = true;

    this.categoryService
      .deleteCategory(targetCategory.id)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message ?? 'Category deleted successfully');
          this.closeDeleteDialog();
          this.loadCategories(targetPage);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to delete category. Please try again.'));
        }
      });
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.loadCategories(this.page - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.loadCategories(this.page + 1);
  }

  private loadCategories(targetPage: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.categoryService
      .getCategories({
        pageNumber: targetPage,
        pageSize: this.perPage,
        searchTerm: this.searchTerm
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.categories = result.data ?? [];
          this.page = result.currentPage;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalCount = result.totalCount;
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load categories. Please try again.');

          this.categories = [];
          this.page = 1;
          this.totalPages = 1;
          this.totalCount = 0;
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
      .subscribe(() => {
        this.loadCategories(1);
      });
  }

  private resolveErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as CategoryApiResponse<unknown> | string | null;

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
