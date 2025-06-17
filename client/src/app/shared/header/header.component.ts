import { Component, HostListener, inject, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';

import { CartService } from '../../core/services/cart/cart.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { SearchService } from '../../core/services/search.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, ClickOutsideDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isSearchBarOpen = false;
  searchQuery = '';
  cartCount = 0;
  isScrolled = false;
  showPromoBar = true;

  // Flag to track if we're navigating due to a search action
  isNavigatingFromSearch = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchInputDesktop') searchInputDesktop!: ElementRef;

  private lastScrollY = 0;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private isMobile = false;

  private platformId = inject(PLATFORM_ID);
  private cart = inject(CartService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private searchService = inject(SearchService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

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

  ngOnInit() {
    // Check if mobile on init
    this.checkIfMobile();

    // Fix for iOS 100vh issue
    this.setViewportHeight();

    // Subscribe to router navigation start events
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Keep search bar open during navigation if it's a search-initiated navigation
      if (this.isNavigatingFromSearch) {
        // Force search bar to stay visible during transition
        this.isSearchBarOpen = true;
        this.cdr.detectChanges();
      }
    });

    // Subscribe to router navigation end events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Only close search bar if not navigating from a search action
      if (this.isMobile && this.isSearchBarOpen && !this.isNavigatingFromSearch) {
        this.isSearchBarOpen = false;
      }

      // If we're on the products page after a search, keep the search bar open
      if (this.isNavigatingFromSearch && this.router.url.includes('/products')) {
        this.isSearchBarOpen = true;

        // Focus the search input again after navigation
        setTimeout(() => {
          if (this.searchInput && this.searchInput.nativeElement) {
            this.searchInput.nativeElement.focus();
          }
        }, 500);
      }

      // Reset the flag after navigation completes
      this.isNavigatingFromSearch = false;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
    this.setViewportHeight();
  }

  private checkIfMobile() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 640;
    }
  }

  // Fix for iOS 100vh issue
  private setViewportHeight() {
    if (isPlatformBrowser(this.platformId)) {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  }

  get isLoggedIn(): boolean {
    return !!this.auth.currentUser$.value;
  }

  get isAdmin(): boolean {
    return this.auth.currentUser$.value?.role === 'admin';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
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
  }

  // Scroll to top method for navigation links
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

    // Add/remove body class to prevent scrolling when menu is open
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen) {
        document.body.classList.add('overflow-hidden');
        // Close search bar when opening mobile menu
        this.isSearchBarOpen = false;
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;

      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  navigateToAdmin(): void {
    this.router.navigateByUrl('/admin/products');
    this.closeMobileMenu();
  }

  // Enhanced search functionality
  toggleSearchBar(): void {
    console.log('Toggle search bar called, current state:', this.isSearchBarOpen);

    // Toggle search bar visibility
    this.isSearchBarOpen = !this.isSearchBarOpen;
    this.cdr.detectChanges(); // Force view update

    // Close mobile menu when opening search
    if (this.isSearchBarOpen) {
      this.isMobileMenuOpen = false;

      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.remove('overflow-hidden');
      }

      // Reset navigation flag when manually opening search
      this.isNavigatingFromSearch = false;

      // Focus the input after a small delay to ensure the element is visible
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          console.log('Attempting to focus search input...');
          if (this.searchInput && this.searchInput.nativeElement) {
            console.log('Search input found, focusing...');
            this.ngZone.run(() => {
              this.searchInput.nativeElement.focus();
              this.cdr.detectChanges();
            });
          } else {
            console.log('Search input not found');
          }
        }, 300); // Increased delay to ensure DOM is ready
      });
    }
  }

  // Search as you type with debounce
  searchProductsAsYouType(): void {
    // Update search service with current query
    this.searchService.updateSearchQuery(this.searchQuery);

    // If search query is empty, trigger clear filters
    if (!this.searchQuery.trim() && this.router.url.includes('/products')) {
      this.searchService.triggerClearFilters();
      this.router.navigate(['/products']); // Clear search params
      return;
    }

    this.searchSubject.next(this.searchQuery);
  }

  // Clear search input
  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.updateSearchQuery('');

    if (this.router.url.includes('/products')) {
      // Trigger clear filters in product list component
      this.searchService.triggerClearFilters();
      // Only navigate if we're already on products page
      this.router.navigate(['/products']);
    }
  }

  // Perform actual search
  private performSearch(query: string): void {
    // Set flag that we're navigating due to search
    this.isNavigatingFromSearch = true;

    // Update search service
    this.searchService.updateSearchQuery(query.trim());

    // Don't close search immediately, navigation will handle it if needed
    const wasOnProductsPage = this.router.url.includes('/products');

    // Navigate to products page with search query
    this.router.navigate(['/products'], {
      queryParams: { search: query.trim() },
      queryParamsHandling: wasOnProductsPage ? 'merge' : ''
    });
  }

  // Explicit search on enter key or button click
  searchProducts(event: Event): void {
    event.preventDefault();

    if (this.searchQuery.trim()) {
      this.performSearch(this.searchQuery);
    }
  }

  // Close search bar if clicked outside
  closeSearchIfNotFocused(): void {
    if (this.isSearchBarOpen && !this.isNavigatingFromSearch) {
      this.isSearchBarOpen = false;
    }
  }
}
