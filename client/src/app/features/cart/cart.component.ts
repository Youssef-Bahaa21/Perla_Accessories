// src/app/features/cart/cart.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CartItem, CartService } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cart$: Observable<CartItem[]>;
  cartItems: CartItem[] = [];
  total = 0;
  isOpen$: Observable<boolean>;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    this.cart$ = this.cartService.cart$;
    this.isOpen$ = this.cartService.isCartModalOpen$;
  }

  ngOnInit(): void {
    this.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    });
  }

  get subTotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  }

  // ✅ Close modal methods
  closeCart(): void {
    this.cartService.closeCartModal();
  }

  // ✅ Handle backdrop click
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeCart();
    }
  }

  // ✅ Handle escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.closeCart();
  }

  remove(item: CartItem): void {
    this.cartService.remove(item.product.id);
  }

  updateQty(item: CartItem, change: number): void {
    const newQty = item.qty + change;
    if (newQty <= 0) {
      this.remove(item);
    } else {
      this.cartService.updateQuantity(item.product.id, newQty);
    }
  }

  clearCart(): void {
    this.cartService.clear();
  }

  checkout(): void {
    this.closeCart(); // Close modal first
    this.router.navigateByUrl('/shipping');
  }

  // ✅ View cart details method
  viewCartDetails(): void {
    this.closeCart(); // Close modal first
    this.router.navigateByUrl('/cart');
  }

  // ✅ Continue shopping method
  continueShopping(): void {
    this.closeCart();
    this.router.navigateByUrl('/products');
  }
}