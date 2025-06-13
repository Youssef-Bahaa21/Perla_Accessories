import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CartItem, CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { ApiService } from '../../core/services/api/api.service';
import { ConfirmationModalService } from '../../core/services/confirmation-modal.service';

@Component({
    selector: 'app-cart-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './cart-detail.component.html',
})
export class CartDetailComponent implements OnInit {
    cartItems: CartItem[] = [];
    total = 0;
    relatedProducts: Product[] = [];
    cartMessage = '';
    showClearConfirmation = false;

    private cart = inject(CartService);
    private productSvc = inject(ProductService);
    private api = inject(ApiService);
    private confirmationModal = inject(ConfirmationModalService);

    ngOnInit() {
        this.cart.cart$.subscribe(items => {
            this.cartItems = items;
            this.total = this.cart.getTotal();

            // Load related products when cart changes
            if (items.length > 0) {
                this.loadRelatedProducts();
            }
        });
    }

    updateQuantity(productId: number, quantity: number) {
        if (quantity < 1) {
            this.removeItem(productId);
            return;
        }
        this.cart.updateQuantity(productId, quantity);
    }

    removeItem(productId: number) {
        this.cart.remove(productId);
    }

    clearCart() {
        this.cart.clear();
        this.showClearConfirmation = false;
    }

    async confirmClearCart() {
        const confirmed = await this.confirmationModal.confirm({
            title: 'Clear Shopping Cart',
            message: 'Are you sure you want to remove all items from your cart? This action cannot be undone.',
            confirmText: 'Clear Cart',
            cancelText: 'Keep Items',
            type: 'warning',
            icon: 'fa-solid fa-shopping-cart'
        });

        if (confirmed) {
            this.clearCart();
        }
    }

    trackByItemId(index: number, item: CartItem): number {
        return item.product.id;
    }

    getItemTotal(item: CartItem): number {
        return item.product.price * item.qty;
    }

    get itemCount(): number {
        return this.cart.getItemCount();
    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
    }

    isMobileDevice(): boolean {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768;
    }

    onQuantityChange(event: Event, productId: number) {
        const target = event.target as HTMLInputElement;
        const quantity = parseInt(target.value, 10);
        if (!isNaN(quantity) && quantity > 0) {
            this.updateQuantity(productId, quantity);
        }
    }

    private loadRelatedProducts() {
        // Get unique category IDs from cart items
        const categoryIds = [...new Set(this.cartItems.map(item => item.product.category_id))];
        const cartProductIds = this.cartItems.map(item => item.product.id);

        this.productSvc.getProducts<Product>(1, 50).subscribe({
            next: resp => {
                // Find products in the same categories as cart items, excluding cart items
                let relatedProducts = resp.data.filter(p =>
                    categoryIds.includes(p.category_id) && !cartProductIds.includes(p.id)
                );

                // If we don't have enough products, add random products
                if (relatedProducts.length < 3) {
                    const otherProducts = resp.data
                        .filter(p => !cartProductIds.includes(p.id) && !relatedProducts.includes(p))
                        .slice(0, 3 - relatedProducts.length);
                    relatedProducts = [...relatedProducts, ...otherProducts];
                }

                this.relatedProducts = relatedProducts.slice(0, 3);
            },
            error: () => { }
        });
    }

    addRelatedProductToCart(product: Product) {
        if (product && product.stock && product.stock > 0) {
            this.cart.add(product);
            this.cartMessage = `Added ${product.name} to your cart`;
            setTimeout(() => (this.cartMessage = ''), 3000);
        }
    }
} 