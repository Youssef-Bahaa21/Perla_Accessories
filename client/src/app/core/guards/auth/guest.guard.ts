import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take, catchError } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Allows navigation only when user is NOT logged in (i.e., guest users).
 * If user is logged in, redirects to products page.
 * 
 * Usage in routes:
 *   { path: 'login', canActivate: [guestGuard], loadComponent: … }
 */
export const guestGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): ReturnType<CanActivateFn> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
        take(1),
        map(user => {
            // If there's no user (not logged in), allow access
            if (!user) {
                return true;
            }

            // If user is logged in, redirect to products page
            return router.createUrlTree(['/products']);
        }),
        catchError(() => {
            // On error, allow access (assuming not logged in)
            return of(true);
        })
    );
}; 