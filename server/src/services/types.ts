// server/src/services/types.ts

// Coupon creation and update
export interface CreateCouponDTO {
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    min_order_amt: number;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit: number;
    is_active?: number;
}

export type UpdateCouponDTO = Partial<CreateCouponDTO>;

// Result of coupon validation
export interface ValidateCouponResult {
    valid: boolean;
    discount?: number;
    message?: string;
    coupon?: {
        id: number;
        code: string;
        type: 'fixed' | 'percent';
        value: number;
        min_order_amt: number;
        expires_at?: string | null;
        usage_limit?: number | null;
        per_user_limit: number;
    };
}

// User creation and update
export interface CreateUserDTO {
    email: string;
    password: string;
    role?: 'customer' | 'admin';
}

export interface UpdateUserDTO {
    email?: string;
    password?: string;
    role?: 'customer' | 'admin';
}
