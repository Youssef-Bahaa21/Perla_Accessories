import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ApiService } from '../../../core/services/api/api.service';
import { Category } from '../../../core/models';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './category-management.component.html',
})
export class CategoryManagementComponent implements OnInit {
    private fb = inject(FormBuilder);
    private api = inject(ApiService);

    categoryForm: FormGroup;
    categories: Category[] = [];
    editingCategoryId: number | null = null;
    isSubmitting = false;
    success = '';
    error = '';

    constructor() {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]]
        });
    }

    ngOnInit() {
        this.loadCategories();
        // Auto-hide messages after 5 seconds
        setInterval(() => {
            if (this.success) this.success = '';
            if (this.error) this.error = '';
        }, 5000);
    }

    loadCategories() {
        this.api.categories.list().subscribe({
            next: (categories) => {
                this.categories = categories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            },
            error: (err) => {
                console.error('Failed to load categories:', err);
                this.error = 'Failed to load categories. Please try again.';
            }
        });
    }

    submitCategory() {
        if (this.categoryForm.invalid || this.isSubmitting) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.success = this.error = '';

        const formData = this.categoryForm.getRawValue();
        const categoryData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : ''
        };

        if (this.editingCategoryId) {
            // Update existing category
            this.api.categories.update(this.editingCategoryId, categoryData).subscribe({
                next: () => {
                    this.success = 'Category updated successfully!';
                    this.resetForm();
                    this.loadCategories();
                },
                error: (err) => {
                    console.error('Failed to update category:', err);
                    this.error = err.error?.message || 'Failed to update category. Please try again.';
                    this.isSubmitting = false;
                }
            });
        } else {
            // Create new category
            this.api.categories.create(categoryData).subscribe({
                next: (newCategory) => {
                    this.success = 'Category created successfully!';
                    this.resetForm();
                    this.loadCategories();
                },
                error: (err) => {
                    console.error('Failed to create category:', err);
                    this.error = err.error?.message || 'Failed to create category. Please try again.';
                    this.isSubmitting = false;
                }
            });
        }
    }

    editCategory(category: Category) {
        this.editingCategoryId = category.id;
        this.categoryForm.patchValue({
            name: category.name,
            description: category.description || ''
        });
        this.success = this.error = '';

        // Scroll to form
        setTimeout(() => {
            const formElement = document.querySelector('form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    deleteCategory(id: number, name: string) {
        const confirmation = confirm(
            `Are you sure you want to delete the category "${name}"?\n\n` +
            `⚠️ WARNING: This action cannot be undone and may affect products in this category.`
        );

        if (!confirmation) return;

        this.api.categories.delete(id).subscribe({
            next: () => {
                this.success = `Category "${name}" deleted successfully!`;
                this.loadCategories();
                // If we were editing this category, reset the form
                if (this.editingCategoryId === id) {
                    this.resetForm();
                }
            },
            error: (err) => {
                console.error('Failed to delete category:', err);
                this.error = err.error?.message || `Failed to delete category "${name}". Please try again.`;
            }
        });
    }

    resetForm() {
        this.editingCategoryId = null;
        this.isSubmitting = false;
        this.categoryForm.reset({
            name: '',
            description: ''
        });
        this.categoryForm.markAsUntouched();
        this.success = this.error = '';
    }

    formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Unknown';
        }
    }

    // Utility method to get form field error messages
    getFieldError(fieldName: string): string {
        const field = this.categoryForm.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
        }
        return '';
    }
} 