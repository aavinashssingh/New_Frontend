import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { HttpLoaderFactory } from './app.module';
import { AppInterceptor } from './interceptor/app.interceptor';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { SeoService } from './services/seo.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { StarRatingConfigService } from 'angular-star-rating';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),  // Ensure interceptors are loaded correctly
    provideAnimations(),
    provideToastr(),
    DatePipe,
    TranslateService,
    StarRatingConfigService,
    TranslateStore,
    SeoService,
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (seoService: SeoService, router: Router) => {
        return () => {
          router.events.subscribe((event) => {
            if (event instanceof NavigationEnd)
              seoService.setCanonicalUrl();
          });
        };
      },
      deps: [SeoService, Router],
      multi: true,
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}; 