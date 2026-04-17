import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { AddProductModalComponent } from '../components/add-product-modal/add-product-modal.component';
import { AddProductFormValue } from '../components/add-product-form-value.type';
import { EditProductModalComponent } from '../components/edit-product-modal/edit-product-modal.component';
import { ProductFormValue } from '../components/product-form-value.type';
import { ProductApiResponse } from '../models/product-api-response.model';
import { ProductCategoryOption } from '../models/product-category-option.model';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { DeleteConfirmationModel } from '../../../shared/components/delete-confirmation-modal/delete-confirmation.model';
import { ProductsStore } from '../../../shared/services/products-store';
import { CategoryService } from '../../categories/services/category.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddProductModalComponent,
    EditProductModalComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './products.page.html'
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly productsStore = inject(ProductsStore);
  private readonly categoryService = inject(CategoryService);
  private readonly toastr = inject(ToastrService);
  private readonly filtersChanged$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  readonly products = this.productsStore.products;
  categoryOptions: ProductCategoryOption[] = [];

  searchTerm = '';
  categoryFilter = 'all';
  page = 1;
  readonly perPage = 8;
  totalPages = 1;
  totalCount = 0;

  isLoading = false;
  isSubmitting = false;
  loadError: string | null = null;

  isAddModalOpen = false;
  isEditModalOpen = false;
  editingProduct: Product | null = null;

  isDeleteDialogOpen = false;
  deleteTarget: Product | null = null;
  deleteModal: DeleteConfirmationModel = {
    label: '',
    message: ''
  };

  ngOnInit(): void {
    this.setupFiltersDebounce();
    this.loadCategoryOptions();
    this.loadProducts(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pagedProducts(): Product[] {
    return this.products();
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

    return Math.min(this.pageStart + this.pagedProducts.length - 1, this.totalCount);
  }

  onSearchTermChange(): void {
    this.page = 1;
    this.filtersChanged$.next();
  }

  onCategoryFilterChange(): void {
    this.page = 1;
    this.filtersChanged$.next();
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  handleAddProduct(payload: AddProductFormValue): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productsService
      .addProduct(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.closeAddModal();
          this.toastr.success(response.message ?? 'Product added successfully');
          this.loadProducts(1);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to add product. Please try again.'));
        }
      });
  }

  openEditModal(product: Product): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productsService
      .getProductById(product.id)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (productDetails) => {
          this.editingProduct = productDetails;
          this.isEditModalOpen = true;
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to load product details. Please try again.'));
        }
      });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingProduct = null;
  }

  handleUpdateProduct(payload: ProductFormValue): void {
    if (!this.editingProduct || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productsService
      .updateProduct(this.editingProduct.id, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.closeEditModal();
          this.toastr.success(response.message ?? 'Product updated successfully');
          this.loadProducts(this.page);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to update product. Please try again.'));
        }
      });
  }

  openDeleteDialog(product: Product): void {
    this.deleteTarget = product;
    this.deleteModal = {
      label: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This cannot be undone.`
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

    const targetProductId = this.deleteTarget.id;
    const targetPage = this.pagedProducts.length === 1 && this.page > 1
      ? this.page - 1
      : this.page;

    this.isSubmitting = true;

    this.productsService
      .deleteProduct(targetProductId)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.closeDeleteDialog();
          this.toastr.success(response.message ?? 'Product deleted successfully');
          this.loadProducts(targetPage);
        },
        error: (error: unknown) => {
          this.toastr.error(this.resolveErrorMessage(error, 'Failed to delete product. Please try again.'));
        }
      });
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.loadProducts(this.page - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.loadProducts(this.page + 1);
  }

  getStockBadgeClass(stock: number): string {
    if (stock > 20) {
      return 'bg-primary text-primary-foreground';
    }

    if (stock > 0) {
      return 'border border-border bg-background text-foreground';
    }

    return 'bg-destructive text-destructive-foreground';
  }

  getStockText(stock: number): string {
    if (stock > 0) {
      return stock.toString();
    }

    return 'Out of stock';
  }

  private clampPage(): void {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }

    if (this.page < 1) {
      this.page = 1;
    }
  }

  private loadProducts(targetPage: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.productsService
      .getProducts({
        pageNumber: targetPage,
        pageSize: this.perPage,
        searchTerm: this.searchTerm,
        categoryId: this.getSelectedCategoryId()
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.productsStore.setProducts(result.data ?? []);
          this.page = result.currentPage;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalCount = result.totalCount;
          this.clampPage();
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error, 'Failed to load products. Please try again.');

          this.productsStore.clear();
          this.page = 1;
          this.totalPages = 1;
          this.totalCount = 0;
          this.loadError = message;
          this.toastr.error(message);
        }
      });
  }

  private getSelectedCategoryId(): number | undefined {
    if (this.categoryFilter === 'all') {
      return undefined;
    }

    const parsedCategoryId = Number(this.categoryFilter);
    return Number.isNaN(parsedCategoryId) ? undefined : parsedCategoryId;
  }

  private setupFiltersDebounce(): void {
    this.filtersChanged$
      .pipe(
        debounceTime(400),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadProducts(1);
      });
  }

  private loadCategoryOptions(): void {
    this.categoryService
      .getCategories({
        pageNumber: 1,
        pageSize: 200
      })
      .subscribe({
        next: (result) => {
          this.categoryOptions = (result.data ?? []).map((category) => ({
            id: category.id,
            name: category.name
          }));

          if (this.editingProduct && !this.editingProduct.categoryId) {
            const matchedCategory = this.categoryOptions.find((category) => category.name === this.editingProduct?.category);
            if (matchedCategory) {
              this.editingProduct = {
                ...this.editingProduct,
                categoryId: matchedCategory.id
              };
            }
          }
        },
        error: () => {
          this.categoryOptions = [];
        }
      });
  }

  private resolveErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ProductApiResponse<unknown> | { messages?: string[] } | string | null;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (apiError && typeof apiError === 'object') {
        if ('errors' in apiError && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
          return apiError.errors[0] ?? fallbackMessage;
        }

        if ('message' in apiError && typeof apiError.message === 'string' && apiError.message.trim()) {
          return apiError.message;
        }

        if ('messages' in apiError && Array.isArray(apiError.messages) && apiError.messages.length > 0) {
          return apiError.messages[0] ?? fallbackMessage;
        }
      }

      if (error.message.trim()) {
        return error.message;
      }
    }

    return fallbackMessage;
  }
}
