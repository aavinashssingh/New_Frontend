import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeWrapperComponent } from "./components/home-wrapper/home-wrapper.component";
import { ThemesComponent } from "./themes/themes.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { DoctorDetailsComponent } from "./pages/hospitals/doctor-details/doctor-details.component";
import { BookAppointmnetComponent } from "./components/book-appointmnet/book-appointmnet.component";
import { ConfirmAppointmentComponent } from "./components/confirm-appointment/confirm-appointment.component";
import { CancelAppointmentComponent } from "./components/cancel-appointment/cancel-appointment.component";
import { PatientLoginComponent } from "./components/patient-login/patient-login.component";
import { RescheduleAppointmentComponent } from "./components/reschedule-appointment/reschedule-appointment.component";
import { HospitalDetailsComponent } from "./pages/hospitals/hospital-details/hospital-details.component";
import { AppointmentCompletedComponent } from "./components/appointment-completed/appointment-completed.component";
import { PrivacyPolicyComponent } from "./pages/privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./pages/terms-conditions/terms-conditions.component";
import { AuthGuard } from "src/app/guards/auth.guard";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { Error404Component } from "./themes/error404/error404.component";
import { ReverseAuthguardGuard } from "src/app/guards/reverse-authguard.guard";

const routes: Routes = [
  {
    path: "",
    component: ThemesComponent,
    children: [
      { path: "", component: HomeWrapperComponent },
      { path: "home", component: HomeWrapperComponent },
      {
        path: "contact-us",
        component: ContactUsComponent,
      },
      {
        path: "appointment-booking",
        component: BookAppointmnetComponent,
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },
      {
        path: "cancel-booking",
        component: CancelAppointmentComponent,
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },
      {
        path: "confirm-booking",
        component: ConfirmAppointmentComponent,
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },
      {
        path: "reschedule-booking",
        component: RescheduleAppointmentComponent,
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },
      {
        path: "appointment-completed",
        component: AppointmentCompletedComponent,
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },

      {
        path: ":city/doctor/:slug",
        component: DoctorDetailsComponent,
      },
      {
        path: "patient-login",
        component: PatientLoginComponent,
      },
      {
        path: ":city/hospital/:slug",
        component: HospitalDetailsComponent,
      },

      {
        path: "contact-us",
        component: ContactUsComponent,
      },
      {
        path: "privacy-policy",
        component: PrivacyPolicyComponent,
      },
      {
        path: "terms-conditions",
        component: TermsConditionsComponent,
      },

      {
        path: "hospital-list",
        loadChildren: () =>
          import("./hospital-list/hospital-list.module").then(
            (m) => m.HospitalListModule
          ),
      },
      {
        path: "hospitals",
        loadChildren: () =>
          import("./pages/hospitals/hospitals.module").then(
            (m) => m.HospitalsModule
          ),
      }, {
        path: "medicines",
        loadChildren: () =>
          import("./medicines/my-upchar.module").then(
            (m) => m.MyUpcharModule
          ),
      },
      {
        path: "profile",
        loadChildren: () =>
          import("./profile-doctor/profile-doctor.module").then(
            (m) => m.ProfileDoctorModule
          ),
        canActivate: [AuthGuard],
        data: {
          userType: APP_CONSTANTS.USER_TYPES.PATIENT,
        },
      },
      {
        path: ":city/surgeries",
        loadChildren: () =>
          import("./pages/surgeries/surgeries.module").then(
            (m) => m.SurgeriesModule
          ),
      },
      {
        path: "surgeries",
        loadChildren: () =>
          import("./pages/surgeries/surgeries.module").then(
            (m) => m.SurgeriesModule
          ),
      },
      // {
      //   path: "blogs",
      //   loadChildren: () =>
      //     import("./pages/blogs/blogs.module").then((m) => m.BlogsModule),
      // },
      {
        path: "auth",
        loadChildren: () =>
          import("../auth/auth.module").then((m) => m.AuthModule),
        canActivate: [ReverseAuthguardGuard],
      },
      {
        path: "register",
        loadChildren: () =>
          import("../registration-process/registration-process.module").then(
            (m) => m.RegistrationProcessModule
          ),
      },
      {
        path: "pateient",
        loadChildren: () =>
          import("./pages/pages.module").then((m) => m.PagesModule),
      },
      {
        path: "about-us",
        loadChildren: () =>
          import("./about-us/about-us.module").then((m) => m.AboutUsModule),
      },

      {
        path: ":city/:speciality",
        loadChildren: () =>
          import("./doctor-search-result/doctor-search-result.module").then(
            (m) => m.DoctorSearchResultModule
          ),
      },
      // {
      //   path: ":city/services/:service",
      //   loadChildren: () =>
      //     import("./doctor-search-result/doctor-search-result.module").then(
      //       (m) => m.DoctorSearchResultModule
      //     ),
      // },
      {
        path: ":city/:speciality/:locality",
        loadChildren: () =>
          import("./doctor-search-result/doctor-search-result.module").then(
            (m) => m.DoctorSearchResultModule
          ),
      },
      { path: "**", redirectTo: "page-not-found" },
      {
        path: "page-not-found",
        component: Error404Component,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
