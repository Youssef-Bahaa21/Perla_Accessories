// src/app/core/interceptor/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CsrfService } from '../services/csrf.service';
import { environment as env } from '../../../environments/environment';

/**
 * Enhanced CSRF Interceptor that adds protection against Cross-Site Request Forgery attacks
 * by adding a CSRF token to all state-changing requests.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const csrfService = inject(CsrfService);

    // Only apply CSRF protection in browser environment
    if (!isPlatformBrowser(platformId)) {
        return next(req);
    }

    // Get the request domain to check if it's an API request
    const apiDomain = new URL(env.api).hostname;
    const reqUrl = new URL(req.url, window.location.origin);

    // Only add CSRF token for API requests and state-changing methods
    const isApiRequest = reqUrl.hostname === apiDomain || req.url.includes('/api/');
    const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());

    // Skip CSRF for login and other auth endpoints where the user might not have a token yet
    const isAuthEndpoint = req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/register') ||
        req.url.includes('/api/auth/forgot-password');

    if (isApiRequest && isStateChangingMethod && !isAuthEndpoint) {
        const xsrfToken = csrfService.getCsrfToken();

        if (!xsrfToken || xsrfToken === 'mock-token') {
            // If no valid CSRF token exists, try to fetch it first
            console.warn('No valid CSRF token found! Attempting to initialize...');
            csrfService.initializeCsrfToken().subscribe();
        } else {
            // Clone the request with the CSRF token
            return next(req.clone({
                setHeaders: {
                    'X-XSRF-TOKEN': xsrfToken
                }
            }));
        }
    }

    return next(req);
};
