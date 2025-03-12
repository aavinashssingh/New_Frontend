import { NgModule, PLATFORM_ID, TransferState } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SurgeriesRoutingModule } from "./surgeries-routing.module";
import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "src/app/material.module";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { BenefitsComponent } from "./components/benefits/benefits.component";
import { PatientModule } from "../../patient.module";
import { DepartSurgeryComponent } from "./components/depart-surgery/depart-surgery.component";
import { EnquiryComponent } from "./components/enquiry/enquiry.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ConfirmCosultationComponent } from "./components/confirm-cosultation/confirm-cosultation.component";
import { SurgeryDetailComponent } from "./components/surgery-detail/surgery-detail.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { MobileDepartSugeryComponent } from "./components/mobile-depart-sugery/mobile-depart-sugery.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";
import { SurgeryFaqComponent } from './components/surgery-faq/surgery-faq.component';
import { DoctorSurgerdetailsComponent } from './components/doctor-surgerdetails/doctor-surgerdetails.component';
// import { SwiperModule } from 'ngx-swiper-wrapper';
import { SharedModule } from "src/app/shared/shared.module";
import { DoctorsurgreycardComponent } from "src/app/shared/components/doctorsurgreycard/doctorsurgreycard.component";

@NgModule({
  declarations: [
    PopularSurgeryComponent,
    BenefitsComponent,
    DepartSurgeryComponent,
    EnquiryComponent,
    ConfirmCosultationComponent,
    SurgeryDetailComponent,
    MobileDepartSugeryComponent,
    SurgeryFaqComponent,
    DoctorSurgerdetailsComponent,
     DoctorsurgreycardComponent
  ],
  imports: [
    CommonModule,
    SurgeriesRoutingModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    PatientModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient, TransferState, PLATFORM_ID],
      },
    }),
    CarouselModule,
  ],
  providers: [NgDialogAnimationService],
})
export class SurgeriesModule { }
