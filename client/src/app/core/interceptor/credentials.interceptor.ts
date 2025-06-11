import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Adds `withCredentials: true` so the browser sends / receives
 * the http‑only `token` cookie on every API request.
 *
 * Register it in `main.ts` with:
 *   provideHttpClient(withInterceptors([credentialsInterceptor]))
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
    next(req.clone({ withCredentials: true }));
