import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LocalStorageService } from "src/app/services/storage.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { EventService } from "src/app/services/event.service";
import { Router } from "@angular/router";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "nectar-doctor-cards",
  templateUrl: "./doctor-cards.component.html",
  styleUrls: ["./doctor-cards.component.scss"],
})
export class DoctorCardsComponent implements OnInit {
  @Input() type = 0;
  @Input() data;
  constructor(
    private localStorage: LocalStorageService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private eventService: EventService,
    private router: Router,
    private readonly scrollStrategyOptions: ScrollStrategyOptions,
    private commonService: CommonService
  ) {}
  scrollStrategy: ScrollStrategy;
  specailization: any;
  deviceWidth: any;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (!this.data.doctorProfilePicture) {
      this.data.doctorProfilePicture = "assets/images/svg/Nectar Favicon.svg";
    }
    this.specailization = this.data?.specialization.join(", ");
  }
  bookAppointment() {
    let date = this.datePipe.transform(new Date(), "EEE, d MMM");
    let arr: any = [];

    this.data?.specialization.forEach((element: any) => {
      arr.push({ name: element });
    });

    let obj: any = {
      fullname: this.data?.doctorName,
      specialization: arr,
      address: `${this.data?.address?.locality || ""}, ${
        this.data?.address?.city || ""
      }  `,
      doctorId: this.data._id,
      city: this.data?.address?.city,
      doctorProfileSlug: this.data?.doctorProfileSlug,
      doctorPic:
        this.data?.doctorProfilePicture ||
        "assets/images/svg/Nectar Favicon.svg",
        consultationFees: this.data?.consultationFees,
        videoConsultationFees: this.data?.videoConsultationFees,
        profilePic:this.data?.profilePic || this.data?.doctorProfilePicture || "assets/images/svg/Nectar Favicon.svg"
    };

    
    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
    this.dialog.open(ClinicappointmentComponent, {
      // maxHeight: "600px",
      width: "490px",
      panelClass: "yespost",
      data: {
        date: date,
        id: this.data._id,
        establishmentId: this.data?.establishmentId,
      },
      autoFocus: false,
      scrollStrategy: this.scrollStrategyOptions.noop(),
    });
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(
      this.data?.address?.city
    );
    this.router.navigate([`${city}/doctor/${this.data?.doctorProfileSlug}`]);
  }
  formatName(value: any, maxLength: number) {
    if (value.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }
}
