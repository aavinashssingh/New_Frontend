import { Component, EventEmitter, Input, OnInit, Output,SimpleChanges  } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { DatePipe } from "@angular/common";
import { ImageViewModalComponent } from "../../image-view-modal/image-view-modal.component";
import { BottomSheetClinicVisitComponent } from "../bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "nectar-about-section",
  templateUrl: "./about-section.component.html",
  styleUrls: ["./about-section.component.scss"],
})
export class AboutSectionComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private formatTime: FormatTimeService,
    public gService: GoogleMapsService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private _bottomSheet: MatBottomSheet,
    private commonService: CommonService
  ) {}
  @Input() id: any;
  @Input() city: any;
  @Input() doctorDetail: any;
  isExpanded: boolean = false; // Tracks the current state of expansion.

  stateList: any;
  @Output() backdrop = new EventEmitter();
  deviceWidth: any;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }
  aboutData: any;

  // getState() {
  //   this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
  //     next: (res) => {
  //       this.stateList = res.result.data;
  //     },
  //     error: (error: any) => {
  //       this.stateList = [];
  //     },
  //   });
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["doctorDetail"] && this.doctorDetail) {
      this.processDoctorData();
    }
  }

  processDoctorData() {
    this.aboutData = { ...this.doctorDetail };
    this.aboutData?.establishmentmaster.forEach((element: any) => {
      let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      if (element.establishmenttiming[0]) {
        Object.keys(element.establishmenttiming[0]).forEach((key) => {
          if (!days.includes(key)) delete element.establishmenttiming[0][key];
        });
      }
      element.establishmenttiming = element.establishmenttiming[0];
      // Assuming you have a dateTimeConversion utility function
      element.establishmenttiming = this.formatTime.dateTimeConversion(
        element.establishmenttiming
      );
    });

 }

  getAbout() {

    if (!this.id) return;

    this.apiService
      .get(`${API_ENDPOINTS.patient.doctorDetail}`, {
        doctorId: this.id,
      })
      .subscribe((res: any) => {
        this.aboutData = res?.result[0];
        this.aboutData?.establishmentmaster.forEach((element: any) => {
          let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
          if (element.establishmenttiming[0]) {
            Object.keys(element.establishmenttiming[0]).forEach((key) => {
              if (!days.includes(key))
                delete element.establishmenttiming[0][key];
            });
          }
          element.establishmenttiming = element.establishmenttiming[0];
          element.establishmenttiming = this.formatTime.dateTimeConversion(
            element.establishmenttiming
          );
        });


      });
  }

  bookAppoint(item: any) {
    if (this.deviceWidth > 1024) {
      this.backdrop.emit(item);
      this.eventService.broadcastEvent("hospital-data", item);
    } else {
      let date = this.datePipe.transform(new Date(), "EEE, d MMM");
      this.dialog.open(ClinicappointmentComponent, {
        width: "490px",
        panelClass: "yespost",
        data: {
          date: date,
          id: this.id,
          establishmentId: item?._id,
        },
        autoFocus: false,
      });
    }
  }

  viewHospital(data: any) {
    if(data.consultationFees!=-1){
      const city = data?.address?.city.split(" ").join("-").toLowerCase();
      this.router.navigate([`${city}/hospital/${data?.profileSlug}`]);
    }
  
  }

  viewImage(url: any) {
    this.dialog.open(ImageViewModalComponent, {
      data: url,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy(),
    });
  }

  openBottomSheet(data: any = {}) {
    this._bottomSheet.open(BottomSheetClinicVisitComponent, {
      data: {
        newsId: this.id,
        establishmentIds: data?._id,
      },
    });
    this.eventService.broadcastEvent("hospital-data", data);
  }


  openGoogleMaps(item: any): void {

    if(item?.location?.coordinates?.[1]== 28.6448 && item?.location?.coordinates?.[0]== 77.216721)
    {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;
    
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      
      window.open(googleMapsUrl, '_blank'); 
    }
    else{
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1] ,
        item?.location?.coordinates?.[0] 
      )
    }
  }

  getStateName(stateId: string): string {
    const state = this.stateList.find((s) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
  }
  navigateToSearch(routeName: string) {
    const city = this.commonService.replaceSpaceWithHyphen(this.aboutData?.establishmentmaster?.[0]?.address?.city);
    this.router.navigate([city + '/' + routeName]);
  }
  toggleReadMore(): void {
    this.isExpanded = !this.isExpanded;
  }
  get cityName(): string {
    return this.commonService.replaceSpaceWithHyphen(this.aboutData?.establishmentmaster?.[0]?.address?.city);
  }

  formatName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-$/, '');
  }
  
}

