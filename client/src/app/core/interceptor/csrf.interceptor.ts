// src/app/core/interceptor/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CsrfService } from '../services/csrf.service';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const csrfService = inject(CsrfService);

    // Only attempt to add CSRF token in browser environment for state-changing methods
    if (isPlatformBrowser(platformId) && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase())) {
        const xsrfToken = csrfService.getCsrfToken();
        if (xsrfToken && xsrfToken !== 'mock-token') {
            req = req.clone({
                setHeaders: {
                    'X-XSRF-TOKEN': xsrfToken // Use the correct header name that Angular expects
                }
            });
        }
    }
    return next(req);
};
