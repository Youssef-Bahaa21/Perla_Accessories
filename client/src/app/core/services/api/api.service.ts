import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import {
    User,
    AuthResult,
    Category,
    Product,
    Review,
    OrderItem,
    Order,
    Coupon,
    CreateCouponDTO,
    UpdateCouponDTO,
    CreateOrderDTO,
} from '../../models';

// ✅ Add ShippingCity interface
export interface ShippingCity {
    id: number;
    city_name: string;
    shipping_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly base = `${environment.api}/api`;

    constructor(private http: HttpClient) { }

    // ── SETTINGS ────────────────────────────────────────────
    settings = {
        /** Fetch current shipping fee */
        getShippingFee: (): Observable<{ shipping_fee: number }> =>
            this.http.get<{ shipping_fee: number }>(`${this.base}/settings/shipping-fee`),

        /** Update shipping fee (admin only) */
        updateShippingFee: (fee: number): Observable<{ shipping_fee: number }> =>
            this.http.put<{ shipping_fee: number }>(
                `${this.base}/settings/shipping-fee`,
                { shipping_fee: fee }
            ),

        // ✅ Shipping Cities Methods
        /** Get all shipping cities (admin) */
        getShippingCities: (): Observable<ShippingCity[]> =>
            this.http.get<ShippingCity[]>(`${this.base}/settings/shipping-cities`),

        /** Get active shipping cities (public) */
        getActiveShippingCities: (): Observable<ShippingCity[]> =>
            this.http.get<ShippingCity[]>(`${this.base}/settings/shipping-cities/active`),

        /** Get shipping city by ID */
        getShippingCityById: (id: number): Observable<ShippingCity> =>
            this.http.get<ShippingCity>(`${this.base}/settings/shipping-cities/${id}`),

        /** Create new shipping city (admin only) */
        createShippingCity: (cityName: string, shippingFee: number): Observable<ShippingCity> =>
            this.http.post<ShippingCity>(`${this.base}/settings/shipping-cities`, {
                city_name: cityName,
                shipping_fee: shippingFee
            }),

        /** Update shipping city (admin only) */
        updateShippingCity: (id: number, cityName: string, shippingFee: number, isActive: boolean = true): Observable<{ message: string }> =>
            this.http.put<{ message: string }>(`${this.base}/settings/shipping-cities/${id}`, {
                city_name: cityName,
                shipping_fee: shippingFee,
                is_active: isActive
            }),

        /** Delete shipping city (admin only) */
        deleteShippingCity: (id: number): Observable<{ message: string }> =>
            this.http.delete<{ message: string }>(`${this.base}/settings/shipping-cities/${id}`),

        /** Toggle shipping city status (admin only) */
        toggleShippingCityStatus: (id: number): Observable<{ message: string }> =>
            this.http.put<{ message: string }>(`${this.base}/settings/shipping-cities/${id}/toggle`, {})
    };

    // ── AUTH ───────────────────────────────────────────────
    auth = {
        register: (email: string, password: string): Observable<AuthResult> =>
            this.http.post<AuthResult>(`${this.base}/auth/register`, { email, password }),

        login: (email: string, password: string): Observable<AuthResult> =>
            this.http.post<AuthResult>(`${this.base}/auth/login`, { email, password }),

        /** Request password reset (sends email or console log in dev) */
        forgotPassword: (email: string): Observable<{ message: string }> =>
            this.http.post<{ message: string }>(`${this.base}/auth/forgot-password`, { email }),



        /** Confirm token + update password */
        /** Confirm token + update password */
        resetPassword: (token: string, password: string): Observable<{ message: string }> =>
            this.http.post<{ message: string }>(`${this.base}/auth/reset-password`, { token, password }),


    };



    getCsrfToken(): Observable<void> {
        return this.http.get<{ message: string }>(`${environment.api}/api/csrf-token`, {
            withCredentials: true,
        }).pipe(map(() => { }));
    }
    // ── USERS ──────────────────────────────────────────────
    users = {
        list: (): Observable<User[]> =>
            this.http.get<User[]>(`${this.base}/users`),

        get: (id: number): Observable<User> =>
            this.http.get<User>(`${this.base}/users/${id}`),

        update: (id: number, dto: Partial<Pick<User, 'email' | 'role'>>): Observable<void> =>
            this.http.put<void>(`${this.base}/users/${id}`, dto),

        delete: (id: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/users/${id}`),
    };

    // ── CATEGORIES ─────────────────────────────────────────
    categories = {
        list: (): Observable<Category[]> =>
            this.http.get<Category[]>(`${this.base}/categories`),

        get: (id: number): Observable<Category> =>
            this.http.get<Category>(`${this.base}/categories/${id}`),

        create: (dto: { name: string; description?: string }): Observable<Category> =>
            this.http.post<Category>(`${this.base}/categories`, dto),

        update: (id: number, dto: Partial<{ name: string; description: string }>): Observable<void> =>
            this.http.put<void>(`${this.base}/categories/${id}`, dto),

        delete: (id: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/categories/${id}`),

        uploadImage: (categoryId: number, image: File): Observable<{ success: boolean; category: Category }> => {
            console.log(`Uploading image to category ${categoryId}`);
            const formData = new FormData();
            console.log(`Adding image to form: ${image.name} (${image.size} bytes, ${image.type})`);
            formData.append('image', image, image.name);

            return this.http.post<{ success: boolean; category: Category }>(
                `${this.base}/categories/${categoryId}/image`,
                formData
            ).pipe(
                map(response => {
                    console.log('Upload response:', response);
                    return response;
                })
            );
        },

        deleteImage: (categoryId: number): Observable<{ message: string; category: Category }> =>
            this.http.delete<{ message: string; category: Category }>(`${this.base}/categories/${categoryId}/image`),
    };

    // ── PRODUCTS ───────────────────────────────────────────
    products = {
        uploadImage: (productId: number, images: File[]): Observable<{ success: boolean; images: any[] }> => {
            console.log(`Uploading ${images.length} images to product ${productId}`);
            const formData = new FormData();
            images.forEach(image => {
                console.log(`Adding image to form: ${image.name} (${image.size} bytes, ${image.type})`);
                formData.append('images', image, image.name);
            });

            return this.http.post<{ success: boolean; images: any[] }>(
                `${this.base}/products/${productId}/images`,
                formData
            ).pipe(
                map(response => {
                    console.log('Upload response:', response);
                    return response;
                })
            );
        },
        getImages: (productId: number): Observable<{ id: number; product_id: number; url: string }[]> =>
            this.http.get<{ id: number; product_id: number; url: string }[]>(`${this.base}/products/${productId}/images`),
        deleteImage: (productId: number, imageId: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/products/${productId}/images/${imageId}`),
        list: (): Observable<Product[]> =>
            this.http.get<Product[]>(`${this.base}/products`),
        get: (id: number): Observable<Product> =>
            this.http.get<Product>(`${this.base}/products/${id}`),
        create: (dto: {
            name: string;
            description: string;
            price: number;
            stock: number;
            category_id: number;
            is_new?: number;
            is_best_seller?: number;
            is_featured?: number;
        }): Observable<Product> =>
            this.http.post<Product>(`${this.base}/products`, dto, {
                headers: { 'Content-Type': 'application/json' }
            }),
        update: (id: number, dto: Partial<{
            name: string;
            description: string;
            price: number;
            stock: number;
            category_id: number;
            is_new: number;
            is_best_seller: number;
            is_featured: number;
        }>): Observable<void> =>
            this.http.put<void>(`${this.base}/products/${id}`, dto, {
                headers: { 'Content-Type': 'application/json' }
            }),
        delete: (id: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/products/${id}`),
    };


    // ── ORDERS ─────────────────────────────────────────────
    orders = {
        list: (): Observable<Order[]> =>
            this.http.get<Order[]>(`${this.base}/orders`),

        get: (id: number): Observable<Order> =>
            this.http.get<Order>(`${this.base}/orders/${id}`),

        create: (dto: CreateOrderDTO): Observable<Order> =>
            this.http.post<Order>(`${this.base}/orders`, dto, {
                headers: { 'Content-Type': 'application/json' }
            }),

        update: (id: number, dto: { status: string }): Observable<void> =>
            this.http.put<void>(`${this.base}/orders/${id}`, dto),

        delete: (id: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/orders/${id}`),
    };

    // ── COUPONS ────────────────────────────────────────────
    coupons = {
        list: (): Observable<Coupon[]> => this.http.get<Coupon[]>(`${this.base}/coupons`),
        get: (id: number): Observable<Coupon> => this.http.get<Coupon>(`${this.base}/coupons/${id}`),
        create: (dto: CreateCouponDTO): Observable<Coupon> => this.http.post<Coupon>(`${this.base}/coupons`, dto),
        update: (id: number, dto: UpdateCouponDTO): Observable<void> => this.http.put<void>(`${this.base}/coupons/${id}`, dto),
        delete: (id: number): Observable<void> => this.http.delete<void>(`${this.base}/coupons/${id}`),
        validate: (code: string, userId: number | null, cartTotal: number, email: string | null): Observable<{ code: string; discount: number }> =>
            this.http.post<{ code: string; discount: number }>(`${this.base}/coupons/validate`, { code, userId, cartTotal, email }),
        getUsage: (id: number): Observable<any[]> =>
            this.http.get<any[]>(`${this.base}/coupons/${id}/usage`),
    };



    // ── REVIEWS ────────────────────────────────────────────
    reviews = {
        list: (): Observable<Review[]> =>
            this.http.get<Review[]>(`${this.base}/reviews`),

        get: (id: number): Observable<Review> =>
            this.http.get<Review>(`${this.base}/reviews/${id}`),

        create: (dto: { product_id: number; user_id: number; rating: number; comment?: string; }): Observable<Review> =>
            this.http.post<Review>(`${this.base}/reviews`, dto),

        update: (id: number, dto: Partial<{ rating: number; comment: string }>): Observable<void> =>
            this.http.put<void>(`${this.base}/reviews/${id}`, dto),

        delete: (id: number): Observable<void> =>
            this.http.delete<void>(`${this.base}/reviews/${id}`),
    };
}