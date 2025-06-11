import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take, catchError } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Allows navigation only when AuthService has a user.
 * If `currentUser$` is null redirects to /login with returnUrl.
 *
 * Usage in routes:
 *   { path: 'account', canActivate: [authGuard], loadComponent: … }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): ReturnType<CanActivateFn> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      
      // Store the attempted URL for redirecting after successful login
      const returnUrl = state.url;
      return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};
