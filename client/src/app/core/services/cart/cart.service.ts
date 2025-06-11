import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models';
import { NotificationService } from '../notification.service';

export interface CartItem {
    product: Product;
    qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly storageKey = 'cart';
    private items$ = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
    readonly cart$ = this.items$.asObservable();

    private cartModalOpen$ = new BehaviorSubject<boolean>(false);
    readonly isCartModalOpen$ = this.cartModalOpen$.asObservable();

    private notify = inject(NotificationService); // ✅ Inject NotificationService

    private saveToStorage(items: CartItem[]) {
        if (typeof window === 'undefined') return; // SSR-safe
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }

    private loadFromStorage(): CartItem[] {
        if (typeof window === 'undefined') return []; // SSR-safe
        const raw = localStorage.getItem(this.storageKey);
        try {
            const items = raw ? JSON.parse(raw) : [];
            return items.filter((item: any) =>
                item &&
                item.product &&
                typeof item.product.id === 'number' &&
                typeof item.qty === 'number'
            );
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            return [];
        }
    }

    getItems(): CartItem[] {
        return this.items$.value;
    }

    getItemCount(): number {
        return this.items$.value.reduce((count, item) => count + item.qty, 0);
    }

    getTotal(): number {
        return this.items$.value.reduce((total, item) =>
            total + (item.product.price || 0) * item.qty, 0
        );
    }

    add(product: Product) {
        const items = [...this.items$.value];
        const found = items.find(i => i.product.id === product.id);
        if (found) {
            found.qty++;
        } else {
            items.push({ product, qty: 1 });
        }
        this.items$.next(items);
        this.saveToStorage(items);

        this.notify.show(`${product.name} added to cart`); // ✅ Show success

        // ✅ Auto-open cart modal when item is added
        this.openCartModal();
    }

    updateQuantity(productId: number, qty: number) {
        const items = [...this.items$.value];
        const index = items.findIndex(i => i.product.id === productId);
        if (index !== -1) {
            if (qty <= 0) {
                items.splice(index, 1);
            } else {
                items[index].qty = qty;
            }
            this.items$.next(items);
            this.saveToStorage(items);

        }
    }

    remove(productId: number) {
        const updated = this.items$.value.filter(i => i.product.id !== productId);
        this.items$.next(updated);
        this.saveToStorage(updated);

        this.notify.show(`Item removed from cart`); // ✅ Notify
    }

    clear() {
        this.items$.next([]);
        localStorage.removeItem(this.storageKey);

        this.notify.show(`Cart cleared`); // ✅ Notify
    }

    openCartModal(): void {
        this.cartModalOpen$.next(true);
    }

    closeCartModal(): void {
        this.cartModalOpen$.next(false);
    }

    toggleCartModal(): void {
        this.cartModalOpen$.next(!this.cartModalOpen$.value);
    }

    isCartModalOpen(): boolean {
        return this.cartModalOpen$.value;
    }
}