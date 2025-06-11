import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of, catchError } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  email: string;
  role: string;
}

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
      catchError(err => {
        console.error('Failed to get user', err);
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
    return this.http.get<{ user: User }>(`${env.api}/api/auth/me`).pipe(
      map(res => res.user),
      catchError(() => of(null)),
    );
  }

  logout() {
    return this.http
      .post(`${env.api}/api/auth/logout`, {})
      .pipe(tap(() => this.currentUser$.next(null)));
  }

  register(email: string, password: string) {
    // Don't use handleAuth here to avoid auto-login
    return this.http.post<{ user: User; message: string }>(
      `${env.api}/api/auth/register`,
      { email, password },
    );
  }

  login(email: string, password: string) {
    return this.handleAuth(
      this.http.post<{ user: User }>(
        `${env.api}/api/auth/login`,
        { email, password },
      ),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${env.api}/api/auth/forgot-password`,
      { email },
    );
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${env.api}/api/auth/reset-password`,
      { token, password },
    );
  }
}
