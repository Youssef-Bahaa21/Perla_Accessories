import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from, throwError, lastValueFrom } from 'rxjs';
import { catchError, tap, retry, shareReplay, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CsrfService {
    private http = inject(HttpClient);
    private tokenInitialized = false;
    private tokenInitPromise: Promise<any> | null = null;
    private readonly TOKEN_COOKIE_NAME = 'XSRF-TOKEN';
    private readonly TOKEN_REQUEST_TIMEOUT = 5000; // 5 seconds
    private readonly MAX_RETRY_ATTEMPTS = 3;

    /**
     * Initialize CSRF token by fetching it from the server
     * Enhanced with retry logic, timeout, and caching
     */
    initializeCsrfToken(): Observable<any> {
        if (this.tokenInitialized) {
            return of(null);
        }

        // Check if token already exists in cookies
        const existingToken = this.getCsrfToken();
        if (existingToken && existingToken !== 'mock-token') {
            this.tokenInitialized = true;
            return of({ token: existingToken });
        }

        console.log('🔒 Initializing CSRF token from:', `${environment.api}/api/csrf-token`);

        // Use Promise to ensure we only make one request even if called multiple times
        if (!this.tokenInitPromise) {
            const request$ = this.http.get(`${environment.api}/api/csrf-token`, {
                withCredentials: true,
                observe: 'response'
            }).pipe(
                timeout(this.TOKEN_REQUEST_TIMEOUT),
                retry({ count: this.MAX_RETRY_ATTEMPTS, delay: 1000 }),
                tap((response: any) => {
                    this.tokenInitialized = true;
                    const responseBody = response.body;
                    console.log('🔒 CSRF token response:', responseBody);

                    // Wait a moment for cookie to be set, then check
                    setTimeout(() => {
                        const token = this.getCsrfToken();
                        if (token) {
                            console.log('✅ CSRF token found in cookie');
                        } else {
                            console.error('❌ CSRF token not found in cookie - check CORS and cookie settings');
                            console.log('🔧 Response headers should include Set-Cookie with SameSite=None; Secure');
                        }
                    }, 100);
                }),
                catchError((error) => {
                    console.error('❌ Failed to initialize CSRF token:', error);
                    this.tokenInitPromise = null; // Allow retry on future calls
                    return throwError(() => new Error('CSRF token initialization failed'));
                }),
                // Cache the result
                shareReplay(1)
            );

            // Use lastValueFrom instead of deprecated toPromise()
            this.tokenInitPromise = lastValueFrom(request$);
        }

        return from(this.tokenInitPromise || Promise.resolve(null));
    }

    /**
     * Get CSRF token from cookie with enhanced security checks
     */
    getCsrfToken(): string | null {
        if (typeof document === 'undefined') {
            return null;
        }

        // More robust cookie parsing with validation
        const match = document.cookie.match(new RegExp(`(^|;)\\s*${this.TOKEN_COOKIE_NAME}=([^;]+)`));
        const token = match ? decodeURIComponent(match[2]) : null;

        // Validate token format (basic check)
        if (token && !/^[a-zA-Z0-9\-_]+$/.test(token) && token !== 'mock-token') {
            console.warn('Invalid CSRF token format detected');
            return null;
        }

        return token;
    }

    /**
     * Check if CSRF protection is enabled (token exists and is not mock)
     */
    isCsrfEnabled(): boolean {
        const token = this.getCsrfToken();
        return token !== null && token !== 'mock-token';
    }

    /**
     * Reset the CSRF token state and force a new token fetch
     * Used when token might be invalid or expired
     */
    resetCsrfToken(): Observable<any> {
        this.tokenInitialized = false;
        this.tokenInitPromise = null;
        return this.initializeCsrfToken();
    }

    /**
     * Debug method to log current CSRF status
     */
    debugCsrfStatus(): void {
        const token = this.getCsrfToken();

        console.log('🔍 CSRF Debug Status:');
        console.log('- Token initialized:', this.tokenInitialized);
        console.log('- Current token:', token ? `${token.substring(0, 4)}...` : 'null');
        console.log('- CSRF enabled:', this.isCsrfEnabled());

        if (!token) {
            console.log('🔧 Troubleshooting:');
            console.log('  1. Check if server sends Set-Cookie header');
            console.log('  2. Verify SameSite=None; Secure in production');
            console.log('  3. Ensure CORS allows credentials');
            console.log('  4. Check browser blocks third-party cookies');
        }
    }
} 