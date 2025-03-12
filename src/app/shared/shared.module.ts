import { NgModule, PLATFORM_ID, TransferState } from "@angular/core";
import { CommonModule, isPlatformServer } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { DoctorCardsComponent } from "./components/doctor-cards/doctor-cards.component";
import { ClinicappointmentComponent } from "./components/clinicappointment/clinicappointment.component";
import { StarRatingModule } from "angular-star-rating";
import { CarouselModule } from "ngx-owl-carousel-o";
import { GlobalSearchComponent } from "./components/global-search/global-search.component";
import { AboutSectionComponent } from "./components/about-section/about-section.component";
import { FaqSectionComponent } from "./components/faq-section/faq-section.component";
import { ReviewSectionComponent } from "./components/review-section/review-section.component";
import { ServicesSectionComponent } from "./components/services-section/services-section.component";
import { VideosSectionComponent } from "./components/videos-section/videos-section.component";
import { ChunkPipe } from "./pipes/chunk.pipe";
import { ShareModalComponent } from "./components/share-modal/share-modal.component";
import { ClickOutsideDirective } from "./directives/click-outside.directive";
import { DeleteModalComponent } from "./components/delete-modal/delete-modal.component";
import { TranslateModule } from "@ngx-translate/core";
import { WrapSearchComponent } from "./components/wrap-search/wrap-search.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { TimecomparePipe } from "./pipes/timecompare.pipe";
import { ShareButtonsModule } from "ngx-sharebuttons/buttons";
import { ShareIconsModule } from "ngx-sharebuttons/icons";
import { NgxPaginationModule } from "ngx-pagination";
import { ClinicVisitAppointmentComponent } from "./components/clinic-visit-appointment/clinic-visit-appointment.component";
import { CurrentTimeComparePipe } from "./pipes/current-time-compare.pipe";
import { AvaliableSlotPipe } from "./pipes/avaliable-slot.pipe";
import { DoctorAboutSectionComponent } from "./components/doctor-about-section/doctor-about-section.component";
import { ProcedureSectionComponent } from "./components/procedure-section/procedure-section.component";
import { SpecialitySectionComponent } from "./components/speciality-section/speciality-section.component";
import { NameInitialPipe } from "./pipes/name-initial.pipe";
import { FormatarrayPipe } from "./pipes/formatarray.pipe";
import { SanitizePipe } from "./pipes/sanitize.pipe";
import { StringifyPipe } from "./pipes/stringify.pipe";
import { FilterTimeSlotPipe } from "./pipes/filter-time-slot.pipe";
import { AngularMaterialModule } from "../material.module";
import { ReplacePipe } from "./pipes/replace.pipe";
import { FormFieldComponent } from "./components/form-field/form-field.component";
import { ErrorDirective } from "./directives/error.directive";
import { DragDropDirective } from "./directives/drap-drop.directive";
import { GoogleMapsComponent } from "./components/google-maps/google-maps.component";
// import { AgmCoreModule } from "@agm/core";
import { environment } from "src/environments/environment";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ImageViewModalComponent } from "./image-view-modal/image-view-modal.component";
import { ReadMoreComponent } from "./read-more/read-more.component";
import { ErrorPipe } from "./pipes/error.pipe";
import { NitifcationTimePipe } from "./pipes/nitifcation-time.pipe";
import { BottomSheetClinicVisitComponent } from "./components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { SeoContentComponent } from "./components/seo-content/seo-content.component";
import { SearchSuggestionsMobileComponent } from "./components/search-suggestions-mobile/search-suggestions-mobile.component";
import { AppointmentStatusPipe } from "./pipes/appointment-status.pipe";
import { AppendDotPipe } from "./pipes/append-dot.pipe";
import { InfiniteScrollDirective } from "./directives/infinite-scroll.directive";
import { FilterAppointmentPipe } from "./pipes/filter-appointment.pipe";
import { HttpClient } from "@angular/common/http";
import { TruncatePipe } from "./pipes/truncate.pipe";
import { SvgServerLoader } from "./loader/svg-server.loader";
import { SvgBrowserLoader } from "./loader/svg-browser.loader";
import { svgLoaderFactory } from "./loader/svg-common.loader";
import { GoogleMapsModule } from "@angular/google-maps";
import { CapitalizePipe } from "./pipes/capitalize.pipe";
import { ReplaceHyphenPipe } from "./pipes/replace-hyphen.pipe";
import { DoctorProcedureSectionComponent } from "./components/doctor-procedure-section/doctor-procedure-section.component";

const component = [
  GlobalSearchComponent,
  DoctorCardsComponent,
  ClinicappointmentComponent,
  VideosSectionComponent,
  ServicesSectionComponent,
  ReviewSectionComponent,
  FaqSectionComponent,
  AboutSectionComponent,
  ChunkPipe,
  ClickOutsideDirective,
  DeleteModalComponent,
  ShareModalComponent,
  WrapSearchComponent,
  TimecomparePipe,
  TruncatePipe,
  CapitalizePipe,
  ReplaceHyphenPipe,
  ClinicVisitAppointmentComponent,
  CurrentTimeComparePipe,
  AvaliableSlotPipe,
  DoctorAboutSectionComponent,
  ProcedureSectionComponent,
  SpecialitySectionComponent,
  DoctorAboutSectionComponent,
  ProcedureSectionComponent,
  SpecialitySectionComponent,
  NameInitialPipe,
  FormatarrayPipe,
  SanitizePipe,
  StringifyPipe,
  FilterTimeSlotPipe,
  ReplacePipe,
  FormFieldComponent,
  ErrorDirective,
  DragDropDirective,
  GoogleMapsComponent,
  ReadMoreComponent,
  ErrorPipe,
  NitifcationTimePipe,
  SeoContentComponent,
  ImageViewModalComponent,
  NitifcationTimePipe,
  SeoContentComponent,
  AppointmentStatusPipe,
  AppendDotPipe,
  BottomSheetClinicVisitComponent,
  SearchSuggestionsMobileComponent,
  DoctorProcedureSectionComponent,
  InfiniteScrollDirective,
  FilterAppointmentPipe,
];

@NgModule({
  declarations: [component,],
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    CarouselModule,
    StarRatingModule.forRoot(),
    TranslateModule,
    NgSelectModule,
    ShareButtonsModule.withConfig({
      debug: true,
    }),
    ShareIconsModule,
    NgxPaginationModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient, TransferState, PLATFORM_ID],
      },
    }),
    GoogleMapsModule,
    // AgmCoreModule.forRoot({
    //   apiKey: environment.GOOGLE_API_KEY,
    //   libraries: ["places"],
    // }),
  ],
  exports: [component],
})
export class SharedModule { }
