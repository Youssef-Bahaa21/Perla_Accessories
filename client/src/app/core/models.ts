/** A user of the system */
export interface User {
    id: number;
    email: string;
    role: 'customer' | 'admin';
}

/** The result of an auth call */
export interface AuthResult {
    user: User;
    token: string;
}

/** A product category */
export interface Category {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    image?: string;
    public_id?: string;
}

/** A product image */
export interface ProductImage {
    id: number;
    url: string;
}

/** A product for sale */
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id: number;
    created_at: string;
    is_new: number;
    is_featured: number;
    is_best_seller: number;
    images?: { id: number; image?: string; url: string }[];
}

/** A review left by a user on a product */
export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment?: string;
    created_at: string;
}

/** One line-item in an order */
export interface OrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    product_name?: string;
    product_image?: string;
}

/** Shipping information collected at checkout */
export interface ShippingInfo {
    name: string;
    email: string;
    address: string;
    city: string;
    phone: string;
}

/** A coupon for discounts */
export interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    min_order_amt: number;
    expires_at: string | null;
    usage_limit: number | null;
    per_user_limit: number;
    is_active: number; // <-- ✅ Add this
    created_at: string;
}


/** DTO for creating a coupon */
export interface CreateCouponDTO {
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    min_order_amt?: number;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit?: number;
    is_active?: number; // <-- ✅ Add this
}


/** DTO for updating a coupon */
export interface UpdateCouponDTO extends Partial<CreateCouponDTO> { }

/** DTO for creating an order */
export interface CreateOrderDTO {
    user_id: number | null;
    items: OrderItem[];
    coupon_code?: string;
    shipping_name: string;
    shipping_email: string;
    delivery_fee: number;
    shipping_address: string;
    shipping_city: string;
    shipping_phone: string;
    payment_method?: 'cod' | 'vodafone_cash' | 'instapay';
}

/** A customer order */
export interface Order {
    id: number;
    user_id: number | null;
    status: string;
    total: number;
    shipping_name: string;
    shipping_email: string | null;
    shipping_address: string;
    shipping_city: string;
    shipping_phone: string;
    delivery_fee: number;
    coupon_code?: string;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    archived?: boolean;
    payment_method?: string;
    payment_status?: string;
}