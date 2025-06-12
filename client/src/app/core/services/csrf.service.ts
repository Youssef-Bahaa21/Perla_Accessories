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
            tap((response) => {
                this.tokenInitialized = true;
                console.log('🔒 CSRF token response:', response.body);

                // Check if cookie was set
                const token = this.getCsrfToken();
                if (token) {
                    console.log('✅ CSRF token found in cookie:', token);
                } else {
                    console.warn('⚠️ CSRF token not found in cookie after initialization');
                    console.log('🍪 All cookies:', document.cookie);
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
        console.log('🔍 CSRF Debug Status:');
        console.log('- Token initialized:', this.tokenInitialized);
        console.log('- Current token:', this.getCsrfToken());
        console.log('- CSRF enabled:', this.isCsrfEnabled());
        console.log('- All cookies:', document.cookie);
    }
} 