import {
  Component,
  OnInit,
  HostListener,
  inject,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApiService } from '../../../core/services/api/api.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart/cart.service';
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
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  activeImageIndices: { [pid: number]: number } = {};
  addedToCartMessage: { [pid: number]: string } = {};
  loading = true;
  error = '';
  fallbackImage = 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png';

  page = 1;
  pageSize = 12;
  allProductsLoaded = false;

  selectedCategory: number | 'all' = 'all';
  stockFilter: 'all' | 'in' | 'out' = 'all';
  tagFilter: 'all' | 'new' | 'best' = 'all';

  isBrowser: boolean;
  mobileFiltersActive = false;

  private api = inject(ApiService);
  private productSvc = inject(ProductService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seo = inject(SeoService);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadPage();

    this.api.categories.list().subscribe({
      next: cats => {
        this.categories = cats;
        this.updateSEO();
      },
      error: () => (this.error = 'Could not load categories.'),
    });

    // Listen for query parameter changes
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = +params['category'];
        this.applyFilters();
        this.updateSEO();
      } else {
        this.updateSEO();
      }
    });

    // Close mobile filters when window is resized to desktop
    if (this.isBrowser) {
      window.addEventListener('resize', () => {
        if (this.getWindowWidth() >= 768 && this.mobileFiltersActive) {
          this.mobileFiltersActive = false;
        }
      });
    }
  }

  private updateSEO(): void {
    if (this.selectedCategory !== 'all') {
      // Category-specific SEO
      const category = this.categories.find(cat => cat.id === +this.selectedCategory);
      if (category) {
        const seoData = this.seo.generateCategorySEO(category);
        this.seo.updateSEO(seoData);
        this.seo.updateCanonicalUrl(`/products?category=${category.id}`);

        // Add breadcrumb for category
        const breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: category.name, url: `/products?category=${category.id}` }
        ];
        const breadcrumbData = this.seo.generateBreadcrumbStructuredData(breadcrumbs);
        this.seo.updateSEO({ structuredData: breadcrumbData });
      }
    } else {
      // General products page SEO
      const seoData = {
        title: 'Premium Handcrafted Accessories Collection',
        description: 'Discover Perla\'s complete collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style. Premium quality with 3 years of craftsmanship excellence.',
        keywords: 'accessories collection, handcrafted jewelry, premium accessories, perla accessories, unique style, limited edition, fashion accessories',
        url: '/products',
        type: 'website' as const,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Perla Accessories Collection',
          description: 'Complete collection of handcrafted accessories and jewelry',
          url: 'https://perla-accessories.vercel.app/products'
        }
      };
      this.seo.updateSEO(seoData);
      this.seo.updateCanonicalUrl('/products');

      // Add breadcrumb for products page
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' }
      ];
      const breadcrumbData = this.seo.generateBreadcrumbStructuredData(breadcrumbs);
      this.seo.updateSEO({ structuredData: breadcrumbData });
    }
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
        this.products.push(...newItems);

        newItems.forEach(p => {
          this.activeImageIndices[p.id] = 0;
        });

        this.applyFilters();
        this.loading = false;

        const totalPages = Math.ceil(resp.total / this.pageSize);
        this.allProductsLoaded = this.page >= totalPages;
      },
      error: () => {
        this.error = 'Could not load products.';
        this.loading = false;
      },
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!this.isBrowser) return;

    const threshold = document.documentElement.scrollHeight - 300;
    const position = window.pageYOffset + window.innerHeight;

    if (position > threshold && !this.loading && !this.allProductsLoaded) {
      this.page++;
      this.loadPage();
    }
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const byCat = this.selectedCategory === 'all' || p.category_id === +this.selectedCategory;
      const byStock =
        this.stockFilter === 'all' ||
        (this.stockFilter === 'in' && p.stock > 0) ||
        (this.stockFilter === 'out' && p.stock === 0);
      const byTag =
        this.tagFilter === 'all' ||
        (this.tagFilter === 'new' && p.is_new) ||
        (this.tagFilter === 'best' && p.is_best_seller);

      return byCat && byStock && byTag;
    });

    // Update URL with current filters
    this.updateUrlParams();
  }

  private updateUrlParams(): void {
    const queryParams: any = {};

    if (this.selectedCategory !== 'all') {
      queryParams.category = this.selectedCategory;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clearFilters() {
    this.selectedCategory = 'all';
    this.stockFilter = 'all';
    this.tagFilter = 'all';
    this.applyFilters();
  }

  addToCart(p: Product) {
    this.cart.add(p);
    this.addedToCartMessage[p.id] = 'Added to cart!';
    setTimeout(() => (this.addedToCartMessage[p.id] = ''), 2000);
  }

  setActiveImage(pid: number, idx: number) { this.activeImageIndices[pid] = idx; }

  showNextImage(pid: number, count: number) {
    if (count > 1) this.activeImageIndices[pid] = 1;
  }

  resetImage(pid: number) { this.activeImageIndices[pid] = 0; }

  // Enhanced mobile touch handling
  handleTouchStart(event: TouchEvent, _productId: number): void {
    // Store initial touch position if needed
    if (event.touches && event.touches.length) {
      // Could store initial X position for swipe detection
    }
  }

  handleTouchMove(e: TouchEvent, pid: number, count: number) {
    if (count <= 1) return;

    // Improved swipe detection
    if (e.touches && e.touches.length) {
      const touch = e.touches[0];
      const cur = this.activeImageIndices[pid] || 0;

      // We could add more sophisticated swipe detection here
      // For now, simply cycling through images
      this.setActiveImage(pid, cur < count - 1 ? cur + 1 : 0);
    }
  }

  hasActiveFilters() {
    return this.stockFilter !== 'all' || this.selectedCategory !== 'all' || this.tagFilter !== 'all';
  }

  getCategoryName(id: number | 'all'): string {
    if (id === 'all') return '';
    return this.categories.find(c => c.id === +id)?.name || 'Unknown';
  }

  toggleMobileFilters(): void {
    // Toggle mobile filters panel
    this.mobileFiltersActive = !this.mobileFiltersActive;

    // Prevent body scrolling when filters are open
    if (this.isBrowser) {
      document.body.style.overflow = this.mobileFiltersActive ? 'hidden' : '';
    }
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
    if (this.isBrowser && typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200; // Default width for SSR
  }

  // Method to check if device is mobile (touch-enabled)
  isMobileDevice(): boolean {
    if (!this.isBrowser) return false;
    return this.getWindowWidth() < 768 || ('ontouchstart' in window);
  }

  // Modified methods to handle mobile vs desktop behavior
  showNextImageDesktop(pid: number, count: number) {
    // Only trigger on desktop devices
    if (!this.isMobileDevice() && count > 1) {
      this.activeImageIndices[pid] = 1;
    }
  }

  resetImageDesktop(pid: number) {
    // Only trigger on desktop devices
    if (!this.isMobileDevice()) {
      this.activeImageIndices[pid] = 0;
    }
  }
}
