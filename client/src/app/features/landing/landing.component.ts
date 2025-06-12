import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from '@angular/core';
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
export class LandingPageComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  categoriesLoading = true;
  error = '';
  categoriesError = '';
  fallbackImage = 'https://via.placeholder.com/150';

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
    // Set SEO data for homepage
    this.seo.updateSEO(this.seo.generateHomepageSEO());
    this.seo.updateCanonicalUrl('/');

    // Reset social media tags to default for homepage
    this.socialMedia.resetToDefault();

    this.loadFeaturedProducts();
    this.loadCategories();
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