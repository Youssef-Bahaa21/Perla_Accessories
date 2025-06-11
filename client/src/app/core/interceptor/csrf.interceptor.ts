// src/app/core/interceptor/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    // Only attempt to add CSRF token in browser environment
    if (isPlatformBrowser(platformId) && ['POST', 'PUT', 'DELETE'].includes(req.method.toUpperCase())) {
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (xsrfToken) {
            req = req.clone({
                setHeaders: {
                    'X-CSRF-Token': xsrfToken
                }
            });
        }
    }
    return next(req);
};

function getCookie(name: string): string | null {
    // Check if document is available (browser environment)
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
