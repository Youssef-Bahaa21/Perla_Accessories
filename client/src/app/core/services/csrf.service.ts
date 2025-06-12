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

    /**
     * Initialize CSRF token by fetching it from the server
     */
    initializeCsrfToken(): Observable<any> {
        if (this.tokenInitialized) {
            return of(null);
        }

        console.log('🔒 Initializing CSRF token from:', `${environment.api}/api/csrf-token`);

        return this.http.get(`${environment.api}/api/csrf-token`, {
            withCredentials: true,
            observe: 'response'
        }).pipe(
            tap((response: any) => {
                this.tokenInitialized = true;
                const responseBody = response.body;
                console.log('🔒 CSRF token response:', responseBody);

                // Wait a moment for cookie to be set, then check
                setTimeout(() => {
                    const token = this.getCsrfToken();
                    if (token) {
                        console.log('✅ CSRF token found in cookie:', token);
                    } else {
                        console.error('❌ CSRF token not found in cookie - check CORS and cookie settings');
                        console.log('🔧 Response headers should include Set-Cookie with SameSite=None; Secure');
                    }
                }, 100);
            }),
            catchError((error) => {
                console.error('❌ Failed to initialize CSRF token:', error);
                return of(null);
            })
        );
    }

    /**
     * Get CSRF token from cookie (ONLY secure method)
     */
    getCsrfToken(): string | null {
        if (typeof document === 'undefined') {
            return null;
        }

        const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
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
        const token = this.getCsrfToken();

        console.log('🔍 CSRF Debug Status:');
        console.log('- Token initialized:', this.tokenInitialized);
        console.log('- Current token:', token || 'null');
        console.log('- CSRF enabled:', this.isCsrfEnabled());
        console.log('- All cookies:', document.cookie || 'empty');

        if (!token) {
            console.log('🔧 Troubleshooting:');
            console.log('  1. Check if server sends Set-Cookie header');
            console.log('  2. Verify SameSite=None; Secure in production');
            console.log('  3. Ensure CORS allows credentials');
            console.log('  4. Check browser blocks third-party cookies');
        }
    }
} 