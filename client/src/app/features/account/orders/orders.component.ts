import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Order } from '../../../core/models';
import { ApiService } from '../../../core/services/api/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  private router = inject(Router);

  ngOnInit() {
    // Check authentication state
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.loadOrders(user.id);
      } else {
        // User is not logged in, redirect to login
        this.error = 'Please log in to view your orders';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/account/orders' }
          });
        }, 2000);
      }
    });
  }

  private loadOrders(userId: number) {
    this.api.orders.list().subscribe({
      next: all => {
        this.orders = all.filter(o => o.user_id === userId).map(order => ({
          ...order,
          items: order.items?.map(item => ({
            ...item,
            product_image: this.getProductImageUrl(item.product_image)
          })) || []
        }));
        this.loading = false;

        if (this.orders.length === 0) {
          this.error = 'You have no orders yet. Start shopping to see your orders here!';
        }
      },
      error: (err) => {
        console.error('Error loading orders:', err);

        if (err.status === 401) {
          this.error = 'Session expired. Please log in again.';
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: '/account/orders' }
            });
          }, 2000);
        } else {
          this.error = 'Could not load your orders. Please try again later.';
        }
        this.loading = false;
      },
    });
  }

  private getProductImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return this.fallbackImage;

    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Handle relative paths
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/uploads/')) {
      cleanPath = cleanPath.replace('/uploads/', '');
    } else if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }

    return cleanPath ? `${this.baseUrl}/uploads/${cleanPath}` : this.fallbackImage;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  // Retry loading orders
  retryLoadOrders() {
    this.loading = true;
    this.error = '';

    const user = this.auth.currentUser$.value;
    if (user) {
      this.loadOrders(user.id);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/account/orders' }
      });
    }
  }

  // Navigate to shop
  goToShop() {
    this.router.navigate(['/products']);
  }

  // Navigate to login
  goToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/account/orders' }
    });
  }

  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Order Received',
      'paid': 'Payment Confirmed',
      'shipped': 'Shipped',
      'completed': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
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
}
