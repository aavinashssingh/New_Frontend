import { Component, Input, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ClinicappointmentComponent } from "src/app/shared/components/clinicappointment/clinicappointment.component";
import { LocalStorageService } from "src/app/services/storage.service";
import { Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetClinicVisitComponent } from "src/app/shared/components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { SelectEstablishmentComponent } from "../../../pages/hospitals/select-establishment/select-establishment.component";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "nectar-calendar-view",
  templateUrl: "./calendar-view.component.html",
  styleUrls: ["./calendar-view.component.scss"],
})
export class CalendarViewComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private localStorage: LocalStorageService,
    private router: Router,
    private eventService: EventService,
    public gService: GoogleMapsService,
    private bottomSheet: MatBottomSheet,
    private apiService: ApiService,
    private commonService: CommonService
  ) {}
  doctorList: any;
  @Input() data: any;
  list: any = [];
  deviceWidth: any;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  checkTodayDate(data: any) {
    const date = new Date(data);
    const today = new Date();
    if (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    ) {
      return true;
    }

    return false;
  }
  appoinmentDetail(data: any = new Date(), slot: any) {
    if (slot == 0) {
      return;
    } else if (this.data?.establishmentId) {
      let date = this.datePipe.transform(data || new Date(), "EEE, d MMM");
      let obj: any = {
        fullname: this.data?.fullName,
        specialization: this.data?.specialization,
        address: `${this.data?.address?.locality || ""}, ${
          this.data?.address?.city || ""
        } ${this.data?.address?.pincode || ""}  `,
        doctorId: this.data._id,
        city: this.data?.address?.city,
        doctorProfileSlug: this.data?.doctorProfileSlug,
        doctorPic:
          this.data?.profilePic || "assets/images/svg/Nectar Favicon.svg",
        profilePic:
          this.data?.profilePic || "assets/images/svg/Nectar Favicon.svg",

          consultationFees: this.data?.consultationFees,
          videoConsultationFees: this.data?.videoConsultationFees,
      };

      

      this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
      if (this.deviceWidth > 767) {
        this.dialog.open(ClinicappointmentComponent, {
          // maxHeight: "600px",
          width: "490px",
          panelClass: "yespost",
          data: {
            date,
            id: this.data._id,
            establishmentId: this.data?.establishmentId,
          },
          autoFocus: false,
          scrollStrategy: new NoopScrollStrategy(),
        });
      } else if (this.deviceWidth < 767) {
        this.bottomSheet.open(BottomSheetClinicVisitComponent, {
          data: {
            newsId: this.data._id,
            establishmentIds: this.data?.establishmentId,
            date,
          },
        });
        this.eventService.broadcastEvent("hospital-data", {
          _id: this.data?.establishmentId,
        });

      }
      // const closeButton = document.getElementById('close-button');
      // closeButton.addEventListener('click', () => {
      //   this.bottomSheet.dismiss(BottomSheetClinicVisitComponent);
      // });
    }
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(
      this.data?.address?.city
    );
    this.router.navigate([`${city}/doctor/${this.data?.doctorProfileSlug}`]);
  }
  formatName(value: any, maxLength) {
    if (value?.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  changeClinic() {
    let bottomsheet = this.bottomSheet.open(SelectEstablishmentComponent, {
      data: { doctorId: this.data?._id, type: "doctor-listing" },
    });

    bottomsheet.afterDismissed().subscribe((res: any) => {
      if (res) {
        let hospitalDetail = this.data?.establishmentMaster.find(
          (obj) => obj.establishmentId === res?._id
        );
        this.data.establishmentId = hospitalDetail?.establishmentId;
        this.data.establishmentName = hospitalDetail?.establishmentName;
        this.data.hospitalTypeMaster[0].name =
          hospitalDetail?.hospitalTypeMaster[0]?.name;
        this.data.consultationFees = hospitalDetail?.consultationFees;
        this.data.isActive = hospitalDetail?.establishmenttiming?.isActive;
        this.getAppointmentCounts(this.data?._id, this.data.establishmentId);
      }
    });
  }

  getAppointmentCounts(doctorId, hospitalId) {
    let payload = {
      doctorId: doctorId,
      establishmentId: hospitalId,
    };
    this.apiService
      .get(`${API_ENDPOINTS.patient.getAppointmentCountsDaily}`, payload)
      .subscribe((res: any) => {
        this.data.appointmentCounts = res?.result?.dateRange;
      });
  }
}
