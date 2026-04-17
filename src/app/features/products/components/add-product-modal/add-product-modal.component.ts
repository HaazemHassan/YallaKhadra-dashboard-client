import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddProductFormValue } from '../add-product-form-value.type';
import { ProductFormErrors } from '../product-form-errors.type';
import { ProductCategoryOption } from '../../models/product-category-option.model';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product-modal.component.html'
})
export class AddProductModalComponent implements OnChanges {
  @Input() open = false;
  @Input() categories: ProductCategoryOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddProductFormValue>();

  formName = '';
  formDescription = '';
  formPointsCost = '';
  formStock = '';
  formCategoryId = '';
  imageFiles: File[] = [];
  previewImages: string[] = [];
  formErrors: ProductFormErrors = {};
  dragOver = false;

  ngOnChanges(changes: SimpleChanges): void {
    const openChange = changes['open'];

    if (openChange?.currentValue === true) {
      this.resetForm();
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

    if (this.imageFiles.length !== 3) {
      errors.images = 'Exactly 3 images are required';
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
      images: [...this.imageFiles]
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
    const targetPreview = this.previewImages[index];
    if (targetPreview) {
      URL.revokeObjectURL(targetPreview);
    }

    this.imageFiles = this.imageFiles.filter((_, currentIndex) => currentIndex !== index);
    this.previewImages = this.previewImages.filter((_, currentIndex) => currentIndex !== index);
  }

  private handleFiles(files: FileList | null): void {
    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      this.imageFiles = [...this.imageFiles, file];
      this.previewImages = [...this.previewImages, URL.createObjectURL(file)];
    });

    if (this.formErrors.images) {
      this.formErrors = {
        ...this.formErrors,
        images: undefined
      };
    }
  }

  private resetForm(): void {
    this.revokePreviewImages();

    this.formName = '';
    this.formDescription = '';
    this.formPointsCost = '';
    this.formStock = '';
    this.formCategoryId = '';
    this.imageFiles = [];
    this.previewImages = [];
    this.formErrors = {};
    this.dragOver = false;
  }

  private revokePreviewImages(): void {
    this.previewImages.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
  }
}
