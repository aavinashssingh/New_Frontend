import { APP_INITIALIZER, NgModule, TransferState } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CarouselModule } from "ngx-owl-carousel-o";
import { AppRoutingModule } from "./app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule, TranslateStore } from "@ngx-translate/core";
import { StarRatingConfigService } from "angular-star-rating";
import { CommonModule, DatePipe } from "@angular/common";
import { ToastrModule } from "ngx-toastr";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, NavigationEnd, Router } from "@angular/router";
import { TransferStateService } from "./services/transfer-state.service";
// import {
//     NgxUiLoaderConfig,
//     NgxUiLoaderModule,
//     POSITION,
//     SPINNER,
// } from "ngx-ui-loader";
import { SeoService } from "./services/seo.service";
import { SharedModule } from "./shared/shared.module";
import { translateBrowserLoaderFactory } from "./shared/loader/translate-browser.loader";

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// const ngxUiLoaderConfig: NgxUiLoaderConfig = {
//     bgsColor: "rgb(69, 25, 124)",
//     bgsOpacity: 1,
//     bgsPosition: POSITION.bottomRight,
//     bgsSize: 40,
//     bgsType: SPINNER.threeStrings,
//     fgsColor: "rgb(69, 25, 124)",
//     logoUrl:"assets/Nectar-Plus-Health-Icon.gif",
//     fgsPosition: POSITION.centerCenter,
// };
@NgModule({
    declarations: [],
    bootstrap: [],
    imports: [
        BrowserModule.withServerTransition({ appId: "serverApp" }),
        AppRoutingModule,
        CommonModule,
        BrowserAnimationsModule,
        CarouselModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: translateBrowserLoaderFactory,
                deps: [HttpClient, TransferState],
            },
        }),
        ToastrModule.forRoot({
            timeOut: 2000,
            progressBar: true,
            preventDuplicates: true,
            closeButton: true,
            progressAnimation: "increasing",
            positionClass: "toast-top-right",
        }),
        // NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
        RouterModule,
        SharedModule,
        GoogleMapsModule],
    providers: [
        TranslateStore,
        { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
        StarRatingConfigService,
        DatePipe,
        SeoService,
        TransferStateService,
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
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}
