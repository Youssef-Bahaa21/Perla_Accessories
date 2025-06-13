import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ApiService } from '../../../core/services/api/api.service';
import { Product, Category } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmationModalService } from '../../../core/services/confirmation-modal.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private productSvc = inject(ProductService);
  private confirmationModal = inject(ConfirmationModalService);
  form: FormGroup;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedFiles: File[] = [];
  previewUrls: (string | ArrayBuffer | null)[] = [];
  success = '';
  error = '';
  editingProductId: number | null = null;
  baseUrl = `${environment.api}/uploads`;
  showNewCategoryInput = false;
  fallbackImage = 'https://via.placeholder.com/150';
  isDragging = false;
  private dragCounter = 0;

  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 1;

  // Search properties
  searchTerm = '';

  // Loading states
  isSubmitting = false;

  // Collapsible sections state
  expandedSections = {
    details: true,
    images: true,
    pricing: true,
    organization: true
  };

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      newCategoryName: [''],
      is_new: [false],
      is_best_seller: [false],
      is_featured: [false],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();

    this.form.get('category_id')!.valueChanges.subscribe(val => {
      this.showNewCategoryInput = val === 'new';
      const ctrl = this.form.get('newCategoryName')!;
      if (this.showNewCategoryInput) {
        ctrl.setValidators([Validators.required]);
      } else {
        ctrl.clearValidators();
        ctrl.setValue('');
      }
      ctrl.updateValueAndValidity();
    });

    // Fix for Firefox and some browsers that don't handle drag events well
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    }, false);

    window.addEventListener('drop', (e) => {
      e.preventDefault();
    }, false);
  }

  // Toggle section expansion
  toggleSection(section: string) {
    if (section in this.expandedSections) {
      this.expandedSections[section as keyof typeof this.expandedSections] = !this.expandedSections[section as keyof typeof this.expandedSections];
    }
  }

  // Check if section is expanded
  isSectionExpanded(section: string): boolean {
    return this.expandedSections[section as keyof typeof this.expandedSections];
  }

  loadCategories() {
    this.api.categories.list().subscribe({
      next: cats => (this.categories = cats),
      error: () => (this.error = 'Failed to load categories'),
    });
  }

  loadProducts() {
    this.productSvc.getProducts<Product>(1, 1000).subscribe({
      next: resp => {
        this.products = resp.data.map(p => {
          const images = (p.images || []).map(img => {
            let imageUrl = img.url || img.image || '';

            // Check if the image URL is already a full URL (like a Cloudinary URL)
            if (imageUrl.startsWith('http')) {
              // Use the full URL directly
              return {
                id: img.id,
                url: imageUrl,
              };
            } else {
              // Handle legacy local file paths
              let imagePath = imageUrl;
              if (imagePath.startsWith('/uploads/')) {
                // If it starts with /uploads/, remove that prefix
                imagePath = imagePath.replace('/uploads/', '');
              } else if (imagePath.startsWith('/')) {
                // Remove leading slash if present
                imagePath = imagePath.slice(1);
              }
              const finalUrl = imagePath ? `${this.baseUrl}/${imagePath}` : this.fallbackImage;
              return {
                id: img.id,
                url: finalUrl,
              };
            }
          });
          return {
            ...p,
            images: images,
          };
        });

        this.applyFilters();
      },
      error: () => (this.error = 'Failed to load products'),
    });
  }

  private createOrGetCategory(): Promise<number> {
    const catVal = this.form.value.category_id;
    if (catVal !== 'new') {
      return Promise.resolve(+catVal);
    }
    const name = this.form.value.newCategoryName;
    return new Promise((res, rej) => {
      this.api.categories.create({ name }).subscribe({
        next: cat => {
          this.categories.push(cat);
          res(cat.id);
        },
        error: () => rej('Failed to create category')
      });
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    this.handleFiles(Array.from(input.files));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;

    // Only set isDragging to false if all drag events have been handled
    if (this.dragCounter <= 0) {
      this.isDragging = false;
      this.dragCounter = 0;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length > 0) {
      this.handleFiles(imageFiles);
    } else {
      this.error = 'Please drop only image files';
      setTimeout(() => this.error = '', 3000);
    }
  }

  handleFiles(files: File[]) {
    // Limit to max 5 images
    const totalImages = this.selectedFiles.length + files.length;
    if (totalImages > 5) {
      this.error = 'Maximum 5 images allowed';
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...files];

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    if (index >= 0 && index < this.previewUrls.length) {
      this.previewUrls.splice(index, 1);
      this.selectedFiles.splice(index, 1);
    }
  }

  uploadImages(pid: number) {
    if (!this.selectedFiles.length) return;
    console.log(`Starting upload of ${this.selectedFiles.length} images for product ${pid}`);

    this.api.products.uploadImage(pid, this.selectedFiles).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.success = 'Images uploaded';
        this.selectedFiles = [];
        this.previewUrls = [];

        // Reload products after a short delay to ensure backend processing is complete
        setTimeout(() => {
          this.loadProducts();
        }, 1000);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.error = 'Image upload failed: ' + (err.error?.message || err.message || 'Unknown error');
      }
    });
  }

  deleteImage(pid: number, iid: number) {
    this.api.products.deleteImage(pid, iid).subscribe({
      next: () => {
        this.success = 'Image deleted';
        this.loadProducts();
      },
      error: () => this.error = 'Image delete failed'
    });
  }

  async submit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.success = this.error = '';
    let categoryId: number;

    try {
      categoryId = await this.createOrGetCategory();
    } catch (msg) {
      this.error = msg as string;
      this.isSubmitting = false;
      return;
    }

    const raw = this.form.getRawValue();
    const dto: any = {
      name: raw.name,
      description: raw.description || '',
      price: +raw.price,
      stock: +raw.stock,
      category_id: categoryId,
      is_new: raw.is_new ? 1 : 0,
      is_best_seller: raw.is_best_seller ? 1 : 0,
      is_featured: raw.is_featured ? 1 : 0,
    };

    if (this.editingProductId) {
      this.api.products.update(this.editingProductId, dto).subscribe({
        next: () => {
          this.uploadImages(this.editingProductId!);
          this.success = 'Product updated';
          this.resetForm();
        },
        error: err => {
          this.error = err.error?.message || 'Update failed';
          this.isSubmitting = false;
        }
      });
    } else {
      this.api.products.create(dto).subscribe({
        next: (prod: Product) => {
          this.uploadImages(prod.id);
          this.success = 'Product added';
          this.resetForm();
        },
        error: err => {
          this.error = err.error?.message || 'Create failed';
          this.isSubmitting = false;
        }
      });
    }
  }

  edit(p: Product) {
    console.log('Editing product:', p);
    this.editingProductId = p.id;
    this.form.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category_id: p.category_id,
      is_new: !!p.is_new,
      is_best_seller: !!p.is_best_seller,
      is_featured: !!p.is_featured
    });

    // Extract image URLs for preview, using the direct URL without modification
    if (p.images && p.images.length) {
      console.log('Product images:', p.images);
      this.previewUrls = p.images.map(img => img.url);
    } else {
      this.previewUrls = [];
    }
  }

  async deleteProduct(id: number) {
    const confirmed = await this.confirmationModal.confirmDelete('this product');
    if (!confirmed) return;

    this.api.products.delete(id).subscribe({
      next: () => {
        this.success = 'Product deleted';
        this.resetForm();
      },
      error: () => this.error = 'Delete failed'
    });
  }

  resetForm() {
    this.editingProductId = null;
    this.isSubmitting = false;
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      newCategoryName: '',
      is_new: false,
      is_best_seller: false,
      is_featured: false
    });
    this.selectedFiles = [];
    this.previewUrls = [];
    this.showNewCategoryInput = false;
    this.loadProducts();
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  // Search and pagination methods
  applyFilters() {
    let result = [...this.products];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        this.getCategoryName(p.category_id).toLowerCase().includes(term)
      );
    }

    // Update total count before pagination
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredProducts = result.slice(startIndex, startIndex + this.pageSize);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1; // Reset to first page when searching
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  getPageRange(): number[] {
    const range = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if needed to ensure we show maxPagesToShow pages
    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  }

  getPaginationInfo(): { start: number, end: number, total: number } {
    if (this.totalItems === 0) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.totalItems);

    return { start, end, total: this.totalItems };
  }
}