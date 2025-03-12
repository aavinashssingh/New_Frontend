import { Component, Input, OnInit } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { ImageViewModalComponent } from "../../image-view-modal/image-view-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { NoopScrollStrategy } from "@angular/cdk/overlay";

@Component({
  selector: "nectar-doctor-about-section",
  templateUrl: "./doctor-about-section.component.html",
  styleUrls: ["./doctor-about-section.component.scss"],
})
export class DoctorAboutSectionComponent implements OnInit {
  @Input() id: any;
  isExpanded: boolean = false;

  constructor(
    private formatTimeService: FormatTimeService,
    private eventService: EventService,
    private apiService: ApiService,
    public gService: GoogleMapsService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getHospitalDetail();
      }
    });
    this.getHospitalDetail();

    this.isExpanded = this.data?.about.map(() => false);

  }
  data: any;

  getData() {
    if (this.data?.establishmentTiming) {
      let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      Object.keys(this.data?.establishmentTiming).forEach((key) => {
        if (!days.includes(key)) delete this.data?.establishmentTiming[key];
      });
      this.data.establishmentTiming = this.formatTimeService.dateTimeConversion(
        this.data?.establishmentTiming
      );
    }
  }

  getHospitalDetail() {
    if (!this.id) return;

    this.apiService
      .get(`${API_ENDPOINTS.patient.hospitalProfile}`, {
        establishmentId: this.id,
      })
      .subscribe((res: any) => {
        this.data = res?.result[0];
        if (this.data?.address) {
          let obj: any = JSON.parse(JSON.stringify(this.data?.address));
          let arr = Object.values(obj);
          this.data.address = arr.join(", ");
        }
        this.getData();
      });
  }

  viewImage(url: any) {
    this.dialog.open(ImageViewModalComponent, {
      data: url,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy(),
    });
  }
  toggleReadMore(): void {
    this.isExpanded = !this.isExpanded;
  }
  
}
