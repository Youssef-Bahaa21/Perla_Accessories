import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take, catchError } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';


/**
 * Allows access only when the current user is present AND has role === 'admin'.
 * Otherwise redirects:
 *   – unauthenticated  → /login with returnUrl
 *   – logged‑in non‑admin → / with access denied message
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): ReturnType<CanActivateFn> => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        // Store the attempted URL for redirecting after successful login
        const returnUrl = state.url;
        return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
      }

      if (user.role === 'admin') {
        return true;
      }

      // logged‑in but not an admin - redirect with message
      return router.createUrlTree(['/'], { 
        queryParams: { accessDenied: true }
      });
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};
