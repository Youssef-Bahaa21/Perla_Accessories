// src/app/features/shiiping-details/shiiping-details.component.ts
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ShippingInfo } from '../../core/models';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { ApiService, ShippingCity } from '../../core/services/api/api.service';
import { CartService } from '../../core/services/cart/cart.service';

// Create a service to store shipping details between checkout steps
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private shippingInfoSubject = new BehaviorSubject<ShippingInfo | null>(null);
  shippingInfo$ = this.shippingInfoSubject.asObservable();

  saveShippingInfo(info: ShippingInfo): void {
    this.shippingInfoSubject.next(info);
  }

  getShippingInfo(): ShippingInfo | null {
    return this.shippingInfoSubject.value;
  }

  clearShippingInfo(): void {
    this.shippingInfoSubject.next(null);
  }
}

/**
 * Validates that a phone number is a valid Egyptian phone number
 * Egyptian mobile numbers start with 01 followed by 9 digits
 */
function egyptianPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(control.value) ? null : { invalidEgyptianPhone: true };
}

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shipping-details.component.html',
})
export class ShippingDetailsComponent implements OnInit {
  form!: FormGroup;
  @Output() submitted = new EventEmitter<ShippingInfo>();

  // Store shipping cities from the API
  shippingCities: ShippingCity[] = [];
  citiesLoading: boolean = false;

  // Cart total for order summary
  cartTotal: number = 0;

  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Load shipping cities
    this.loadShippingCities();

    // Get cart total
    this.calculateCartTotal();

    // Pre-fill form if we have stored shipping info
    const savedInfo = this.checkoutService.getShippingInfo();

    // Initialize form
    this.form = this.fb.group({
      name: [savedInfo?.name || '', Validators.required],
      email: [savedInfo?.email || '', [Validators.required, Validators.email]],
      address: [savedInfo?.address || '', Validators.required],
      city: [savedInfo?.city || '', Validators.required],
      phone: [savedInfo?.phone || '', [Validators.required, egyptianPhoneValidator]]
    });

    // Try to pre-fill email from logged in user
    if (!savedInfo?.email) {
      const currentUser = this.authService.currentUser$.value;
      if (currentUser?.email) {
        this.form.get('email')?.setValue(currentUser.email);
      }
    }
  }

  calculateCartTotal() {
    this.cartTotal = this.cartService.getItems().reduce((sum, item) => {
      return sum + (item.product.price * item.qty);
    }, 0);
  }

  loadShippingCities() {
    this.citiesLoading = true;
    this.apiService.settings.getActiveShippingCities().subscribe({
      next: (cities) => {
        this.shippingCities = cities;
        this.citiesLoading = false;
      },
      error: () => {
        this.citiesLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const shippingInfo = this.form.value as ShippingInfo;

      // Store shipping info in the service for the next step
      this.checkoutService.saveShippingInfo(shippingInfo);

      // Emit the shipping info (for compatibility with existing code)
      this.submitted.emit(shippingInfo);

      // Navigate to the checkout page
      this.router.navigateByUrl('/checkout');
    } else {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }
}
