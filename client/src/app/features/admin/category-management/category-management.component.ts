import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ApiService } from '../../../core/services/api/api.service';
import { ConfirmationModalService } from '../../../core/services/confirmation-modal.service';
import { Category } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './category-management.component.html',
})
export class CategoryManagementComponent implements OnInit {
    private fb = inject(FormBuilder);
    private api = inject(ApiService);
    private confirmationModal = inject(ConfirmationModalService);

    categoryForm: FormGroup;
    categories: Category[] = [];
    editingCategoryId: number | null = null;
    isSubmitting = false;
    success = '';
    error = '';

    // Image upload properties
    selectedFile: File | null = null;
    imagePreviewUrl: string | null = null;
    isUploadingImage = false;
    fallbackImage = 'assets/images/placeholder.jpg';

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

                    // If there's a selected file, upload it for the new category
                    if (this.selectedFile && newCategory.id) {
                        this.uploadCategoryImage(newCategory.id);
                    } else {
                        this.resetForm();
                        this.loadCategories();
                    }
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

        // Set image preview if available
        this.imagePreviewUrl = category.image || null;

        // Scroll to form
        setTimeout(() => {
            const formElement = document.querySelector('form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    async deleteCategory(id: number, name: string) {
        const confirmed = await this.confirmationModal.confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete the category "${name}"? This action cannot be undone and may affect products in this category.`,
            confirmText: 'Delete Category',
            cancelText: 'Cancel',
            type: 'danger',
            icon: 'fa-solid fa-folder'
        });

        if (!confirmed) return;

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

        // Reset image upload state
        this.selectedFile = null;
        this.imagePreviewUrl = null;
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

    // Image handling methods
    onFileSelected(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            this.selectedFile = inputElement.files[0];

            // Create a preview URL
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviewUrl = reader.result as string;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    removeSelectedImage(): void {
        this.selectedFile = null;
        this.imagePreviewUrl = null;
    }

    uploadCategoryImage(categoryId: number) {
        if (!this.selectedFile) {
            this.isSubmitting = false;
            return;
        }

        this.isUploadingImage = true;

        // Use the API service instead of direct HTTP calls
        this.api.categories.uploadImage(categoryId, this.selectedFile).subscribe({
            next: (response) => {
                this.success = 'Category and image uploaded successfully!';
                this.isUploadingImage = false;
                this.isSubmitting = false;
                this.resetForm();
                this.loadCategories();
            },
            error: (err) => {
                console.error('Failed to upload image:', err);
                this.error = err.error?.message || 'Failed to upload image. Please try again.';
                this.isUploadingImage = false;
                this.isSubmitting = false;
                // Still reload categories as the category itself might have been created
                this.loadCategories();
            }
        });
    }

    uploadImageForExistingCategory() {
        if (!this.selectedFile || !this.editingCategoryId) {
            return;
        }

        this.isUploadingImage = true;

        // Use the API service instead of direct HTTP calls
        this.api.categories.uploadImage(this.editingCategoryId, this.selectedFile).subscribe({
            next: (response) => {
                this.success = 'Category image updated successfully!';
                this.isUploadingImage = false;
                this.loadCategories();
            },
            error: (err) => {
                console.error('Failed to upload image:', err);
                this.error = err.error?.message || 'Failed to upload image. Please try again.';
                this.isUploadingImage = false;
            }
        });
    }

    async deleteCategoryImage(categoryId: number, event?: Event) {
        if (event) {
            event.stopPropagation();
        }

        const confirmed = await this.confirmationModal.confirm({
            title: 'Delete Category Image',
            message: 'Are you sure you want to delete this image? This action cannot be undone.',
            confirmText: 'Delete Image',
            cancelText: 'Cancel',
            type: 'warning',
            icon: 'fa-solid fa-image'
        });

        if (!confirmed) return;

        // Use the API service instead of direct HTTP calls
        this.api.categories.deleteImage(categoryId).subscribe({
            next: (response) => {
                this.success = 'Category image deleted successfully!';

                // If we're editing this category, reset the image preview
                if (this.editingCategoryId === categoryId) {
                    this.imagePreviewUrl = null;
                }

                this.loadCategories();
            },
            error: (err) => {
                console.error('Failed to delete image:', err);
                this.error = err.error?.message || 'Failed to delete image. Please try again.';
            }
        });
    }

    onImageError(event: Event): void {
        // Set a fallback image if the image fails to load
        (event.target as HTMLImageElement).src = 'assets/images/placeholder.jpg';
    }
} 