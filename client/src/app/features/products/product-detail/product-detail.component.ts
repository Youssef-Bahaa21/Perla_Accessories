import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api/api.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, Review } from '../../../core/models';
import { CartService } from '../../../core/services/cart/cart.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReviewFormComponent } from '../review-form/review-form/review-form.component';

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
  fallbackImage = 'https://via.placeholder.com/150';
  showReviewForm = false;
  relatedProducts: Product[] = [];
  activeSlideIndex = 0;

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
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    // Subscribe to route parameter changes to handle navigation between products
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error = 'Invalid product ID.';
        this.loading = false;
        return;
      }

      // Reset component state for new product
      this.resetComponentState();
      this.loadProduct(id);
      this.loadReviews(id);
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

        // Load related products - products in the same category
        if (this.product && this.product.category_id) {
          this.loadRelatedProducts(this.product.category_id, this.product.id);
        }

        // Initialize swiper after product is loaded
        setTimeout(() => this.initializeSwiper(), 100);
      },
      error: () => {
        this.error = 'Could not load product.';
        this.loading = false;
      }
    });
  }

  private initializeSwiper() {
    if (isPlatformBrowser(this.platformId) && this.mainSwiper && this.thumbsSwiper) {
      const mainSwiperEl = this.mainSwiper.nativeElement;
      const thumbsSwiperEl = this.thumbsSwiper.nativeElement;

      // Configure main swiper
      Object.assign(mainSwiperEl, this.mainSwiperConfig);

      // Configure thumbs swiper
      Object.assign(thumbsSwiperEl, this.thumbsSwiperConfig);

      // Initialize both swipers
      mainSwiperEl.initialize();
      thumbsSwiperEl.initialize();

      // Set up thumbs connection after initialization
      setTimeout(() => {
        if (mainSwiperEl.swiper && thumbsSwiperEl.swiper) {
          mainSwiperEl.swiper.thumbs.swiper = thumbsSwiperEl.swiper;
          mainSwiperEl.swiper.thumbs.init();
          mainSwiperEl.swiper.thumbs.update();
        }
      }, 100);

      // Add multiple event listeners for all possible slide change scenarios
      const updateActiveIndex = (event: any) => {
        this.ngZone.run(() => {
          const swiperInstance = event.detail?.[0] || mainSwiperEl.swiper;
          if (swiperInstance) {
            this.activeSlideIndex = swiperInstance.activeIndex;
            this.cdr.detectChanges();
          }
        });
      };

      // Listen to all swiper events that indicate slide changes
      mainSwiperEl.addEventListener('slidechange', updateActiveIndex);
      mainSwiperEl.addEventListener('slidechangetransitionend', updateActiveIndex);
      mainSwiperEl.addEventListener('slidechangetransitionstart', updateActiveIndex);
      mainSwiperEl.addEventListener('slidernextend', updateActiveIndex);
      mainSwiperEl.addEventListener('sliderprevend', updateActiveIndex);
      mainSwiperEl.addEventListener('touchend', () => {
        // For touch/drag events, we need a slight delay to get the correct index
        setTimeout(() => {
          if (mainSwiperEl.swiper) {
            this.ngZone.run(() => {
              this.activeSlideIndex = mainSwiperEl.swiper.activeIndex;
              this.cdr.detectChanges();
            });
          }
        }, 50);
      });

      // Also listen to the swiper's internal progress change
      mainSwiperEl.addEventListener('progress', () => {
        if (mainSwiperEl.swiper) {
          this.ngZone.run(() => {
            this.activeSlideIndex = mainSwiperEl.swiper.activeIndex;
            this.cdr.detectChanges();
          });
        }
      });

      // Set up a periodic sync to ensure the index is always correct
      this.syncInterval = setInterval(() => {
        if (mainSwiperEl.swiper && this.activeSlideIndex !== mainSwiperEl.swiper.activeIndex) {
          this.ngZone.run(() => {
            this.activeSlideIndex = mainSwiperEl.swiper.activeIndex;
            this.cdr.detectChanges();
          });
        }
      }, 100);
    }
  }

  private loadReviews(id: number) {
    this.api.reviews.list().subscribe({
      next: all => {
        this.reviews = all.filter(r => r.product_id === id);
      },
      error: () => { }
    });
  }

  private loadRelatedProducts(categoryId: number, currentProductId: number) {
    this.productSvc.getProducts<Product>(1, 50).subscribe({
      next: resp => {
        // Find products in the same category, excluding the current product
        let relatedInCategory = resp.data
          .filter(p => p.category_id === categoryId && p.id !== currentProductId);

        // If we don't have enough products in the same category, add random products
        if (relatedInCategory.length < 3) {
          const otherProducts = resp.data
            .filter(p => p.id !== currentProductId && !relatedInCategory.includes(p))
            .slice(0, 3 - relatedInCategory.length);
          relatedInCategory = [...relatedInCategory, ...otherProducts];
        }

        this.relatedProducts = relatedInCategory.slice(0, 3); // Show exactly 3 products
      },
      error: () => { }
    });
  }

  addToCart() {
    if (this.product) {
      this.cart.add(this.product);
      this.cartMessage = 'Added to your cart';
      setTimeout(() => (this.cartMessage = ''), 3000);
    }
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  isLoggedIn(): boolean {
    const currentUser = this.auth.currentUser$.value;
    return !!currentUser;
  }

  isAdmin(): boolean {
    const currentUser = this.auth.currentUser$.value;
    return currentUser?.role === 'admin';
  }

  deleteReview(id: number) {
    if (!confirm('Are you sure?')) return;
    this.api.reviews.delete(id).subscribe({
      next: () => this.product && this.loadReviews(this.product.id),
      error: () => alert('Failed to delete review.')
    });
  }

  getStockPhrase(stock: number): string {
    if (stock === 0) return 'Out of stock';
    if (stock > 0 && stock <= 5) return 'Only a few left!';
    return 'In stock';
  }

  onReviewSubmitted() {
    if (this.product) {
      this.loadReviews(this.product.id);
      this.showReviewForm = false; // Hide the form after submission
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  // Calculate average rating for reviews
  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return sum / this.reviews.length;
  }

  // Scroll to top when navigating to product detail
  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }

  // Add related product to cart
  addRelatedProductToCart(product: Product) {
    if (product && product.stock && product.stock > 0) {
      this.cart.add(product);
      this.cartMessage = `Added ${product.name} to your cart`;
      setTimeout(() => (this.cartMessage = ''), 3000);
    }
  }

  // Swiper navigation methods
  goToSlide(index: number) {
    if (this.mainSwiper && this.mainSwiper.nativeElement.swiper) {
      this.activeSlideIndex = index;
      this.mainSwiper.nativeElement.swiper.slideTo(index);
      this.cdr.detectChanges();
    }
  }

  nextSlide() {
    if (this.mainSwiper && this.mainSwiper.nativeElement.swiper) {
      this.mainSwiper.nativeElement.swiper.slideNext();
      // Force update the active index
      setTimeout(() => {
        if (this.mainSwiper && this.mainSwiper.nativeElement.swiper) {
          this.activeSlideIndex = this.mainSwiper.nativeElement.swiper.activeIndex;
          this.cdr.detectChanges();
        }
      }, 100);
    }
  }

  prevSlide() {
    if (this.mainSwiper && this.mainSwiper.nativeElement.swiper) {
      this.mainSwiper.nativeElement.swiper.slidePrev();
      // Force update the active index
      setTimeout(() => {
        if (this.mainSwiper && this.mainSwiper.nativeElement.swiper) {
          this.activeSlideIndex = this.mainSwiper.nativeElement.swiper.activeIndex;
          this.cdr.detectChanges();
        }
      }, 100);
    }
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