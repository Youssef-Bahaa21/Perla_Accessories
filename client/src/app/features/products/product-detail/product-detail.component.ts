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
import { SocialMediaService } from '../../../core/services/social-media.service';

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
  private seo = inject(SeoService);
  private socialMedia = inject(SocialMediaService);

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

        // Load category for SEO
        if (this.product.category_id) {
          this.api.categories.get(this.product.category_id).subscribe({
            next: category => {
              this.category = category;
              // Update SEO with product and category data
              this.updateProductSEO();
            },
            error: () => {
              // Still update SEO without category
              this.updateProductSEO();
            }
          });
        } else {
          this.updateProductSEO();
        }

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

  private updateProductSEO(): void {
    if (!this.product) return;

    // Skip app-level SEO update to let product page handle its own SEO
    console.log('🚫 Skipping app-level SEO update for:', this.router.url, '(page handles its own SEO)');

    // Debug: Log product data to see what images are available
    console.log('🔍 Updating SEO for product:', this.product.name);
    console.log('📸 Product images:', this.product.images);

    const seoData = this.seo.generateProductSEO(this.product, this.category);

    // Debug: Log the generated SEO data
    console.log('🎯 Generated SEO data:', seoData);
    console.log('🖼️ Image URL for sharing:', seoData.image);

    // Clear any existing conflicting meta tags first
    this.clearConflictingMetaTags();

    // Apply product SEO immediately
    this.seo.updateSEO(seoData);

    // Delay to ensure proper application, then lock in the product SEO
    setTimeout(() => {
      console.log('🔒 Final product SEO lock-in');
      this.seo.updateSEO(seoData);

      // Verify meta tags after final update
      this.verifyFinalMetaTags();
    }, 300);
  }

  private clearConflictingMetaTags(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove potentially conflicting meta tags
    const conflictingSelectors = [
      'meta[property="og:image"]',
      'meta[name="image"]',
      'meta[name="twitter:image"]'
    ];

    conflictingSelectors.forEach(selector => {
      const existingTags = document.querySelectorAll(selector);
      existingTags.forEach(tag => tag.remove());
    });
  }

  private verifyFinalMetaTags(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('🔍 FINAL VERIFICATION - Meta tags after lock-in:');

    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    const image = document.querySelector('meta[name="image"]')?.getAttribute('content');

    console.log('- og:image:', ogImage);
    console.log('- twitter:image:', twitterImage);
    console.log('- image:', image);
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
    console.log(`🔍 Loading reviews for product ${id}...`);
    this.api.reviews.list().subscribe({
      next: all => {
        console.log(`✅ Loaded ${all.length} total reviews`);
        this.reviews = all.filter(r => r.product_id === id);
        console.log(`📋 Found ${this.reviews.length} reviews for product ${id}`);
      },
      error: (error) => {
        console.error('❌ Failed to load reviews:', error);

        // Handle different types of errors gracefully
        if (error.status === 400) {
          console.warn('⚠️ Reviews API returned 400 - possibly no reviews table or bad request');
        } else if (error.status === 500) {
          console.warn('⚠️ Reviews API server error - database might not be set up');
        } else if (error.status === 0) {
          console.warn('⚠️ Reviews API unreachable - server might be down');
        }

        // Set empty reviews array so the UI doesn't break
        this.reviews = [];
      }
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

  // Buy Now - Add to cart and redirect to shipping page without opening slide cart
  buyNow() {
    if (this.product) {
      // Add product to cart silently (without opening the slide cart)
      this.cart.addSilently(this.product);
      // Navigate directly to shipping page
      this.router.navigate(['/shipping']);
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

  async deleteReview(id: number) {
    const confirmed = await this.confirmationModal.confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      confirmText: 'Delete Review',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'fa-solid fa-trash'
    });

    if (!confirmed) return;

    this.api.reviews.delete(id).subscribe({
      next: () => this.product && this.loadReviews(this.product.id),
      error: () => {
        // Use toast notification instead of alert
        console.error('Failed to delete review');
      }
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