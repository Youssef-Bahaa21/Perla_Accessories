import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api/api.service';
import { Product, Category } from '../../core/models';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ProductService } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import { SeoService } from '../../core/services/seo.service';
import AOS from 'aos';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  categoriesLoading = true;
  error = '';
  categoriesError = '';
  fallbackImage = 'https://via.placeholder.com/150';
  foundingYear = 0;

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
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.setupSEO();
    this.loadFeaturedProducts();
    this.loadCategories();
    this.calculateFoundingYear();
  }

  private setupSEO(): void {
    this.seoService.updateSEO({
      title: 'Perla Accessories - Premium Jewelry & Fashion Accessories',
      description: 'Discover unique, limited-edition jewelry & accessories at Perla. Premium quality necklaces, earrings, rings & more. 3 years of exceptional craftsmanship in Egypt.',
      keywords: 'jewelry, accessories, necklaces, earrings, rings, bracelets, fashion accessories, premium jewelry, limited edition, Egyptian jewelry, handmade jewelry, boutique accessories',
      type: 'website',
      image: 'https://perla-accessories.vercel.app/logo.png'
    });

    this.seoService.addOrganizationSchema();
    this.seoService.addWebsiteSchema();
  }

  ngAfterViewInit(): void {
    // Initialize AOS with mobile-friendly configuration
    AOS.init({
      duration: 600, // Faster, snappier animations
      easing: 'ease-out', // Professional, smooth easing
      once: true, // Animate only once for better performance
      mirror: false, // No mirror animations for cleaner experience
      offset: window.innerWidth < 768 ? 50 : 100, // Different offset for mobile vs desktop
      delay: 0, // No global delay
      anchorPlacement: 'top-bottom', // Professional trigger point
      disable: false, // Enable animations on all devices including mobile
      startEvent: 'DOMContentLoaded',
      animatedClassName: 'aos-animate',
      initClassName: 'aos-init',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    // Multiple refresh attempts for better mobile compatibility
    setTimeout(() => {
      AOS.refresh();
    }, 100);

    setTimeout(() => {
      AOS.refresh();
    }, 500);

    // Force refresh after page fully loads
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up AOS
    AOS.refresh();
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
      },
      error: () => {
        this.error = 'Could not load featured products.';
        this.loading = false;
      },
    });
  }

  private loadCategories(): void {
    this.api.categories.list().subscribe({
      next: categories => {
        this.categories = categories;
        this.categoriesLoading = false;

        // Debug log for mobile testing
        console.log('Categories loaded:', categories.length);

        // Refresh AOS after categories load to ensure animations work
        setTimeout(() => {
          AOS.refresh();
        }, 100);
      },
      error: () => {
        this.categoriesError = 'Could not load categories.';
        this.categoriesLoading = false;
      },
    });
  }

  // Navigation methods
  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]).then(() => {
      this.scrollToTop();
    });
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId }
    }).then(() => {
      this.scrollToTop();
    });
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']).then(() => {
      this.scrollToTop();
    });
  }

  // Navigate to about page and scroll to top
  navigateToAbout(): void {
    this.router.navigate(['/about']).then(() => {
      this.scrollToTop();
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle image load errors
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = this.fallbackImage;
  }

  subscribeToNewsletter(): void {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      this.notification.show('Please enter a valid email address', 'error');
      return;
    }

    this.newsletterLoading = true;
    this.newsletterMessage = '';

    // Simulate newsletter subscription
    setTimeout(() => {
      this.newsletterLoading = false;
      this.newsletterMessage = 'Thank you for subscribing!';
      this.notification.show('Successfully subscribed to newsletter!', 'success');
      this.newsletterEmail = '';
    }, 1000);
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