import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
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
  isBrowser: boolean = false;

  // Premium design enhancement properties
  isAnimating = false;
  imageLoadingStates: { [key: string]: boolean } = {};

  private routeSubscription?: Subscription;
  private syncInterval?: any;

  // Enhanced main swiper configuration with mobile-first features
  mainSwiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: false,
    pagination: {
      el: '.main-swiper-pagination',
      type: 'bullets',
      clickable: true,
      hideOnClick: false,
      dynamicBullets: true,
      dynamicMainBullets: 3,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    mousewheel: {
      enabled: false, // Disable mousewheel on mobile
      forceToAxis: true,
      sensitivity: 0.5,
    },
    grabCursor: true,
    loop: false,
    autoplay: false,
    effect: 'fade',
    speed: 400,
    allowTouchMove: true,
    watchSlidesProgress: true,
    lazy: {
      enabled: true,
      loadPrevNext: true,
      loadPrevNextAmount: 1,
    },
    breakpoints: {
      640: {
        effect: 'slide',
        speed: 600,
        mousewheel: {
          enabled: true,
        },
      }
    },
    on: {
      slideChange: (swiper: any) => {
        this.ngZone.run(() => {
          this.activeSlideIndex = swiper.activeIndex;
          this.isAnimating = false;
          this.cdr.detectChanges();
        });
      },
      slideChangeTransitionStart: (swiper: any) => {
        this.ngZone.run(() => {
          this.isAnimating = true;
          this.cdr.detectChanges();
        });
      },
      slideChangeTransitionEnd: (swiper: any) => {
        this.ngZone.run(() => {
          this.activeSlideIndex = swiper.activeIndex;
          this.isAnimating = false;
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

  // Enhanced thumbnails swiper configuration with mobile breakpoints
  thumbsSwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 8,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      480: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      640: {
        slidesPerView: 5,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 6,
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 12,
      },
    },
    direction: 'horizontal',
    grabCursor: true,
    centerInsufficientSlides: true,
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

        // Set basic SEO immediately for social media crawlers
        this.setupBasicSEO(this.productId);

        // Clear previous product data
        this.resetComponentState();

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
    this.isAnimating = false;
    this.imageLoadingStates = {};

    // Clear any existing sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    // Smooth scroll to top when loading new product
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

        // Initialize image loading states
        this.product.images?.forEach((img, index) => {
          this.imageLoadingStates[`${this.product!.id}-${index}`] = false;
        });

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
        }, 150);
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
    if (this.product && this.product.stock > 0) {
      this.cart.add(this.product);
      this.cartMessage = 'Added to cart!';

      // Provide haptic feedback on mobile if available
      if (this.isMobileDevice() && navigator.vibrate) {
        navigator.vibrate(50);
      }

      setTimeout(() => {
        this.cartMessage = '';
        this.cdr.detectChanges();
      }, 2000);
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
    const img = event.target as HTMLImageElement;
    if (!img.src.includes(this.fallbackImage)) {
      img.src = this.fallbackImage;
      if (this.isMobileDevice()) {
        img.style.objectFit = 'contain';
        img.style.padding = '1rem';
      }
    }
  }

  onImageLoad(imageKey: string) {
    this.imageLoadingStates[imageKey] = true;
    if (!this.isMobileDevice()) {
      // Only trigger detection on desktop to avoid unnecessary reflows
      this.cdr.detectChanges();
    }
  }

  getAverageRating(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / this.reviews.length).toFixed(1));
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addRelatedProductToCart(product: Product) {
    this.cart.add(product);
    // Brief visual feedback
    const originalText = `Added ${product.name} to cart!`;
    setTimeout(() => {
      // Visual feedback complete
    }, 1500);
  }

  goToSlide(index: number) {
    if (this.isAnimating) return; // Prevent multiple rapid clicks

    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      this.isAnimating = true;
      mainSwiperEl.swiper.slideTo(index);
    }
  }

  nextSlide() {
    if (this.isAnimating) return;

    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      this.isAnimating = true;
      mainSwiperEl.swiper.slideNext();
    } else {
      // Fallback for manual control
      if (this.product && this.product.images && this.product.images.length > 0) {
        this.activeSlideIndex = (this.activeSlideIndex + 1) % this.product.images.length;
      }
    }
  }

  prevSlide() {
    if (this.isAnimating) return;

    const mainSwiperEl = this.mainSwiper?.nativeElement;
    if (mainSwiperEl && mainSwiperEl.swiper) {
      this.isAnimating = true;
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

  // Premium design helper methods
  getImageTransitionClass(index: number): string {
    if (this.isMobileDevice()) {
      return this.isAnimating ? 'transition-opacity duration-400 ease-in-out' : 'transition-opacity duration-300 ease-out';
    }
    return this.isAnimating ? 'transition-all duration-600 ease-in-out' : 'transition-all duration-300 ease-out';
  }

  getProductBadgeClasses(product: Product): string[] {
    const classes: string[] = [];
    if (product.is_new === 1) classes.push('animate-pulse-subtle');
    if (product.is_best_seller === 1) classes.push('animate-glow');
    return classes;
  }

  private setupProductSEO() {
    if (!this.product) return;

    const productTitle = `${this.product.name} - Perla Accessories`;
    const productDescription = this.product.description
      ? `${this.product.description} - Premium jewelry from Perla Accessories. Only ${this.product.price} EGP. ${this.product.stock > 0 ? 'In Stock' : 'Out of Stock'}.`
      : `${this.product.name} - Premium jewelry from Perla Accessories. Only ${this.product.price} EGP. ${this.product.stock > 0 ? 'In Stock' : 'Out of Stock'}.`;

    // Prioritize Cloudinary images for social media
    const productImage = this.product.images?.[0]?.url || this.product.images?.[0]?.image || 'https://perla-accessories.vercel.app/logo.png';

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

  private setupBasicSEO(productId: number): void {
    // Set basic product SEO immediately for social media crawlers
    this.seoService.updateSEO({
      title: `Premium Jewelry Product - Perla Accessories`,
      description: `Discover premium handcrafted jewelry at Perla Accessories. Unique, limited-edition pieces with exceptional quality and craftsmanship.`,
      keywords: 'premium jewelry, handcrafted accessories, perla, egyptian jewelry, unique jewelry',
      type: 'product',
      image: 'https://perla-accessories.vercel.app/logo.png', // Fallback image
      url: `https://perla-accessories.vercel.app/products/${productId}`
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  // Enhanced mobile detection
  isMobileDevice(): boolean {
    if (!this.isBrowser) return false;
    return window.innerWidth <= 640;
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      const isMobile = this.isMobileDevice();
      if (isMobile) {
        this.disableHoverEffects();
        this.updateMobileSwiper();
      } else {
        this.enableHoverEffects();
        this.updateDesktopSwiper();
      }
    }
  }

  private updateMobileSwiper() {
    if (this.mainSwiper?.nativeElement) {
      const swiperInstance = this.mainSwiper.nativeElement.swiper;
      if (swiperInstance) {
        swiperInstance.params.effect = 'fade';
        swiperInstance.params.speed = 400;
        swiperInstance.params.mousewheel.enabled = false;
        swiperInstance.update();
      }
    }
  }

  private updateDesktopSwiper() {
    if (this.mainSwiper?.nativeElement) {
      const swiperInstance = this.mainSwiper.nativeElement.swiper;
      if (swiperInstance) {
        swiperInstance.params.effect = 'slide';
        swiperInstance.params.speed = 600;
        swiperInstance.params.mousewheel.enabled = true;
        swiperInstance.update();
      }
    }
  }

  private disableHoverEffects() {
    // Reset all hover states and animations
    Object.keys(this.imageLoadingStates).forEach(key => {
      this.imageLoadingStates[key] = false;
    });
    this.isAnimating = false;
  }

  private enableHoverEffects() {
    // Re-enable hover animations if needed
    this.cdr.detectChanges();
  }

  // Enhanced navigation for mobile
  navigateToProduct(productId: number) {
    if (this.isBrowser) {
      window.scrollTo({
        top: 0,
        behavior: this.isMobileDevice() ? 'auto' : 'smooth'
      });
    }
    this.router.navigate(['/products', productId]);
  }
}