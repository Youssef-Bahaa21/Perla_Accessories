// src/app/features/orders/order-confirmation.component.ts
import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api/api.service';
import { Order } from '../../core/models';
import { CartService } from '../../core/services/cart/cart.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  deliveryFee: number = 0;
  loading = true;
  error = '';
  fallbackImage = 'assets/images/placeholder.jpg';
  isFromEmail = false;
  buyAgainMessage = '';

  // Payment method from local storage
  paymentMethod: string | null = null;

  // Payment details for instructions
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

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Get payment method from local storage
    if (isPlatformBrowser(this.platformId)) {
      this.paymentMethod = localStorage.getItem('last_payment_method');
    }

    // Check if user is coming from email link
    this.isFromEmail = this.route.snapshot.queryParams['from'] === 'email';

    const param = this.route.snapshot.paramMap.get('id');
    const id = Number(param);

    if (isNaN(id)) {
      this.error = 'Invalid order ID.';
      this.loading = false;
      return;
    }

    this.api.orders.get(id).subscribe({
      next: o => {
        this.order = o;
        this.deliveryFee = Number(o.delivery_fee) || 0;
        this.loading = false;
        if (!o.items || o.items.length === 0) {
          this.error = 'Order items could not be loaded.';
        }

        // If order has payment_method, use that instead
        if (o.payment_method) {
          this.paymentMethod = o.payment_method;
        }
      },
      error: () => {
        this.error = 'Could not load order details.';
        this.loading = false;
      },
    });
  }

  // Add all products from this order to cart and navigate to cart page
  async buyAgain() {
    if (!this.order || !this.order.items || this.order.items.length === 0) {
      this.buyAgainMessage = 'No items found to add to cart.';
      return;
    }

    // Clear the cart first
    this.cartService.clear();

    // Add each item to cart
    const itemsWithStock = this.order.items.filter(item => item.product_id);

    // Check if we have any valid items
    if (itemsWithStock.length === 0) {
      this.buyAgainMessage = 'No items found to add to cart.';
      return;
    }

    try {
      // Get all products in parallel
      const products = await Promise.all(
        itemsWithStock.map(item => firstValueFrom(this.api.products.get(item.product_id)))
      );

      // Filter out null products and add each to cart with the original quantity
      products
        .filter(product => product !== null)
        .forEach((product, index) => {
          if (product) {
            // Only add if product is in stock
            if (product.stock > 0) {
              // Get the original quantity or 1 if not available
              const originalQty = itemsWithStock[index].quantity || 1;
              // Limit to available stock
              const qtyToAdd = Math.min(originalQty, product.stock);

              // Add product to cart first
              this.cartService.add(product);

              // Then update quantity if needed (more than 1)
              if (qtyToAdd > 1) {
                this.cartService.updateQuantity(product.id, qtyToAdd);
              }
            }
          }
        });

      // Navigate to cart
      this.router.navigate(['/cart']);
    } catch (error) {
      this.buyAgainMessage = 'Failed to add products to cart. Some items might be unavailable.';
    }
  }

  // Handle broken image URLs
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.fallbackImage) {
      img.src = this.fallbackImage;
    }
  }

  get discountAmount(): number {
    if (!this.order || !this.order.items || this.order.items.length === 0) return 0;

    const subtotal = this.order.items.reduce(
      (sum, i) => sum + (i.unit_price * i.quantity),
      0
    );

    // Discount = subtotal - actual paid (excluding delivery)
    const discount = subtotal - this.order.total;

    return Number((discount > 0 ? discount : 0).toFixed(2));
  }

  get subtotal(): number {
    if (!this.order || !this.order.items || this.order.items.length === 0) return 0;

    return this.order.items.reduce(
      (sum, i) => sum + (i.unit_price * i.quantity),
      0
    );
  }

  get grandTotal(): number {
    if (!this.order || !this.order.items || this.order.items.length === 0) return 0;

    const subtotal = this.order.items.reduce(
      (sum, i) => sum + (i.unit_price * i.quantity),
      0
    );
    let total = subtotal;
    const delivery = Number(this.order.delivery_fee) || 0;

    if (this.order.coupon_code && this.discountAmount > 0) {
      total = subtotal - this.discountAmount;
    }

    return Number((total + delivery).toFixed(2));
  }
}
