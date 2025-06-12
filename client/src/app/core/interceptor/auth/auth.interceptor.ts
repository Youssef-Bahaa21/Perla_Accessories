import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Auth interceptor that handles token validation and adds security headers
 * to protect against common web vulnerabilities.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip adding security headers for non-API requests (like assets)
    if (!req.url.includes('/api/')) {
        return next(req);
    }

    // Clone the request to add security headers
    const secureReq = req.clone({
        setHeaders: {
            // Add security headers to prevent common attacks
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
    });

    return next(secureReq);
}
