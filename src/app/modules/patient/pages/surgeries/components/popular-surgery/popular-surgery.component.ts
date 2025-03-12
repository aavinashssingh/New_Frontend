import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { InputValidationService } from "src/app/services/input-validation.service";
import { DepartSurgeryComponent } from "../depart-surgery/depart-surgery.component";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { EnquiryComponent } from "../enquiry/enquiry.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { EventService } from "src/app/services/event.service";
import { debounceTime, fromEvent } from "rxjs";
import { MobileDepartSugeryComponent } from "../mobile-depart-sugery/mobile-depart-sugery.component";
import { Title, Meta } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { DOCUMENT } from "@angular/common";
import { CommonService } from "src/app/services/common.service";
import { departmentqustions } from "./questiondepartment";
@Component({
  selector: "nectar-popular-surgery",
  templateUrl: "./popular-surgery.component.html",
  styleUrls: ["./popular-surgery.component.scss"],
})
export class PopularSurgeryComponent implements OnInit, OnDestroy {
  constructor(
    private ngdialog: NgDialogAnimationService,
    private apiService: ApiService,
    public cValidator: InputValidationService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private eventService: EventService,
    private title: Title,
    private seoService: SeoService,
    @Inject(DOCUMENT) public document: any,
    private commonService: CommonService
  ) { }
  deviceWidth: any;
  payload: any = {
    page: 1,
    size: 14,
    sort: "title",
    sortOrder: "ASC",
  };
  ngOnInit(): void {
    this.settingTitleAndTags();
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.payload.size = this.deviceWidth > 767 ? 14 : 10;
    this.getListing();
    this.getDepartments();
  }

  settingTitleAndTags() {
    //setting title and description
    this.title.setTitle(
      "Surgical Procedures at Nectar Home - Discover In-depth Information on Surgeries"
    );
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "At Nectar Home, we offer comprehensive information on various surgical procedures. Explore our extensive database covering surgical specialties, preoperative preparations, postoperative care, and recovery guidelines. Discover expert insights to help you make informed decisions about surgical options and find qualified surgeons. Experience a reliable resource for understanding surgeries and enhancing your healthcare knowledge at Nectar Home.",
      },
      {
        property: "og:title",
        content:
          "Surgical Procedures at Nectar Home - Discover In-depth Information on Surgeries",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: this.document.location.href,
      },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
      {
        property: "og:description",
        content:
          "At Nectar Home, we offer comprehensive information on various surgical procedures. Explore our extensive database covering surgical specialties, preoperative preparations, postoperative care, and recovery guidelines. Discover expert insights to help you make informed decisions about surgical options and find qualified surgeons. Experience a reliable resource for understanding surgeries and enhancing your healthcare knowledge at Nectar Home.",
      },
      {
        property: "og:image:alt",
        content: "A photo of a doctor performing surgery.",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "628",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: this.document.location.href,
      },
      {
        name: "twitter:title",
        content:
          "Surgical Procedures at Nectar Home - Discover In-depth Information on Surgeries",
      },
      {
        name: "twitter:description",
        content:
          "At Nectar Home, we offer comprehensive information on various surgical procedures. Explore our extensive database covering surgical specialties, preoperative preparations, postoperative care, and recovery guidelines. Discover expert insights to help you make informed decisions about surgical options and find qualified surgeons. Experience a reliable resource for understanding surgeries and enhancing your healthcare knowledge at Nectar Home.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }

  data: any;
  popular_sergury:any;
  viewMoreDepart: boolean = false;
  treatments: any = [
    { name: "dental", id: 1 },
    { name: "dental", id: 1 },
    { name: "dental", id: 1 },
  ];

  surgeryCount: number;
  getListing() {
    this.apiService
      .get(API_ENDPOINTS.patient.getSurgeryList, this.payload)
      .subscribe((res: any) => {
        this.surgeryCount = res?.result?.count;
        this.popular_sergury= res?.result?.data;
        // console.log("popular_sergury: ",this.popular_sergury);
        if (this.payload.size) {
          this.data = res?.result?.data.slice(0, this.payload.size);
        } else {
          this.data = res?.result?.data;
        }
      });
  }
  seeMore(value: boolean) {
    if (value) {
      delete this.payload.size;
      this.getListing();
    } else {
      this.payload.size = this.deviceWidth > 767 ? 14 : 10;
      this.getListing();
    }
  }

  openDialog(value: any) {
    if (value?.countOfSurgery < 1) {
      return;
    }
    if (this.deviceWidth > 767) {
      this.ngdialog.open(DepartSurgeryComponent, {
        panelClass: "ViewSurgeryAilments",
        data: {
          id: value?._id,
        },
        scrollStrategy: new NoopScrollStrategy(),
      });
    } else {
      this.bottomSheet.open(MobileDepartSugeryComponent, {
        data: { id: value?._id },
      });
    }
  }

  // openDepartmentPage(value: any) {
  //   if (value?.countOfSurgery < 1) {
  //     return;
  //   }
  //   this.router.navigate([`surgeries/department/${value?._id}`]);
  //   localStorage.setItem('departmentName', value?.name); // Use a default value if name is undefined
  //   const departmentName = value?.name || 'Default Department Name';
  //   localStorage.setItem('departmentName', departmentName);
  //   const filteredQuestions = departmentqustions.filter(question => question.name === value?.name);

  //   localStorage.setItem('filteredDepartmentQuestions', JSON.stringify(filteredQuestions));
  //   console.log('Filtered Questions:', filteredQuestions);
  // }

  departments: any = [];
  tempDeparts: any = [];
  getDepartments() {
    this.apiService
      .get(API_ENDPOINTS.patient.getDepartments, {})
      .subscribe((res: any) => {
        this.departments = res?.result;

        this.tempDeparts =
          this.deviceWidth > 767
            ? JSON.parse(JSON.stringify(this.departments))
            : this.departments.slice(0, 6);

      });
  }

  viewMoreD() {
    this.viewMoreDepart = !this.viewMoreDepart;
    if (this.viewMoreDepart) {
      this.tempDeparts = JSON.parse(JSON.stringify(this.departments));
    } else {
      this.tempDeparts = this.departments.slice(0, 6);
    }
  }

  viewSurgery(data: any) {
    this.router.navigate([`india/surgeries/${data?.slug}`]);
  }

  formatName(value: any, maxLength: number) {
    if (value.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }
  phoneNumber = environment.mobile;
  message: any =
    "Hi Nectar+ Health, I'm interested in learning more about the treatment/surgery. Can you provide me with some more information?";

  get whatsappLink(): string {
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber
      }&text=${encodeURIComponent(this.message)}`;
  }

  openBottomSheet() {
    this.bottomSheet.open(EnquiryComponent, {});
    this.eventService.broadcastEvent("remove-margin", true);
  }
  scrollTop: any;
  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scroll$ = fromEvent(window, "scroll").pipe(debounceTime(100));
    scroll$.subscribe(() => {
      const scrollTop =
        window.scrollY ||
        this.document.documentElement.scrollTop ||
        this.document.body.scrollTop ||
        0;

      this.scrollTop = scrollTop;
      if (this.deviceWidth < 767 && this.scrollTop > 100) {
        this.eventService.broadcastEvent("remove-header-mobile", true);
      } else {
        this.eventService.broadcastEvent("remove-header-mobile", false);
      }
    });
  }

  ngOnDestroy(): void {
    this.eventService.broadcastEvent("remove-header-mobile", false);
  }
}
