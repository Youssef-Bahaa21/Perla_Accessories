import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { adminGuard } from './core/guards/admin/admin.guard';
import { guestGuard } from './core/guards/auth/guest.guard';

export const routes: Route[] = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },

    // Public routes
    {
        path: 'landing',
        title: 'Home - Perla Accessories | Beautiful Handcrafted Jewelry & Accessories',
        loadComponent: () =>
            import('./features/landing/landing.component')
                .then(m => m.LandingPageComponent),
    },
    {
        path: 'products',
        title: 'Shop All Products - Perla Accessories | Jewelry & Accessories',
        loadComponent: () =>
            import('./features/products/product-list/product-list.component')
                .then(m => m.ProductListComponent),
    },
    {
        path: 'products/:id',
        title: 'Product Details - Perla Accessories',
        loadComponent: () =>
            import('./features/products/product-detail/product-detail.component')
                .then(m => m.ProductDetailComponent),
    },

    {
        path: 'privacy-policy',
        title: 'Privacy Policy - Perla Accessories',
        loadComponent: () =>
            import('./features/privacy-policy/privacy-policy.component')
                .then(m => m.PrivacyPolicyComponent),
    },
    {
        path: 'terms',
        title: 'Terms of Service - Perla Accessories',
        loadComponent: () =>
            import('./features/terms-of-service/terms-of-service.component')
                .then(m => m.TermsOfServiceComponent),
    },
    {
        path: 'returns-policy',
        title: 'Returns Policy - Perla Accessories',
        loadComponent: () =>
            import('./features/returns-policy/returns-policy.component')
                .then(m => m.ReturnsPolicyComponent),
    },
    {
        path: 'about',
        title: 'About Us - Perla Accessories | Our Story',
        loadComponent: () =>
            import('./features/about/about.component')
                .then(m => m.AboutComponent),
    },

    {
        path: 'login',
        title: 'Sign In - Perla Accessories',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                m => m.LoginComponent
            ),
    },

    {
        path: 'forgot-password',
        title: 'Forgot Password - Perla Accessories',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/forgot-password/forgot-password.component')
                .then(m => m.ForgotPasswordComponent),
    },

    {
        path: 'reset-password',
        title: 'Reset Password - Perla Accessories',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/reset-password/reset-password.component')
                .then(m => m.ResetPasswordComponent),
    },
    {
        path: 'register',
        title: 'Sign Up - Perla Accessories',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/register/register.component').then(
                m => m.RegisterComponent
            ),
    },


    // Multi-step checkout flow
    {
        path: 'shipping',
        title: 'Shipping Details - Perla Accessories',
        loadComponent: () =>
            import('./features/shipping-details/shipping-details.component').then(
                m => m.ShippingDetailsComponent
            ),
    },
    {
        path: 'checkout',
        title: 'Checkout - Perla Accessories',
        loadComponent: () =>
            import('./features/checkout/checkout.component').then(
                m => m.CheckoutComponent
            ),
    },
    {
        path: 'cart',
        title: 'Shopping Cart - Perla Accessories',
        loadComponent: () =>
            import('./features/cart-detail/cart-detail.component').then(
                m => m.CartDetailComponent
            ),
    },

    {
        path: 'order-confirmation/:id',
        title: 'Order Confirmation - Perla Accessories',
        loadComponent: () =>
            import('./features/order-confirmation/order-confirmation.component')
                .then(m => m.OrderConfirmationComponent),
    },


    // Account & orders
    {
        path: 'account/orders',
        title: 'My Orders - Perla Accessories',
        canActivate: [authGuard],
        runGuardsAndResolvers: 'always', // <- important!
        loadComponent: () =>
            import('./features/account/orders/orders.component').then(m => m.OrdersComponent),
    }
    ,

    // Admin layout with children
    {
        path: 'admin',
        title: 'Admin Dashboard - Perla Accessories',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
            import(
                './features/admin/admin-layout/admin-layout.component'
            ).then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'products',
                title: 'Manage Products - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/product-form/product-form.component'
                    ).then(m => m.ProductFormComponent),
            },
            {
                path: 'categories',
                title: 'Manage Categories - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/category-management/category-management.component'
                    ).then(m => m.CategoryManagementComponent),
            },
            {
                path: 'settings',
                title: 'Settings - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/settings/settings/settings.component'
                    ).then(m => m.SettingsComponent),
            },

            {
                path: 'coupon',
                title: 'Manage Coupons - Admin - Perla Accessories',
                loadComponent: () =>
                    import('./features/admin/coupon-list/coupon-list.component')
                        .then(m => m.CouponListComponent),
            },
            {
                path: 'orders',
                title: 'Manage Orders - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/order-list/order-list.component'
                    ).then(m => m.OrderListComponent),
            },
            {
                path: 'reviews',
                title: 'Manage Reviews - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/review-management/review-management.component'
                    ).then(m => m.ReviewManagementComponent),
            },
            {
                path: 'users',
                title: 'Manage Users - Admin - Perla Accessories',
                loadComponent: () =>
                    import(
                        './features/admin/user-management/user-management.component'
                    ).then(m => m.UserManagementComponent),
            },
            { path: '', redirectTo: 'products', pathMatch: 'full' },
        ],
    },

    // Not Found page
    {
        path: '404',
        title: 'Page Not Found - Perla Accessories',
        loadComponent: () =>
            import('./features/not-found/not-found.component')
                .then(m => m.NotFoundComponent),
    },

    // Fallback - redirect to 404 page
    { path: '**', redirectTo: '404' },
];