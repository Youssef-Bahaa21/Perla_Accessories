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

        return this.http.get(`${environment.api}/api/csrf-token`, {
            withCredentials: true
        }).pipe(
            tap(() => {
                this.tokenInitialized = true;
                console.log('🔒 CSRF token initialized');
            }),
            catchError((error) => {
                console.warn('Failed to initialize CSRF token:', error);
                // Don't fail the app if CSRF token can't be fetched
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
} 