import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Order } from '../../../core/models';
import { ApiService } from '../../../core/services/api/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';
  fallbackImage = 'assets/images/placeholder.jpg';
  baseUrl = environment.api;

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
  private auth = inject(AuthService);

  ngOnInit() {
    const user = this.auth.currentUser$.value;

    if (!user) {
      this.error = 'Not authenticated';
      this.loading = false;
      return;
    }

    /* If your back‑end already has /api/orders/my, call that instead
       and remove the filter step below. */
    this.api.orders.list().subscribe({
      next: all => {
        this.orders = all.filter(o => o.user_id === user.id).map(order => ({
          ...order,
          items: order.items?.map(item => ({
            ...item,
            product_image: this.getProductImageUrl(item.product_image)
          })) || []
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load your orders.';
        this.loading = false;
      },
    });
  }

  getDeliveryFee(o: Order): number {
    return Number(o.delivery_fee ?? 0);
  }

  getDiscount(o: Order): number {
    const items = o.items ?? [];
    const subtotal = items.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0,
    );
    return Number((subtotal - o.total).toFixed(2));
  }

  getGrandTotal(o: Order): number {
    const total = Number(o.total) || 0;
    const delivery = this.getDeliveryFee(o);
    return Number((total + delivery).toFixed(2));
  }

  getProductImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return this.fallbackImage;
    }

    // Check if the image URL is already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Handle legacy local file paths
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/uploads/')) {
      cleanPath = cleanPath.replace('/uploads/', '');
    } else if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }

    return cleanPath ? `${this.baseUrl}uploads/${cleanPath}` : this.fallbackImage;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.fallbackImage;
  }
}
