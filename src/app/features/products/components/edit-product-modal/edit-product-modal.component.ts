import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductCategoryOption } from '../../models/product-category-option.model';
import { ProductFormErrors } from '../product-form-errors.type';
import { ProductFormValue } from '../product-form-value.type';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product-modal.component.html'
})
export class EditProductModalComponent implements OnChanges {
  @Input() open = false;
  @Input() categories: ProductCategoryOption[] = [];
  @Input() product: Product | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<ProductFormValue>();

  formName = '';
  formDescription = '';
  formPointsCost = '';
  formStock = '';
  formCategoryId = '';
  selectedImageFiles: File[] = [];
  previewImages: string[] = [];
  formErrors: ProductFormErrors = {};
  dragOver = false;

  ngOnChanges(changes: SimpleChanges): void {
    const productChanged = 'product' in changes;
    const openedNow = changes['open']?.currentValue === true;

    if ((productChanged || openedNow) && this.product) {
      this.revokePreviewImages();

      this.formName = this.product.name;
      this.formDescription = this.product.description;
      this.formPointsCost = this.product.pointsCost.toString();
      this.formStock = this.product.stock.toString();
      this.formCategoryId = this.resolveCategoryId(this.product).toString();
      this.selectedImageFiles = [];
      this.previewImages = [...this.product.images];
      this.formErrors = {};
      this.dragOver = false;
    }
  }

  ngOnDestroy(): void {
    this.revokePreviewImages();
  }

  closeModal(): void {
    this.close.emit();
  }

  submit(): void {
    const errors: ProductFormErrors = {};

    if (!this.formName.trim()) {
      errors.name = 'Required';
    }

    if (!this.formDescription.trim()) {
      errors.description = 'Required';
    }

    if (!this.formPointsCost || Number.isNaN(Number(this.formPointsCost))) {
      errors.pointsCost = 'Valid number required';
    }

    if (!this.formStock || Number.isNaN(Number(this.formStock))) {
      errors.stock = 'Valid number required';
    }

    if (!this.formCategoryId || Number.isNaN(Number(this.formCategoryId))) {
      errors.category = 'Select a category';
    }

    if (this.selectedImageFiles.length > 0 && this.selectedImageFiles.length !== 3) {
      errors.images = 'If replacing images, select exactly 3 images';
    }

    this.formErrors = errors;

    if (Object.keys(errors).length > 0) {
      return;
    }

    this.save.emit({
      name: this.formName.trim(),
      description: this.formDescription.trim(),
      pointsCost: Number(this.formPointsCost),
      stock: Number(this.formStock),
      categoryId: Number(this.formCategoryId),
      images: [...this.selectedImageFiles]
    });
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    this.handleFiles(event.dataTransfer?.files ?? null);
  }

  removeImage(index: number): void {
    if (this.selectedImageFiles.length === 0) {
      return;
    }

    const removedPreview = this.previewImages[index];
    if (removedPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(removedPreview);
    }

    this.selectedImageFiles = this.selectedImageFiles.filter((_, currentIndex) => currentIndex !== index);
    this.previewImages = this.previewImages.filter((_, currentIndex) => currentIndex !== index);
  }

  private handleFiles(files: FileList | null): void {
    if (!files) {
      return;
    }

    this.revokePreviewImages();

    this.selectedImageFiles = Array.from(files);
    this.previewImages = this.selectedImageFiles.map((file) => URL.createObjectURL(file));

    if (this.formErrors.images) {
      this.formErrors = {
        ...this.formErrors,
        images: undefined
      };
    }
  }

  private resolveCategoryId(product: Product): number {
    if (product.categoryId !== undefined && product.categoryId !== null) {
      return product.categoryId;
    }

    const matchedCategory = this.categories.find((category) => category.name === product.category);
    return matchedCategory?.id ?? 0;
  }

  private revokePreviewImages(): void {
    this.previewImages.forEach((imageUrl) => {
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    });
  }
}
