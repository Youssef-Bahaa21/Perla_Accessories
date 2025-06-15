import {
  Component,
  OnInit,
  HostListener,
  inject,
  PLATFORM_ID,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../core/services/api/api.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { SearchService } from '../../../core/services/search.service';
import { Product, Category } from '../../../core/models';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  activeImageIndices: { [pid: number]: number } = {};
  addedToCartMessage: { [pid: number]: string } = {};
  imageCycleIntervals: { [pid: number]: any } = {};
  loading = true;
  error = '';
  fallbackImage = 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png';

  page = 1;
  pageSize = 12;
  allProductsLoaded = false;

  selectedCategory: number | 'all' = 'all';
  stockFilter: 'all' | 'in' | 'out' = 'all';
  tagFilter: 'all' | 'new' | 'best' = 'all';
  searchQuery = '';

  isBrowser: boolean;
  mobileFiltersActive = false;

  private destroy$ = new Subject<void>();

  private api = inject(ApiService);
  private productSvc = inject(ProductService);
  private cart = inject(CartService);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.setupProductListSEO();
    this.loadPage();

    this.api.categories.list().subscribe({
      next: cats => {
        this.categories = cats;
      },
      error: () => (this.error = 'Could not load categories.'),
    });

    // Listen for query parameter changes
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = +params['category'];
        this.applyFilters();
      } else if (params['search']) {
        // Handle search query parameter
        this.searchQuery = params['search'];
        this.applyFilters();
      }
    });

    // Close mobile filters when window is resized to desktop
    if (this.isBrowser) {
      window.addEventListener('resize', () => {
        if (this.getWindowWidth() >= 768 && this.mobileFiltersActive) {
        }
      });
    }

    // Listen to search service for clear filters trigger
    this.searchService.clearFilters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shouldClear => {
        if (shouldClear) {
          this.clearFilters();
          this.searchService.resetClearFilters(); // Reset the trigger
        }
      });
  }

  ngOnDestroy(): void {
    // Clear all image cycling intervals
    Object.keys(this.imageCycleIntervals).forEach(productId => {
      this.stopImageCycle(+productId);
    });

    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPage() {
    this.loading = true;

    this.productSvc.getProducts<Product>(this.page, this.pageSize).subscribe({
      next: resp => {
        const newItems = resp.data.map(p => {
          const images = (p.images || []).map(img => {
            return {
              id: img.id,
              url: img.url,
            };
          });
          return {
            ...p,
            images: images,
          };
        });

        // Initialize activeImageIndices for new products
        newItems.forEach(product => {
          if (!this.activeImageIndices.hasOwnProperty(product.id)) {
            this.activeImageIndices[product.id] = 0; // Show first image by default
          }
        });

        this.products.push(...newItems);
        this.filteredProducts = [...this.products];

        this.loading = false;

        if (newItems.length < this.pageSize) {
          this.allProductsLoaded = true;
        }

        this.applyFilters();
      },
      error: () => {
        this.error = 'Could not load products.';
        this.loading = false;
      },
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isBrowser && !this.loading && !this.allProductsLoaded) {
      const threshold = 300;
      const scrollPosition = window.pageYOffset + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= documentHeight - threshold) {
        this.page++;
        this.loadPage();
      }
    }
  }

  applyFilters() {
    let filtered = [...this.products];

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === +this.selectedCategory);
    }

    // Stock filter
    if (this.stockFilter === 'in') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (this.stockFilter === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    }

    // Tag filter
    if (this.tagFilter === 'new') {
      filtered = filtered.filter(p => p.is_new === 1);
    } else if (this.tagFilter === 'best') {
      filtered = filtered.filter(p => p.is_best_seller === 1);
    }

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = filtered;

    // Initialize activeImageIndices for any products that don't have it set
    this.filteredProducts.forEach(product => {
      if (!this.activeImageIndices.hasOwnProperty(product.id)) {
        this.activeImageIndices[product.id] = 0; // Show first image by default
      }
    });

    // Update URL parameters
    this.updateUrlParams();
  }

  private updateUrlParams(): void {
    const queryParams: any = {};

    if (this.selectedCategory !== 'all') {
      queryParams.category = this.selectedCategory;
    }

    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }

    // Update the URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  clearFilters() {
    this.selectedCategory = 'all';
    this.stockFilter = 'all';
    this.tagFilter = 'all';
    this.searchQuery = '';
    this.applyFilters();
  }

  addToCart(p: Product) {
    this.cart.add(p);
    this.addedToCartMessage[p.id] = 'Added to cart!';
    setTimeout(() => delete this.addedToCartMessage[p.id], 2000);
  }

  setActiveImage(pid: number, idx: number) { this.activeImageIndices[pid] = idx; }

  hasActiveFilters() {
    return this.selectedCategory !== 'all' || this.stockFilter !== 'all' || this.tagFilter !== 'all' || this.searchQuery !== '';
  }

  getCategoryName(id: number | 'all'): string {
    if (id === 'all') return 'All Categories';
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'all') count++;
    if (this.stockFilter !== 'all') count++;
    if (this.tagFilter !== 'all') count++;
    if (this.searchQuery !== '') count++;
    return count;
  }

  resetStockFilter() {
    this.stockFilter = 'all';
    this.applyFilters();
  }

  resetCategoryFilter() {
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  resetTagFilter() {
    this.tagFilter = 'all';
    this.applyFilters();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  getWindowWidth(): number {
    return this.isBrowser ? window.innerWidth : 1024;
  }

  // Mobile-specific methods
  isMobileDevice(): boolean {
    if (!this.isBrowser) return false;

    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'webos', 'iphone', 'ipad', 'ipod',
      'blackberry', 'windows phone', 'mobile'
    ];

    const isMobileUserAgent = mobileKeywords.some(keyword =>
      userAgent.includes(keyword)
    );

    const isMobileViewport = window.innerWidth <= 768;

    return isMobileUserAgent || isMobileViewport;
  }

  getRandomReviewCount(): number {
    // Generate a random review count between 2 and 123 for demo purposes
    return Math.floor(Math.random() * 122) + 2;
  }

  showNextImageDesktop(pid: number, count: number) {
    if (!this.activeImageIndices[pid]) {
      this.activeImageIndices[pid] = 0;
    }
    this.activeImageIndices[pid] = (this.activeImageIndices[pid] + 1) % count;
  }

  resetImageDesktop(pid: number) {
    this.activeImageIndices[pid] = 0;
  }

  onProductHover(productId: number) {
    // Enhanced hover effects for desktop
    if (!this.isMobileDevice()) {
      // Could add sound effects, analytics tracking, etc.
    }
  }

  onProductLeave(productId: number) {
    // Reset any hover states
    if (!this.isMobileDevice()) {
      this.resetImageDesktop(productId);
    }
  }

  startImageCycle(productId: number, imageCount: number) {
    // Only cycle images on desktop and if there are multiple images
    if (!this.isMobileDevice() && imageCount > 1) {
      // Clear any existing interval
      this.stopImageCycle(productId);

      // Start cycling through images every 800ms
      this.imageCycleIntervals[productId] = setInterval(() => {
        if (!this.activeImageIndices[productId]) {
          this.activeImageIndices[productId] = 0;
        }
        this.activeImageIndices[productId] = (this.activeImageIndices[productId] + 1) % imageCount;
      }, 800);
    }
  }

  stopImageCycle(productId: number) {
    // Clear interval and reset to first image
    if (this.imageCycleIntervals[productId]) {
      clearInterval(this.imageCycleIntervals[productId]);
      delete this.imageCycleIntervals[productId];
    }
    // Reset to first image
    this.activeImageIndices[productId] = 0;
  }



  private setupProductListSEO(): void {
    const selectedCategoryName = this.selectedCategory !== 'all'
      ? this.categories.find(c => c.id === this.selectedCategory)?.name
      : '';

    let title = 'Premium Jewelry & Fashion Accessories - Perla Collection';
    let description = 'Discover our complete collection of premium jewelry and fashion accessories. Unique, limited-edition pieces crafted with exceptional quality. Free shipping available.';
    let keywords = 'jewelry collection, accessories, necklaces, earrings, rings, bracelets, fashion accessories, premium jewelry, Egyptian jewelry, perla accessories';

    if (selectedCategoryName) {
      title = `${selectedCategoryName} - Premium ${selectedCategoryName} Collection | Perla Accessories`;
      description = `Explore our premium ${selectedCategoryName.toLowerCase()} collection. Unique, limited-edition ${selectedCategoryName.toLowerCase()} pieces from Perla Accessories. Quality craftsmanship guaranteed.`;
      keywords = `${selectedCategoryName.toLowerCase()}, ${selectedCategoryName.toLowerCase()} collection, premium ${selectedCategoryName.toLowerCase()}, jewelry, accessories, perla`;
    }

    if (this.searchQuery) {
      title = `Search Results for "${this.searchQuery}" - Perla Accessories`;
      description = `Find premium jewelry and accessories matching "${this.searchQuery}". Browse our collection of unique, limited-edition pieces from Perla.`;
      keywords = `${this.searchQuery}, search results, jewelry, accessories, perla`;
    }

    this.seoService.updateSEO({
      title,
      description,
      keywords,
      type: 'website'
    });

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: 'https://perla-accessories.vercel.app' },
      { name: 'Products', url: 'https://perla-accessories.vercel.app/products' }
    ];

    if (selectedCategoryName) {
      breadcrumbs.push({
        name: selectedCategoryName,
        url: `https://perla-accessories.vercel.app/products?category=${this.selectedCategory}`
      });
    }

    this.seoService.generateBreadcrumbs(breadcrumbs);
  }
}
