import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryFormErrors } from '../category-form-errors.type';
import { Category } from '../../models/category.model';
import { CategoryFormValue } from '../category-form-value.type';

@Component({
  selector: 'app-edit-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-category-modal.component.html'
})
export class EditCategoryModalComponent implements OnChanges {
  @Input() open = false;
  @Input() category: Category | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CategoryFormValue>();

  formName = '';
  formDescription = '';
  formErrors: CategoryFormErrors = {};

  ngOnChanges(changes: SimpleChanges): void {
    const categoryChanged = 'category' in changes;
    const openedNow = changes['open']?.currentValue === true;

    if ((categoryChanged || openedNow) && this.category) {
      this.formName = this.category.name;
      this.formDescription = this.category.description;
      this.formErrors = {};
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
}
