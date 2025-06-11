import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take, catchError } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Allows access only when the current user is present AND has role === 'customer'.
 * This prevents admins from accessing customer-only features.
 * Otherwise redirects:
 *   – unauthenticated  → /login with returnUrl
 *   – logged‑in admin → /admin
 */
export const customerGuard: CanActivateFn = (
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

      if (user.role === 'customer') {
        return true;
      }

      // logged‑in but admin - redirect to admin dashboard
      return router.createUrlTree(['/admin']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};
