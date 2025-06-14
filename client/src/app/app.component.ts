// src/app/app.component.ts
import { Component, OnInit, HostListener, PLATFORM_ID, inject, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth/auth.service';
import { CartService } from './core/services/cart/cart.service';
import { ConfirmationModalService } from './core/services/confirmation-modal.service';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CartComponent } from './features/cart/cart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { SeoService } from './core/services/seo.service';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    ToastrModule,
    NgxSpinnerModule,
    NgxSpinnerComponent,
    HeaderComponent,
    FooterComponent,
    CartComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showMobileMenu = false;
  showDropdown = false;
  user: any;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private confirmationModal: ConfirmationModalService,
    private http: HttpClient,
    private router: Router,
    private viewContainerRef: ViewContainerRef,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to router events to update SEO for each page
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updatePageSEO(event.url);
        }
      });

      // Initialize authentication and user state
      this.authService.currentUser$.subscribe((user: any) => {
        this.user = user;
      });

      // Fetch CSRF token with debugging
      this.http.get(`${environment.api}/api/csrf-token`, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log('✅ CSRF token fetched successfully');
        },
        error: (error) => {
          console.warn('⚠️ Could not fetch CSRF token, continuing without it:', error.message);
        }
      });

      this.confirmationModal.setViewContainerRef(this.viewContainerRef);
    }
  }

  private updatePageSEO(url: string): void {
    // Skip SEO updates for routes that handle their own SEO
    if (url.includes('/products/') ||
      url.includes('/landing') ||
      url.includes('/category') ||
      url.includes('/cart') ||
      url.includes('/checkout') ||
      url.includes('/admin') ||
      url.includes('/login') ||
      url.includes('/register')) {
      console.log('🚫 Skipping app-level SEO update for:', url, '(page handles its own SEO)');
      return;
    }

    // Update SEO based on the current route
    if (url === '/') {
      console.log('🏠 Updating homepage SEO');
      this.seo.updateSEO(this.seo.generateHomepageSEO());
    } else if (url === '/about') {
      console.log('ℹ️ Updating about page SEO');
      this.seo.updateSEO(this.seo.generateAboutSEO());
    } else if (url === '/privacy-policy') {
      console.log('🔒 Updating privacy policy SEO');
      this.seo.updateSEO(this.seo.generatePrivacyPolicySEO());
    } else if (url === '/terms-of-service') {
      console.log('📋 Updating terms of service SEO');
      this.seo.updateSEO(this.seo.generateTermsOfServiceSEO());
    } else if (url.includes('/returns-policy')) {
      console.log('↩️ Updating returns policy SEO');
      this.seo.updateSEO(this.seo.generateReturnsOrShippingPolicySEO('returns'));
    } else if (url.includes('/shipping-details')) {
      console.log('🚚 Updating shipping details SEO');
      this.seo.updateSEO(this.seo.generateReturnsOrShippingPolicySEO('shipping'));
    }
    // All other pages use default homepage SEO or handle their own
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Close dropdown when clicking outside
      if (!event.target.closest('.user-dropdown') && this.showDropdown) {
        this.showDropdown = false;
      }
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  isLoggedIn(): boolean {
    return !!this.authService.currentUser$.value;
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser$.value;
    return !!user && user.role === 'admin';
  }

  cartItemCount(): number {
    return this.cartService.getItemCount();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}