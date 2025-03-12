import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Subscription, debounceTime, fromEvent } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { BehvaiourEventService } from "src/app/services/behvaiour-event.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { Title, Meta } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "nectar-list-container",
  templateUrl: "./list-container.component.html",
  styleUrls: ["./list-container.component.scss"],
})
export class ListContainerComponent implements OnInit, OnDestroy {
  deviceWidth: any;
  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    dots: false,
    autoWidth: true,
    startPosition: 0,
    margin: 20,
    nav: true,
    navText: [
      '<img loading="lazy"src="assets/images/pageright.svg" alt="" height="36" width="36" >',
      '<img loading="lazy"src="assets/images/pageright.svg" alt="" height="36" width="36">',
    ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 4,
      },
      1200: {
        items: 6,
      },
    },
  };
  @ViewChild("owlCar") owlCar: any;
  payload: any = {
    page: 1,
    size: 3,
  };
  hospitalList: any = [];
  totalCount: number;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private seoService: SeoService,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getHospitalList();
    this.getFilterData();
    this.eventService.broadcastEvent("doctor-list", true);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", true);
    }
    // this.eventService.getEvent("list-scroll").subscribe((res: any) => {
    //   if (res) {
    //     this.onScroll(1);
    //   }
    // });
  }

  settingTagsAndTitles() {
    //setting title and description
    this.title.setTitle(
      "Find Doctor | Nectar Home - Discover Expert Online Consultations & Bookings"
    );
    // this.meta.addTags();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Discover expert online consultations and hassle-free hospital bookings at Nectar Home's 'Find Doctor' feature. Connect with highly skilled doctors across various specialties in India, ensuring personalized healthcare solutions at your fingertips. Take control of your well-being with Nectar Home's seamless and convenient healthcare platform.",
      },
      {
        property: "og:title",
        content: "Find Doctors | Nectar Plus Health",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://nectarplus.health/find-doctors/",
      },
      {
        property: "og:image",
        content: "https://nectarplus.health/img/doctors.png",
      },
      {
        property: "og:description",
        content:
          "Discover expert online consultations and hassle-free hospital bookings at Nectar Home's 'Find Doctor' feature. Connect with highly skilled doctors across various specialties in India, ensuring personalized healthcare solutions at your fingertips. Take control of your well-being with Nectar Home's seamless and convenient healthcare platform.",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@nectarplus",
      },
      {
        name: "twitter:title",
        content: "Find Doctors | Nectar Plus Health",
      },
      {
        name: "twitter:description",
        content:
          "Find doctors in your area who are covered by your Nectar Plus Health plan.",
      },
      {
        name: "twitter:image",
        content: "https://nectarplus.health/img/search-for-doctors.png",
      },
    ]);
  }

  isLoading: boolean = true;
  getHospitalList(obj: any = {}, scroll: boolean = false) {
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }
    this.apiService
      .postParams(`${API_ENDPOINTS.patient.getAllHospitals}`, obj, this.payload)
      .subscribe((res: any) => {
        if (this.deviceWidth < 767 && scroll) {
          this.hospitalList.push(...res?.result?.data);
        } else {
          this.hospitalList = res?.result?.data;
          // console.log("this.hospitalList: ",this.hospitalList);
        }
        this.hospitalList.forEach((element: any) => {
          this.apiService
            .postParams(
              `${API_ENDPOINTS.patient.getDoctorsUnderHospital}`,
              obj,
              {
                establishmentId: element?._id,
              }
            )
            .subscribe((res: any) => {
              element.docList = res?.result?.data;
            });
          if (this.deviceWidth > 1024) {
            this.searchDoctors(obj).subscribe((res: any) => {
              element.topDoc = res?.result?.data;
            });
          }
        });

        this.totalCount = res?.result?.count;
        this.isLoading = false;
      });


  }

  // Pagination

  changingPage(e: any) {
    this.payload.page = e;

    this.getHospitalList();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  }

  // top 3 doctors listing
  docPage: number = 1;
  searchDoctors(obj: any = {}) {
    return this.apiService.postParams(API_ENDPOINTS.doctor.searchDoctors, obj, {
      page: this.docPage++,
      size: 3,
    });
  }

  // getting filter data form filter component
  filterObject: any = {};
  subscription: Subscription;
  getFilterData() {
    let obj: any = {};
    this.subscription = this.eventService
      .getEvent("filter-doctor-list")
      .subscribe((res: any) => {
        obj = res;
        if (!obj.consultationFee) {
          delete this.filterObject.consultationFee;
        }
        if (!obj.specialty) {
          delete this.filterObject.specialty;
        }
        if (!obj.availability) {
          delete this.filterObject.availability;
        }
        if (!obj.timeOfDay) {
          delete this.filterObject.timeOfDay;
        }
        if (!obj.sortBy) {
          delete this.filterObject.sortBy;
        }
        this.filterObject = { ...this.filterObject, ...obj };
        this.getHospitalList(this.filterObject);
      });
  }

  viewHospital(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.address?.city.split(" ").join("-").toLowerCase();
    this.router.navigate([
      `${city}/hospital/${data?.establishmentProfileSlug}`,
    ]);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.behaviourSub.broadcastEvent("filter", {});
    this.eventService.broadcastEvent("doctor-list", false);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", false);
    }
  }

  onScroll(e: any) {
    if (this.totalCount > this.hospitalList.length && this.deviceWidth < 767) {
      this.payload.page = this.payload.page + 1;
      this.getHospitalList(this.filterObject, true);
    }
  }

  scrollTop: any = 10;
  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scroll$ = fromEvent(window, "scroll").pipe(debounceTime(100));
    scroll$.subscribe(() => {
      if (this.deviceWidth > 767) {
        const scrollTop =
          window.scrollY ||
          this.document.documentElement.scrollTop ||
          this.document.body.scrollTop ||
          0;
        this.scrollTop = scrollTop;
      }
    });
  }
}
