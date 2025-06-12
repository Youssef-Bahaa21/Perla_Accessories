import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CsrfService {
    private http = inject(HttpClient);
    private tokenInitialized = false;
    private readonly CSRF_TOKEN_KEY = 'csrf-token';

    /**
     * Initialize CSRF token by fetching it from the server
     * This should be called when the app starts
     */
    initializeCsrfToken(): Observable<any> {
        if (this.tokenInitialized) {
            return of(null);
        }

        console.log('🔒 Initializing CSRF token from:', `${environment.api}/api/csrf-token`);

        return this.http.get(`${environment.api}/api/csrf-token`, {
            withCredentials: true,
            observe: 'response' // Get full response including headers
        }).pipe(
            tap((response: any) => {
                this.tokenInitialized = true;
                const responseBody = response.body;
                console.log('🔒 CSRF token response:', responseBody);

                // Check if cookie was set
                let token = this.getCsrfTokenFromCookie();

                if (token) {
                    console.log('✅ CSRF token found in cookie:', token);
                } else {
                    // Cookie not set due to cross-origin, use localStorage fallback
                    console.warn('⚠️ CSRF token not found in cookie, using localStorage fallback');
                    if (responseBody && responseBody.token) {
                        this.setCsrfTokenInStorage(responseBody.token);
                        console.log('✅ CSRF token stored in localStorage:', responseBody.token);
                    }
                }
            }),
            catchError((error) => {
                console.error('❌ Failed to initialize CSRF token:', error);
                return of(null);
            })
        );
    }

    /**
     * Get CSRF token from cookie
     */
    private getCsrfTokenFromCookie(): string | null {
        if (typeof document === 'undefined') {
            return null;
        }

        const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    /**
     * Get CSRF token from localStorage
     */
    private getCsrfTokenFromStorage(): string | null {
        if (typeof localStorage === 'undefined') {
            return null;
        }

        return localStorage.getItem(this.CSRF_TOKEN_KEY);
    }

    /**
     * Set CSRF token in localStorage
     */
    private setCsrfTokenInStorage(token: string): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.CSRF_TOKEN_KEY, token);
        }
    }

    /**
     * Get CSRF token (try cookie first, then localStorage)
     */
    getCsrfToken(): string | null {
        // Try cookie first
        let token = this.getCsrfTokenFromCookie();

        // Fallback to localStorage
        if (!token) {
            token = this.getCsrfTokenFromStorage();
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
     * Debug method to log current CSRF status
     */
    debugCsrfStatus(): void {
        const cookieToken = this.getCsrfTokenFromCookie();
        const storageToken = this.getCsrfTokenFromStorage();
        const finalToken = this.getCsrfToken();

        console.log('🔍 CSRF Debug Status:');
        console.log('- Token initialized:', this.tokenInitialized);
        console.log('- Cookie token:', cookieToken || 'null');
        console.log('- Storage token:', storageToken || 'null');
        console.log('- Final token:', finalToken || 'null');
        console.log('- CSRF enabled:', this.isCsrfEnabled());
        console.log('- All cookies:', document.cookie || 'empty');
    }
} 