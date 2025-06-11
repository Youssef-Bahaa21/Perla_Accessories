import { Component, HostListener, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { CartService } from '../../core/services/cart/cart.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { PromoBarComponent } from "../promo-bar/promo-bar.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, PromoBarComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  cartCount = 0;
  isScrolled = false;
  showPromoBar = true;

  private lastScrollY = 0;

  private platformId = inject(PLATFORM_ID);
  private cart = inject(CartService);
  private router = inject(Router);
  private auth = inject(AuthService);

  constructor() {
    this.cart.cart$.subscribe(() =>
      (this.cartCount = this.cart.getItemCount())
    );
  }

  get isLoggedIn(): boolean {
    return !!this.auth.currentUser$.value;
  }

  get isAdmin(): boolean {
    return this.auth.currentUser$.value?.role === 'admin';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll = window.scrollY;

    // Navbar shadow toggle (keep this)
    this.isScrolled = currentScroll > 20;

    // Promo bar scroll direction detection
    if (currentScroll > this.lastScrollY && currentScroll > 80) {
      this.showPromoBar = false; // Scroll down
    } else {
      this.showPromoBar = true; // Scroll up
    }

    this.lastScrollY = currentScroll;
  }

  // Scroll to top method for navigation links
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToCart(): void {
    this.router.navigateByUrl('/cart');
    this.closeMobileMenu();
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.cart.clear();
      this.router.navigateByUrl('/');
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  navigateToAdmin(): void {
    this.router.navigateByUrl('/admin/products');
    this.closeMobileMenu();
  }
}
