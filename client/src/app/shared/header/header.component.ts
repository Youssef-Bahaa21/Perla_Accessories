import { Component, HostListener, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { CartService } from '../../core/services/cart/cart.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  isSearchBarOpen = false;
  searchQuery = '';
  cartCount = 0;
  isScrolled = false;
  showPromoBar = true;

  private lastScrollY = 0;
  private searchSubject = new Subject<string>();

  private platformId = inject(PLATFORM_ID);
  private cart = inject(CartService);
  private router = inject(Router);
  private auth = inject(AuthService);

  constructor() {
    this.cart.cart$.subscribe(() =>
      (this.cartCount = this.cart.getItemCount())
    );

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after last typing
      distinctUntilChanged() // Only emit if value changed
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      }
    });
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
    // Close search bar when opening mobile menu
    if (this.isMobileMenuOpen) {
      this.isSearchBarOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  navigateToAdmin(): void {
    this.router.navigateByUrl('/admin/products');
    this.closeMobileMenu();
  }

  // Enhanced search functionality
  toggleSearchBar(): void {
    this.isSearchBarOpen = !this.isSearchBarOpen;
    // Close mobile menu when opening search
    if (this.isSearchBarOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  // Search as you type with debounce
  searchProductsAsYouType(): void {
    this.searchSubject.next(this.searchQuery);
  }

  // Clear search input
  clearSearch(): void {
    this.searchQuery = '';
    if (this.router.url.includes('/products')) {
      // Only navigate if we're already on products page
      this.router.navigate(['/products']);
    }
  }

  // Perform actual search
  private performSearch(query: string): void {
    this.router.navigate(['/products'], {
      queryParams: { search: query.trim() }
    });

    // Don't close the search bar on mobile
    if (!this.isSearchBarOpen || window.innerWidth >= 640) {
      this.isSearchBarOpen = false;
    }

    this.scrollToTop();
  }

  // Legacy method for form submit (maintained for backward compatibility)
  searchProducts(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      // For explicit search button clicks, we want to keep the behavior
      // of closing the search bar
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.isSearchBarOpen = false;
      this.scrollToTop();
    }
  }
}
