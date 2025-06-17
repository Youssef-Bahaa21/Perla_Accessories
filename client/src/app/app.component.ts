// src/app/app.component.ts
import { Component, OnInit, ViewContainerRef, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule, isPlatformBrowser as commonIsPlatformBrowser } from '@angular/common';
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
import { environment } from '../environments/environment';

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
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Set the viewContainerRef for the modal service
      this.confirmationModal.setViewContainerRef(this.viewContainerRef);

      // Subscribe to user changes
      this.authService.currentUser$.subscribe(user => {
        this.user = user;
      });

      // Fetch CSRF token
      this.http.get(`${environment.api}/api/csrf-token`, { withCredentials: true }).subscribe({
        next: () => { },
        error: () => { }
      });

      // Fix for iOS 100vh issue
      this.setViewportHeight();

      // Add resize listener for viewport height
      window.addEventListener('resize', this.setViewportHeight);
      window.addEventListener('orientationchange', this.setViewportHeight);
    }
  }

  // Fix for iOS 100vh issue
  private setViewportHeight = (): void => {
    if (isPlatformBrowser(this.platformId)) {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
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

    // Add/remove body class to prevent scrolling when menu is open
    if (isPlatformBrowser(this.platformId)) {
      if (this.showMobileMenu) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  isLoggedIn(): boolean {
    return !!this.authService.currentUser$.value;
  }

  isAdmin(): boolean {
    if (!this.authService.currentUser$.value) return false;
    return this.authService.currentUser$.value.role === 'admin';
  }

  cartItemCount(): number {
    return this.cartService.getItemCount();
  }

  logout(): void {
    this.confirmationModal.confirmLogout().then(confirmed => {
      if (confirmed) {
        this.authService.logout().subscribe(() => {
          this.cartService.clear();
          this.router.navigateByUrl('/');
        });
      }
    });
  }
}