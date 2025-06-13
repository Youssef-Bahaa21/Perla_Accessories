import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api/api.service';
import { Product, Category } from '../../core/models';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ProductService } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import { SeoService } from '../../core/services/seo.service';
import { SocialMediaService } from '../../core/services/social-media.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('categoriesSection') categoriesSection!: ElementRef;
  @ViewChild('featuredSection') featuredSection!: ElementRef;
  @ViewChild('whyChooseSection') whyChooseSection!: ElementRef;
  @ViewChild('brandStorySection') brandStorySection!: ElementRef;
  @ViewChild('testimonialsSection') testimonialsSection!: ElementRef;
  @ViewChild('socialSection') socialSection!: ElementRef;

  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  categoriesLoading = true;
  error = '';
  categoriesError = '';
  fallbackImage = 'https://via.placeholder.com/150';
  foundingYear = 0;

  // Animation observers
  private observers: IntersectionObserver[] = [];
  private animatedElements = new Set<Element>();

  // Newsletter signup
  newsletterEmail = '';
  newsletterLoading = false;
  newsletterMessage = '';

  // Brand information from about component
  brandInfo = {
    yearsInBusiness: 3,
    brandName: 'Perla',
    tagline: 'Every accessory you pick should feel like it was made just for you',
    philosophy: 'We believe in the magic of one of a kind style',
    focus: 'limited edition pieces',
    socialMedia: {
      instagram: '@perlaaccessoriesboutique',
      instagramUrl: 'https://www.instagram.com/perlaaccessoriesboutique?igsh=MXBzYmU2YmRvZXc5cw==',
      tiktok: '@perlaaccesories0',
      tiktokUrl: 'https://www.tiktok.com/@perlaaccesories0?_t=ZS-8vtSpUwLtoO&_r=1'
    }
  };

  // Customer testimonials based on brand values
  testimonials = [
    {
      name: 'Sarah M.',
      text: 'The quality is amazing! Each piece feels so unique and special.',
      rating: 5
    },
    {
      name: 'Layla K.',
      text: 'Love that their pieces are limited edition. I always get compliments!',
      rating: 5
    },
    {
      name: 'Nour A.',
      text: 'Three years of beautiful accessories. Perla never disappoints!',
      rating: 5
    }
  ];

  private productSvc = inject(ProductService);
  private api = inject(ApiService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private seo = inject(SeoService);
  private socialMedia = inject(SocialMediaService);

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
    this.calculateFoundingYear();
  }

  ngAfterViewInit(): void {
    this.initializeScrollAnimations();
    this.initializeParallaxEffects();
  }

  ngOnDestroy(): void {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
  }

  private initializeScrollAnimations(): void {
    // Create intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.triggerAnimation(entry.target);
          this.animatedElements.add(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
      '.animate-on-scroll, .stagger-children > *, .fade-in-up, .slide-in-left, .slide-in-right, .scale-in, .rotate-in'
    );

    animatableElements.forEach(el => {
      animationObserver.observe(el);
    });

    this.observers.push(animationObserver);

    // Add scroll progress indicator
    this.addScrollProgressIndicator();
  }

  private initializeParallaxEffects(): void {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');

      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });

      ticking = false;
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  }

  private triggerAnimation(element: Element): void {
    const animationType = this.getAnimationType(element);

    switch (animationType) {
      case 'fade-in-up':
        this.animateFadeInUp(element);
        break;
      case 'slide-in-left':
        this.animateSlideInLeft(element);
        break;
      case 'slide-in-right':
        this.animateSlideInRight(element);
        break;
      case 'scale-in':
        this.animateScaleIn(element);
        break;
      case 'rotate-in':
        this.animateRotateIn(element);
        break;
      case 'stagger':
        this.animateStagger(element);
        break;
      default:
        this.animateDefault(element);
    }
  }

  private getAnimationType(element: Element): string {
    if (element.classList.contains('fade-in-up')) return 'fade-in-up';
    if (element.classList.contains('slide-in-left')) return 'slide-in-left';
    if (element.classList.contains('slide-in-right')) return 'slide-in-right';
    if (element.classList.contains('scale-in')) return 'scale-in';
    if (element.classList.contains('rotate-in')) return 'rotate-in';
    if (element.parentElement?.classList.contains('stagger-children')) return 'stagger';
    return 'default';
  }

  private animateFadeInUp(element: Element): void {
    (element as HTMLElement).style.opacity = '0';
    (element as HTMLElement).style.transform = 'translateY(50px)';

    setTimeout(() => {
      (element as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      (element as HTMLElement).style.opacity = '1';
      (element as HTMLElement).style.transform = 'translateY(0)';
    }, 100);
  }

  private animateSlideInLeft(element: Element): void {
    (element as HTMLElement).style.opacity = '0';
    (element as HTMLElement).style.transform = 'translateX(-100px)';

    setTimeout(() => {
      (element as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      (element as HTMLElement).style.opacity = '1';
      (element as HTMLElement).style.transform = 'translateX(0)';
    }, 100);
  }

  private animateSlideInRight(element: Element): void {
    (element as HTMLElement).style.opacity = '0';
    (element as HTMLElement).style.transform = 'translateX(100px)';

    setTimeout(() => {
      (element as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      (element as HTMLElement).style.opacity = '1';
      (element as HTMLElement).style.transform = 'translateX(0)';
    }, 100);
  }

  private animateScaleIn(element: Element): void {
    (element as HTMLElement).style.opacity = '0';
    (element as HTMLElement).style.transform = 'scale(0.5)';

    setTimeout(() => {
      (element as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      (element as HTMLElement).style.opacity = '1';
      (element as HTMLElement).style.transform = 'scale(1)';
    }, 100);
  }

  private animateRotateIn(element: Element): void {
    (element as HTMLElement).style.opacity = '0';
    (element as HTMLElement).style.transform = 'rotate(-180deg) scale(0.5)';

    setTimeout(() => {
      (element as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      (element as HTMLElement).style.opacity = '1';
      (element as HTMLElement).style.transform = 'rotate(0deg) scale(1)';
    }, 100);
  }

  private animateStagger(element: Element): void {
    const parent = element.parentElement;
    if (!parent) return;

    const children = Array.from(parent.children);
    const index = children.indexOf(element);

    setTimeout(() => {
      this.animateFadeInUp(element);
    }, index * 150);
  }

  private animateDefault(element: Element): void {
    this.animateFadeInUp(element);
  }

  private addScrollProgressIndicator(): void {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.pageYOffset;
      const progress = (scrolled / scrollHeight) * 100;
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  private calculateFoundingYear(): void {
    const currentYear = new Date().getFullYear();
    this.foundingYear = currentYear - this.brandInfo.yearsInBusiness;
  }

  private loadFeaturedProducts(): void {
    this.productSvc.getProducts<Product>(1, 20).subscribe({
      next: resp => {
        const all: Product[] = resp.data;

        this.featuredProducts = all
          .filter(prod => prod.is_featured === 1)
          .filter(
            prod =>
              Array.isArray((prod as any).images) &&
              (prod as any).images.length > 0,
          )
          .map(prod => {
            const imgs = (prod as any).images.map((img: any) => ({
              id: img.id,
              url: img.url,
            }));
            return {
              ...prod,
              price: +prod.price,
              images: imgs,
            } as Product;
          });

        this.loading = false;
        this.updateSEOWithProducts();
      },
      error: () => {
        this.error = 'Could not load featured products.';
        this.loading = false;
        this.seo.updateSEO(this.seo.generateHomepageSEO());
        this.seo.updateCanonicalUrl('/');
        this.socialMedia.resetToDefault();
      },
    });
  }

  private updateSEOWithProducts(): void {
    if (this.featuredProducts.length > 0) {
      const seoData = this.seo.generateProductCollectionSEO(this.featuredProducts);
      this.seo.updateSEO(seoData);
      this.seo.updateCanonicalUrl('/');
      this.socialMedia.updateHomepageWithProducts(this.featuredProducts);
    } else {
      this.seo.updateSEO(this.seo.generateHomepageSEO());
      this.seo.updateCanonicalUrl('/');
      this.socialMedia.resetToDefault();
    }
  }

  private loadCategories(): void {
    this.api.categories.list().subscribe({
      next: categories => {
        this.categories = categories;
        this.categoriesLoading = false;
      },
      error: () => {
        this.categoriesError = 'Could not load categories.';
        this.categoriesLoading = false;
      },
    });
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId }
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  subscribeToNewsletter(): void {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      this.notification.show('Please enter a valid email address', 'error');
      return;
    }

    this.newsletterLoading = true;

    setTimeout(() => {
      this.newsletterLoading = false;
      this.notification.show('Thank you for subscribing! Welcome to the Perla family 🌸', 'success');
      this.newsletterEmail = '';
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}