import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryFormErrors } from '../category-form-errors.type';
import { CategoryFormValue } from '../category-form-value.type';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-category-modal.component.html'
})
export class AddCategoryModalComponent implements OnChanges {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CategoryFormValue>();

  formName = '';
  formDescription = '';
  formErrors: CategoryFormErrors = {};

  ngOnChanges(changes: SimpleChanges): void {
    const openChange = changes['open'];

    if (openChange?.currentValue === true) {
      this.resetForm();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  submit(): void {
    const errors: CategoryFormErrors = {};

    if (!this.formName.trim()) {
      errors.name = 'Name is required';
    }

    if (!this.formDescription.trim()) {
      errors.description = 'Description is required';
    }

    this.formErrors = errors;

    if (Object.keys(errors).length > 0) {
      return;
    }

    this.save.emit({
      name: this.formName.trim(),
      description: this.formDescription.trim()
    });
  }

  private resetForm(): void {
    this.formName = '';
    this.formDescription = '';
    this.formErrors = {};
  }
}
