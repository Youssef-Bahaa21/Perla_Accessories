// src/app/core/interceptor/message.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { catchError, tap, throwError } from 'rxjs';

export const messageInterceptor: HttpInterceptorFn = (req, next) => {
    const notify = inject(NotificationService);

    return next(req).pipe(
        tap(event => {
            if (event instanceof HttpResponse) {
                const body = event.body as any;

                // ✅ Suppress CSRF token set message
                if (body && body.message && body.message !== 'CSRF token set in cookie') {
                    notify.show(body.message, 'success');
                }
            }
        }),
        catchError(err => {
            const body = err.error as any;
            if (body && body.message) {
                notify.show(body.message, 'error');
            }
            return throwError(() => err);
        })
    );
};
