import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxSpinnerModule } from 'ngx-spinner';
import { provideToastr } from 'ngx-toastr';

import { loadingInterceptor } from './core/interceptor/loading.interceptor';
import { messageInterceptor } from './core/interceptor/message.interceptor';
import { credentialsInterceptor } from './core/interceptor/credentials.interceptor';
import { csrfInterceptor } from './core/interceptor/csrf.interceptor';
import { authRefreshInterceptor } from './core/interceptor/auth-refresh.interceptor';

import { HttpClientXsrfModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),

      // ✅ Add this to enable automatic XSRF-TOKEN header
      HttpClientXsrfModule.withOptions({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        credentialsInterceptor,
        authRefreshInterceptor,    // Add auth refresh interceptor
        loadingInterceptor,
        csrfInterceptor,         // ✅ optional, if you manually fetch token
        messageInterceptor,
      ])
    ),

    provideRouter(routes),

    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),

    provideAnimations(),
  ],
};
