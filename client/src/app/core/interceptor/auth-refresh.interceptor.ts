import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../../environments/environment';

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;

/**
 * Interceptor that handles token refresh on 401 errors.
 * This prevents automatic logout on page refresh if access token expires.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const http = inject(HttpClient);
    const platformId = inject(PLATFORM_ID);

    // Skip refresh attempts for these endpoints to prevent infinite loops
    const skipUrls = [
        '/api/auth/refresh',
        '/api/auth/logout',
        '/api/auth/login',
        '/api/auth/register'
    ];

    // Skip token refresh on server-side rendering or for auth endpoints
    if (!isPlatformBrowser(platformId) || skipUrls.some(url => req.url.includes(url))) {
        return next(req);
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only attempt refresh on 401 errors, in browser environment, 
            // when we're not already refreshing, and when it's not the /me endpoint initially failing
            if (error.status === 401 &&
                isPlatformBrowser(platformId) &&
                !isRefreshing &&
                !req.url.includes('/api/auth/me')) {

                isRefreshing = true;
                console.log('Token expired. Attempting refresh...');

                // Attempt to refresh the token
                return http.post<{ message: string }>(`${env.api}/api/auth/refresh`, {}, { withCredentials: true }).pipe(
                    switchMap(() => {
                        console.log('Token refreshed successfully');
                        isRefreshing = false;
                        // Retry the original request with the new token (in cookies)
                        return next(req);
                    }),
                    catchError((refreshError) => {
                        console.log('Token refresh failed', refreshError);
                        isRefreshing = false;
                        // If refresh fails, pass through the original error
                        return throwError(() => error);
                    })
                );
            }

            // For other errors, just pass them through
            return throwError(() => error);
        })
    );
}; 