import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { adminGuard } from './core/guards/admin/admin.guard';
import { guestGuard } from './core/guards/auth/guest.guard';

export const routes: Route[] = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },

    // Public routes
    {
        path: 'landing',
        loadComponent: () =>
            import('./features/landing/landing.component')
                .then(m => m.LandingPageComponent),
    },
    {
        path: 'products',
        loadComponent: () =>
            import('./features/products/product-list/product-list.component')
                .then(m => m.ProductListComponent),
    },
    {
        path: 'products/:id',
        loadComponent: () =>
            import('./features/products/product-detail/product-detail.component')
                .then(m => m.ProductDetailComponent),
    },

    {
        path: 'privacy-policy',
        loadComponent: () =>
            import('./features/privacy-policy/privacy-policy.component')
                .then(m => m.PrivacyPolicyComponent),
    },
    {
        path: 'terms',
        loadComponent: () =>
            import('./features/terms-of-service/terms-of-service.component')
                .then(m => m.TermsOfServiceComponent),
    },
    {
        path: 'returns-policy',
        loadComponent: () =>
            import('./features/returns-policy/returns-policy.component')
                .then(m => m.ReturnsPolicyComponent),
    },
    {
        path: 'about',
        loadComponent: () =>
            import('./features/about/about.component')
                .then(m => m.AboutComponent),
    },

    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                m => m.LoginComponent
            ),
    },

    {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/forgot-password/forgot-password.component')
                .then(m => m.ForgotPasswordComponent),
    },

    {
        path: 'reset-password',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/reset-password/reset-password.component')
                .then(m => m.ResetPasswordComponent),
    },
    {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/register/register.component').then(
                m => m.RegisterComponent
            ),
    },


    // Multi-step checkout flow
    {
        path: 'shipping',
        loadComponent: () =>
            import('./features/shipping-details/shipping-details.component').then(
                m => m.ShippingDetailsComponent
            ),
    },
    {
        path: 'checkout',
        loadComponent: () =>
            import('./features/checkout/checkout.component').then(
                m => m.CheckoutComponent
            ),
    },
    {
        path: 'cart',
        loadComponent: () =>
            import('./features/cart-detail/cart-detail.component').then(
                m => m.CartDetailComponent
            ),
    },

    {
        path: 'order-confirmation/:id',
        loadComponent: () =>
            import('./features/order-confirmation/order-confirmation.component')
                .then(m => m.OrderConfirmationComponent),
    },


    // Account & orders
    {
        path: 'account/orders',
        canActivate: [authGuard],
        runGuardsAndResolvers: 'always', // <- important!
        loadComponent: () =>
            import('./features/account/orders/orders.component').then(m => m.OrdersComponent),
    }
    ,

    // Admin layout with children
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
            import(
                './features/admin/admin-layout/admin-layout.component'
            ).then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'products',
                loadComponent: () =>
                    import(
                        './features/admin/product-form/product-form.component'
                    ).then(m => m.ProductFormComponent),
            },
            {
                path: 'categories',
                loadComponent: () =>
                    import(
                        './features/admin/category-management/category-management.component'
                    ).then(m => m.CategoryManagementComponent),
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import(
                        './features/admin/settings/settings/settings.component'
                    ).then(m => m.SettingsComponent),
            },

            {
                path: 'coupon',
                loadComponent: () =>
                    import('./features/admin/coupon-list/coupon-list.component')
                        .then(m => m.CouponListComponent),
            },
            {
                path: 'orders',
                loadComponent: () =>
                    import(
                        './features/admin/order-list/order-list.component'
                    ).then(m => m.OrderListComponent),
            },
            { path: '', redirectTo: 'products', pathMatch: 'full' },
        ],
    },

    // Fallback
    { path: '**', redirectTo: 'products' },
];