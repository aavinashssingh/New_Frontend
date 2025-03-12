import { DOCUMENT, DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { EventService } from "src/app/services/event.service";
import { Router } from "@angular/router";
import { BottomSheetClinicVisitComponent } from "../bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { debounceTime, distinctUntilChanged, fromEvent, map } from "rxjs";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "nectar-speciality-section",
  templateUrl: "./speciality-section.component.html",
  styleUrls: ["./speciality-section.component.scss"],
})
export class SpecialitySectionComponent implements OnInit, AfterViewInit {
  @Input() id: any;
  @Input() name: any;
  @Input() address: any;
  @Input() tab: any = 1;
  @Output() valueChange: any = new EventEmitter<void>();
  @ViewChild("search", { static: false }) search: ElementRef<HTMLInputElement>;

  totalCount: number;
  deviceWidth: any;
  constructor(
    private apiService: ApiService,
    private formatTime: FormatTimeService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document
  ) {}
  selectedSpeciality: any = "all";
  specialArray: any;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (this.tab == 0) {
      this.payload.size = 5;
    }
    this.getSpecaility();
    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getSpecaility();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.deviceWidth < 767) {
      this.searchFunction();
    }
  }

  searchFunction() {
    fromEvent(this.search?.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          return event?.target?.value;
        }),
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (text.length) {
          this.payload.search = text;
          this.payload.page = 1;
          this.getListing();
        } else {
          delete this.payload.search;
          this.getListing();
        }
      });
  }

  totalSpecialaities: any;
  getSpecaility() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.specialityWithCount}/${this.id}`, {})
      .subscribe((res: any) => {
        this.totalSpecialaities = res?.result[0]?.totalCount;
        this.specialArray = res?.result[0]?.data;

        this.getListing();
      });
  }
  payload: any = {
    page: 1,
    size: 10,
  };
  doctorList: any;
  getListing() {
    this.apiService
      .get(
        `${API_ENDPOINTS.patient.hospitalProcedure}/${this.id}`,
        this.payload
      )
      .subscribe((res: any) => {
        this.totalCount = res?.result?.data[0]?.count;
        this.doctorList = res?.result?.data[0]?.data;
        this.doctorList?.forEach((element: any) => {
          //timing Part
          let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
          Object.keys(element.establishmentTiming).forEach((key) => {
            if (!days.includes(key)) delete element.establishmentTiming[key];
          });
          element.establishmentTiming = this.formatTime.dateTimeConversion(
            element.establishmentTiming
          );
        });
      });
  }

  changingPage(e: any) {
    this.payload.page = e;
    this.getListing();
    const element = this._document.getElementById("list-section");
    element.scrollIntoView();
  }

  selectSpecilaity(event: any) {
    this.selectedSpeciality = event?.name;
    this.payload.page = 1;
    if (event.id) {
      this.payload.speciality = event?.id;
    } else {
      this.payload.speciality = "";
    }
    this.getListing();
  }

  bookAppointment(data: any) {
    if (!data?.isActive) {
      return;
    }
    let date = this.datePipe.transform(new Date(), "EEE, d MMM");
    let obj: any = {
      fullname: data?.fullName,
      specialization: data?.specialization,
      address: `${data?.establishmentMaster?.locality || ""}, ${
        data?.establishmentMaster?.address?.city || ""
      }  `,
      city: data?.establishmentMaster?.address?.city,
      doctorProfileSlug: data?.doctorProfileSlug,
      doctorId: data.doctorId,
      doctorPic: data?.profilePic || "assets/images/svg/Nectar Favicon.svg",
      establishmentId: data?.establishmentId,
      consultationFees: data?.consultationFees,
      videoConsultationFees: data?.videoConsultationFees,
      profilePic:data?.profilePic || "assets/images/svg/Nectar Favicon.svg"
    };
    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));

    if (this.deviceWidth > 767) {
      this.dialog.open(ClinicappointmentComponent, {
        width: "490px",
        panelClass: "yespost",
        data: {
          date: date,
          id: data.doctorId,
          establishmentId: data?.establishmentId,
        },
        autoFocus: false,
        scrollStrategy: new NoopScrollStrategy(),
      });
    } else if (this.deviceWidth < 767) {
      this._bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: data.doctorId,
          establishmentIds: data?.establishmentId,
        },
      });
      data._id = data?.establishmentId;
      this.eventService.broadcastEvent("hospital-data", data);
    }
  }
  viewDoctor(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.establishmentMaster?.address?.city
      .split(" ")
      .join("-")
      .toLowerCase();
    this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
  }
}
