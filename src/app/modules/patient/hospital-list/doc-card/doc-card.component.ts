import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { DatePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { BottomSheetClinicVisitComponent } from "src/app/shared/components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { ClinicappointmentComponent } from "src/app/shared/components/clinicappointment/clinicappointment.component";

@Component({
  selector: "nectar-doc-card",
  templateUrl: "./doc-card.component.html",
  styleUrls: ["./doc-card.component.scss"],
})
export class DocCardComponent {
  @Input() data: any;
  @Input() establishmentId: any;
  devieWidth: any;
  constructor(
    private localStorage: LocalStorageService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private eventService: EventService,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private commonService: CommonService
  ) { }

  bookAppointment() {
    if (!this.data?.isActive) {
      return;
    }
    this.devieWidth = this.commonService.gettingWinowWidth();
    let date = this.datePipe.transform(new Date(), "EEE, d MMM");
    let obj: any = {
      fullname: this.data?.doctorName,
      specialization: this.data?.specialization,
      address: `${this.data?.address?.locality || ""}, ${this.data?.address?.city || ""
        } ${this.data?.address?.pincode || ""}  `,
      doctorId: this.data._id,
      city: this.data?.address?.city,
      doctorProfileSlug: this.data?.doctorProfileSlug,
      doctorPic: this.data?.doctorProfilePic || "assets/images/svg/Nectar Favicon.svg",
      consultationDetails: this.data?.consultationDetails,
      videoConsultationFees: this.data?.videoConsultationFees,
      consultationFees: this.data?.consultationFees,
      consultationType: this.data?.consultationType,
      profilePic:this.data?.profilePic || "assets/images/svg/Nectar Favicon.svg"
    };
    
    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
    if (this.devieWidth > 767) {
      this.dialog.open(ClinicappointmentComponent, {
        // maxHeight: "600px",
        width: "490px",
        panelClass: "yespost",
        data: {
          date: date,
          id: this.data._id,
          establishmentId: this.establishmentId,
        },
        autoFocus: false,
        scrollStrategy: new NoopScrollStrategy(),
      });
    } else if (this.devieWidth < 767) {
      this._bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: this.data._id,
          establishmentIds: this.establishmentId,
        },
      });
      this.eventService.broadcastEvent("hospital-data", {
        _id: this.establishmentId,
      });
    }
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.data?.address?.city.split(" ").join("-").toLowerCase();
    this.router.navigate([`${city}/doctor/${this.data?.doctorProfileSlug}`]);
  }

  formatName(value: any, length: any = "") {
    let maxlength = this.devieWidth > 767 ? 40 : 25;
    if (length) {
      maxlength = length;
    }
    if (value?.length > maxlength) {
      return value.slice(0, maxlength) + "...";
    }
    return value;
  }
}
