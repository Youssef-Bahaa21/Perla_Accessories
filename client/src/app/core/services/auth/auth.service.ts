import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of, catchError, retry, delay } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

import { User, AuthResult } from '../../models';

// Re-export types for convenience
export type { User, AuthResult } from '../../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser$ = new BehaviorSubject<User | null>(null);
  private platformId = inject(PLATFORM_ID);
  private lastInitAttempt = 0;
  private initializationInProgress = false;

  constructor(private http: HttpClient) {
    // Initialize authentication state on service creation
    // But only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.initialise();
    }
  }

  /* ----------  private helper ---------- */
  private handleAuth(
    req$: Observable<{ user: User }>,
  ): Observable<{ user: User }> {
    return req$.pipe(
      tap(({ user }) => this.currentUser$.next(user)),
    );
  }

  private initialise() {
    if (this.initializationInProgress) return;
    if (Date.now() - this.lastInitAttempt < 1000) return;

    this.initializationInProgress = true;
    this.lastInitAttempt = Date.now();

    this.getMe().pipe(
      retry(2),
      catchError(err => {
        console.log('Failed to initialize auth state:', err);
        return of(null);
      })
    ).subscribe({
      next: user => {
        this.currentUser$.next(user);
      },
      complete: () => {
        this.initializationInProgress = false;
      }
    });
  }

  getMe(): Observable<User | null> {
    return this.http.get<User | null>(`${env.api}/api/auth/me`).pipe(
      map(user => {
        if (user && typeof user === 'object' && 'id' in user) {
          return user as User;
        }
        return null;
      }),
      catchError(err => {
        // Don't log 401 errors as these are expected for unauthenticated users
        if (err.status !== 401) {
          console.error('Error fetching user:', err);
        }
        return of(null);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${env.api}/api/auth/logout`, {}).pipe(
      map(() => {
        this.currentUser$.next(null);
        // Clear any remaining cookies with correct attributes for cross-origin
        if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none';
          document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none';
        }
      }),
      catchError(err => {
        console.error('Logout error:', err);
        // Even if logout fails on server, clear local state
        this.currentUser$.next(null);
        return of(undefined);
      })
    );
  }

  register(email: string, password: string): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${env.api}/api/auth/register`, {
      email,
      password,
    }).pipe(
      catchError(err => {
        console.error('Registration error:', err);
        throw err;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${env.api}/api/auth/login`, { email, password })
      .pipe(
        map(result => {
          if (result.user) {
            this.currentUser$.next(result.user);
          }
          return result;
        }),
        catchError(err => {
          console.error('Login error:', err);
          throw err;
        })
      );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${env.api}/api/auth/forgot-password`, { email })
      .pipe(
        catchError(err => {
          console.error('Forgot password error:', err);
          throw err;
        })
      );
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${env.api}/api/auth/reset-password`, {
      token,
      password,
    }).pipe(
      catchError(err => {
        console.error('Reset password error:', err);
        throw err;
      })
    );
  }

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    return !!this.currentUser$.value;
  }

  // Check if user is admin
  get isAdmin(): boolean {
    return this.currentUser$.value?.role === 'admin';
  }

  // Force refresh of authentication state
  refreshAuthState(): Observable<User | null> {
    return this.getMe().pipe(
      map(user => {
        this.currentUser$.next(user);
        return user;
      })
    );
  }
}
