import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api/api.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, Review, Category } from '../../../core/models';
import { CartService } from '../../../core/services/cart/cart.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfirmationModalService } from '../../../core/services/confirmation-modal.service';
import { ReviewFormComponent } from '../review-form/review-form/review-form.component';
import { SeoService } from '../../../core/services/seo.service';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

// Import Swiper modules
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReviewFormComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./product-detail.component.css'],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @ViewChild('mainSwiper', { static: false }) mainSwiper?: ElementRef;
  @ViewChild('thumbsSwiper', { static: false }) thumbsSwiper?: ElementRef;

  product?: Product;
  reviews: Review[] = [];
  loading = true;
  error = '';
  cartMessage = '';
  fallbackImage = 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png';
  showReviewForm = false;
  relatedProducts: Product[] = [];
  activeSlideIndex = 0;
  category?: Category;
  productId: number = 0;

  private routeSubscription?: Subscription;
  private syncInterval?: any;

  // Main swiper configuration
  mainSwiperConfig = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: false,
    pagination: {
      el: '.main-swiper-pagination',
      type: 'bullets',
      clickable: true,
      hideOnClick: false,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
    },
    grabCursor: true,
    loop: false,
    autoplay: false,
    effect: 'slide',
    speed: 300,
    allowTouchMove: true,
    watchSlidesProgress: true,
    on: {
      slideChange: (swiper: any) => {
        this.ngZone.run(() => {
          this.activeSlideIndex = swiper.activeIndex;
          this.cdr.detectChanges();
        });
      },
      slideChangeTransitionEnd: (swiper: any) => {
        this.ngZone.run(() => {
          this.activeSlideIndex = swiper.activeIndex;
          this.cdr.detectChanges();
        });
      },
      touchEnd: (swiper: any) => {
        this.ngZone.run(() => {
          this.activeSlideIndex = swiper.activeIndex;
          this.cdr.detectChanges();
        });
      }
    }
  };

  // Thumbnails swiper configuration
  thumbsSwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 10,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      640: {
        slidesPerView: 5,
      },
      768: {
        slidesPerView: 6,
      },
      1024: {
        slidesPerView: 4,
      },
    },
    direction: 'horizontal',
    grabCursor: true,
  };

  private api = inject(ApiService);
  private productSvc = inject(ProductService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private confirmationModal = inject(ConfirmationModalService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private seoService = inject(SeoService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    // Get product ID from route immediately
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;

        // Clear previous product data
        this.product = undefined;
        this.category = undefined;

        // Load product details
        this.loadProduct(this.productId);
        this.loadReviews(this.productId);
      }
    });
  }

  private resetComponentState() {
    this.loading = true;
    this.error = '';
    this.cartMessage = '';
    this.showReviewForm = false;
    this.product = undefined;
    this.reviews = [];
    this.relatedProducts = [];
    this.activeSlideIndex = 0;

    // Clear any existing sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    // Scroll to top when loading new product
    this.scrollToTop();
  }

  private loadProduct(id: number) {
    this.api.products.get(id).subscribe({
      next: p => {
        this.product = {
          ...p,
          images: (p.images || []).map(img => ({
            id: img.id,
            url: img.url,
          })),
        };

        this.loading = false;
        this.setupProductSEO();

        // Load category for additional data
        if (this.product.category_id) {
          this.api.categories.get(this.product.category_id).subscribe({
            next: category => {
              this.category = category;
            },
            error: () => {
              // Continue even if category fails to load
            }
          });
        }

        this.loadRelatedProducts(this.product.category_id, this.product.id);

        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            this.initializeSwiper();
          }
        }, 100);
      },
      error: err => {
        this.error = 'Product not found.';
        this.loading = false;
      },
    });
  }

  private initializeSwiper() {
    try {
      const mainSwiperEl = this.mainSwiper?.nativeElement;
      const thumbsSwiperEl = this.thumbsSwiper?.nativeElement;

      if (mainSwiperEl && thumbsSwiperEl) {
        // First initialize thumbnails swiper
        Object.assign(thumbsSwiperEl, this.thumbsSwiperConfig);
        thumbsSwiperEl.initialize();

        // Then initialize main swiper with thumbs reference
        Object.assign(mainSwiperEl, {
          ...this.mainSwiperConfig,
          thumbs: {
            swiper: thumbsSwiperEl.swiper
          }
        });
        mainSwiperEl.initialize();

        // Add event listeners for slide changes
        const updateActiveIndex = (event: any) => {
          this.ngZone.run(() => {
            this.activeSlideIndex = event.detail[0].activeIndex;
            this.cdr.detectChanges();
          });
        };

        mainSwiperEl.addEventListener('swiperslidechange', updateActiveIndex);
        mainSwiperEl.addEventListener('slidetransitionend', updateActiveIndex);

        // Sync slides periodically to ensure accuracy
        this.syncInterval = setInterval(() => {
          if (mainSwiperEl.swiper) {
            this.ngZone.run(() => {
              this.activeSlideIndex = mainSwiperEl.swiper.activeIndex;
              this.cdr.detectChanges();
            });
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Swiper initialization failed:', error);
    }
  }

  private loadReviews(id: number) {
    this.api.reviews.list().subscribe({
      next: reviews => {
        this.reviews = reviews.filter(r => r.product_id === id);
      },
      error: () => {
        // Reviews are optional, don't show error
      },
    });
  }

  private loadRelatedProducts(categoryId: number, currentProductId: number) {
    this.productSvc.getProducts<Product>(1, 8).subscribe({
      next: resp => {
        this.relatedProducts = resp.data
          .filter(p => p.category_id === categoryId && p.id !== currentProductId)
          .slice(0, 4)
          .map(p => ({
            ...p,
            images: (p.images || []).map(img => ({
              id: img.id,
              url: img.url,
            })),
          }));
      },
      error: () => {
        // Related products are optional
      },
    });
  }

  addToCart() {
    if (this.product) {
      this.cart.add(this.product);
      this.cartMessage = 'Added to cart!';
      setTimeout(() => (this.cartMessage = ''), 2000);
    }
  }

  buyNow() {
    if (this.product) {
      this.cart.add(this.product);
      this.router.navigate(['/cart']);
    }
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser$.value;
  }

  isAdmin(): boolean {
    const user = this.auth.currentUser$.value;
    return !!user && user.role === 'admin';
  }

  async deleteReview(id: number) {
    const confirmed = await this.confirmationModal.confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      this.api.reviews.delete(id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== id);
        },
        error: () => {
          // Handle error if needed
        }
      });
    }
  }

  getStockPhrase(stock: number): string {
    if (stock <= 0) return 'Out of stock';
    if (stock <= 5) return `Only ${stock} left!`;
    return 'In stock';
  }

  onReviewSubmitted() {
    this.showReviewForm = false;
    if (this.product) {
      this.loadReviews(this.product.id);
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = this.fallbackImage;
  }

  getAverageRating(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / this.reviews.length).toFixed(1));
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addRelatedProductToCart(product: Product) {
    this.cart.add(product);
    // Brief feedback without message persistence
    setTimeout(() => { }, 1000);
  }

  goToSlide(index: number) {
    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      mainSwiperEl.swiper.slideTo(index);
    }
  }

  nextSlide() {
    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      mainSwiperEl.swiper.slideNext();
    } else {
      // Fallback for manual control
      if (this.product && this.product.images && this.product.images.length > 0) {
        this.activeSlideIndex = (this.activeSlideIndex + 1) % this.product.images.length;
      }
    }
  }

  prevSlide() {
    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      mainSwiperEl.swiper.slidePrev();
    } else {
      // Fallback for manual control
      if (this.product && this.product.images && this.product.images.length > 0) {
        this.activeSlideIndex = this.activeSlideIndex === 0
          ? this.product.images.length - 1
          : this.activeSlideIndex - 1;
      }
    }
  }

  private setupProductSEO() {
    if (!this.product) return;

    const productTitle = `${this.product.name} - Perla Accessories`;
    const productDescription = this.product.description
      ? `${this.product.description} - Premium jewelry from Perla Accessories. Only ${this.product.price} EGP. ${this.product.stock > 0 ? 'In Stock' : 'Out of Stock'}.`
      : `${this.product.name} - Premium jewelry from Perla Accessories. Only ${this.product.price} EGP. ${this.product.stock > 0 ? 'In Stock' : 'Out of Stock'}.`;

    const productImage = this.product.images?.[0]?.url || 'https://perla-accessories.vercel.app/logo.png';

    // Update SEO meta tags
    this.seoService.updateSEO({
      title: productTitle,
      description: productDescription,
      keywords: `${this.product.name}, jewelry, accessories, perla, premium jewelry, ${this.category?.name || 'accessories'}, fashion accessories, Egyptian jewelry`,
      type: 'product',
      image: productImage,
      price: this.product.price,
      currency: 'EGP',
      availability: this.product.stock > 0 ? 'in_stock' : 'out_of_stock',
      brand: 'Perla',
      category: this.category?.name || 'Accessories'
    });

    // Add product structured data
    this.seoService.addProductSchema({
      ...this.product,
      averageRating: this.getAverageRating(),
      reviewCount: this.reviews.length
    });

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: 'https://perla-accessories.vercel.app' },
      { name: 'Products', url: 'https://perla-accessories.vercel.app/products' },
    ];

    if (this.category) {
      breadcrumbs.push({
        name: this.category.name,
        url: `https://perla-accessories.vercel.app/products?category=${this.category.id}`
      });
    }

    breadcrumbs.push({
      name: this.product.name,
      url: `https://perla-accessories.vercel.app/products/${this.product.id}`
    });

    this.seoService.generateBreadcrumbs(breadcrumbs);
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}