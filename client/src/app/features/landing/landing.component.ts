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
import { SocialMediaService } from '../../core/services/social-media.service';
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
  private seo = inject(SeoService);
  private socialMedia = inject(SocialMediaService);

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
    this.calculateFoundingYear();
  }

  ngAfterViewInit(): void {
    // Initialize AOS with professional e-commerce configuration
    AOS.init({
      duration: 600, // Faster, snappier animations
      easing: 'ease-out', // Professional, smooth easing
      once: true, // Animate only once for better performance
      mirror: false, // No mirror animations for cleaner experience
      offset: 100, // Earlier trigger point for smoother experience
      delay: 0, // No global delay
      anchorPlacement: 'top-bottom', // Professional trigger point
      disable: 'mobile', // Disable on mobile for performance (optional)
      startEvent: 'DOMContentLoaded',
      animatedClassName: 'aos-animate',
      initClassName: 'aos-init',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    // Refresh AOS when page loads
    setTimeout(() => {
      AOS.refresh();
    }, 100);
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

        // Update SEO with product collection data after products are loaded
        this.updateSEOWithProducts();
      },
      error: () => {
        this.error = 'Could not load featured products.';
        this.loading = false;

        // Fallback to default homepage SEO if products fail to load
        this.seo.updateSEO(this.seo.generateHomepageSEO());
        this.seo.updateCanonicalUrl('/');
        this.socialMedia.resetToDefault();
      },
    });
  }

  private updateSEOWithProducts(): void {
    if (this.featuredProducts.length > 0) {
      // Use product collection SEO that showcases actual products
      const seoData = this.seo.generateProductCollectionSEO(this.featuredProducts);
      this.seo.updateSEO(seoData);
      this.seo.updateCanonicalUrl('/');

      // Update social media tags with products
      this.socialMedia.updateHomepageWithProducts(this.featuredProducts);
    } else {
      // Fallback to homepage SEO if no featured products
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

  // Newsletter signup functionality
  subscribeToNewsletter(): void {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      this.notification.show('Please enter a valid email address', 'error');
      return;
    }

    this.newsletterLoading = true;

    // Simulate newsletter subscription (replace with actual API call when available)
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

  // Scroll to section functionality
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Generate star rating array
  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}