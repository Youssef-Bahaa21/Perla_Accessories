import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CartItem, CartService } from '../../core/services/cart/cart.service';
import { ApiService, ShippingCity } from '../../core/services/api/api.service';
import { ShippingInfo, Order } from '../../core/models';
import { ShippingDetailsComponent, CheckoutService } from '../shipping-details/shipping-details.component';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  shippingInfo?: ShippingInfo;
  total = 0;
  deliveryFee = 0;
  couponCode = '';
  discount = 0;
  couponError = '';
  couponApplied = '';
  couponLocked = false;
  loading = false;
  error = '';

  // Payment method selection
  paymentMethod: 'cod' | 'vodafone_cash' | 'instapay' = 'cod';

  // Payment instructions details
  paymentDetails = {
    vodafone_cash: {
      phone: '01008914681',
      whatsapp: '01008914681'
    },
    instapay: {
      account: 'israabahaa0@instapay',
      link: 'https://ipn.eg/S/israabahaa0/instapay/5Pq7hm',
      whatsapp: '01008914681'
    }
  };

  // ✅ Shipping Cities
  shippingCities: ShippingCity[] = [];
  selectedCity: ShippingCity | null = null;
  citiesLoading = false;

  private api = inject(ApiService);
  private cart = inject(CartService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private checkoutService = inject(CheckoutService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    /* Check for stored shipping info */
    const savedShippingInfo = this.checkoutService.getShippingInfo();
    if (savedShippingInfo) {
      this.shippingInfo = savedShippingInfo;
    } else {
      /* If no shipping info is found, redirect back to the shipping page */
      this.router.navigateByUrl('/shipping');
      return;
    }

    /* Load shipping cities */
    this.loadShippingCities();

    /* cart totals */
    this.cart.cart$.subscribe(items => {
      this.cartItems = items;

      /* If cart is empty, redirect to cart page */
      if (items.length === 0) {
        this.router.navigateByUrl('/cart');
        return;
      }

      this.total = items.reduce(
        (sum, i) => sum + i.product.price * i.qty,
        0,
      );
    });
  }

  loadShippingCities() {
    this.citiesLoading = true;
    this.api.settings.getActiveShippingCities().subscribe({
      next: cities => {
        this.shippingCities = cities;

        // ✅ Auto-select city if it matches shipping info
        if (this.shippingInfo?.city && cities.length > 0) {
          const matchingCity = cities.find(c =>
            c.city_name.toLowerCase() === this.shippingInfo!.city.toLowerCase()
          );
          if (matchingCity) {
            this.selectCity(matchingCity);
          }
        }

        this.citiesLoading = false;
      },
      error: () => {
        this.citiesLoading = false;
        // Fallback to legacy shipping fee
        this.api.settings.getShippingFee().subscribe({
          next: res => (this.deliveryFee = res.shipping_fee),
          error: () => (this.deliveryFee = 0),
        });
      }
    });
  }

  selectCity(city: ShippingCity | null) {
    this.selectedCity = city;
    this.deliveryFee = city ? city.shipping_fee : 0;
  }

  getUserId(): number | null {
    return this.auth.currentUser$.value?.id ?? null;
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser$.value !== null;
  }

  get grandTotal(): number {
    // Convert all values to numbers and use toFixed(2) to avoid floating point precision issues
    return Number((Number(this.total) + Number(this.deliveryFee) - Number(this.discount)).toFixed(2));
  }

  applyCoupon() {
    this.couponError = '';
    this.couponApplied = '';
    this.couponLocked = false;

    if (!this.couponCode.trim()) {
      this.couponError = 'Please enter a code.';
      return;
    }

    // Check if user is logged in
    const user = this.auth.currentUser$.value;
    if (!user) {
      this.couponError = 'Please log in to use discount codes.';
      return;
    }

    const cartTotal = this.total;

    this.api.coupons
      .validate(
        this.couponCode.trim(),
        user.id,  // Now we're sure this is not null
        cartTotal,
        null,     // No need to pass email since user is logged in
      )
      .subscribe({
        next: res => {
          this.discount = res.discount;
          this.couponApplied = `Coupon "${res.code}" applied! You saved EGP ${res.discount}.`;
          this.couponLocked = true;
        },
        error: err => {
          this.discount = 0;
          this.couponError =
            err?.error?.error || 'Invalid or expired coupon.';
          this.couponLocked = true;
        },
      });
  }

  onShipping(info: ShippingInfo) {
    this.shippingInfo = info;
    /* Store shipping info in our service */
    this.checkoutService.saveShippingInfo(info);
  }

  placeOrder() {
    this.error = '';

    if (!this.shippingInfo || this.cartItems.length === 0) {
      this.error = 'Please fill in shipping details and add items to cart.';
      return;
    }

    const { name, address, city, phone, email } = this.shippingInfo;
    if (!name || !address || !city || !phone) {
      this.error = 'Please complete all required shipping fields.';
      return;
    }

    // ✅ Validate city selection if cities are available
    if (this.shippingCities.length > 0 && !this.selectedCity) {
      this.error = 'Please select a shipping city.';
      return;
    }

    this.loading = true;
    const user = this.auth.currentUser$.value;

    const dto = {
      user_id: user?.id ?? null,
      items: this.cartItems.map(i => ({
        product_id: i.product.id,
        quantity: i.qty,
        unit_price: i.product.price,
      })),
      shipping_name: name,
      shipping_email: email,
      shipping_address: address,
      shipping_city: city,
      shipping_phone: phone,
      delivery_fee: this.deliveryFee,
      coupon_code: this.couponCode.trim() || undefined,
      payment_method: this.paymentMethod
    };

    this.api.orders.create(dto).subscribe({
      next: (order: Order) => {
        setTimeout(() => {
          this.cart.clear();
          /* Clear shipping info after successful order */
          this.checkoutService.clearShippingInfo();
          /* Save payment method for order confirmation page */
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('last_payment_method', this.paymentMethod);
          }
          this.router.navigateByUrl(`/order-confirmation/${order.id}`);
        }, 300);
      },
      error: err => {
        this.error =
          err?.error?.error || 'Could not place order.';
        this.loading = false;
      },
    });
  }

  selectPaymentMethod(method: 'cod' | 'vodafone_cash' | 'instapay') {
    this.paymentMethod = method;
  }

  removeCoupon() {
    this.couponCode = '';
    this.couponApplied = '';
    this.couponLocked = false;
    this.discount = 0;
  }
}
