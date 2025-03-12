import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, debounceTime, fromEvent } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { BehvaiourEventService } from "src/app/services/behvaiour-event.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";
import { DOCUMENT } from "@angular/common";
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: "nectar-doctor-search-result",
  templateUrl: "./doctor-search-result.component.html",
  styleUrls: ["./doctor-search-result.component.scss"],
})
export class DoctorSearchResultComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public eventService: EventService,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private ngxLoader: NgxUiLoaderService,
    private seoService: SeoService,
    public commonService: CommonService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) public document: any
  ) {}
  city: string;
  symptomps: any;
  filterObject: any = {};
  apiHit: boolean = false;
  deviceWidth: any;
 
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
      // Scroll to top when component loads
  window.scrollTo({ top: 0, behavior: 'instant' });

    this.activatedRoute.params.subscribe((res: any) => {
      // console.log("res: ", res);
  
      this.payload.page = res?.page || 1;
  
      // Check if services are present
      if (res?.service) {
        this.payload.service = this.commonService.replaceHyphenWithSpace(res?.service);
        // Remove search if services are present
        delete this.payload.search;
        this.symptomps = ""; // Reset symptoms since search is not being used
      } else {
        // Handle search and speciality only if services are not present
        if (res?.speciality != "doctors") {
          let specialityString = this.commonService.replaceHyphenWithSpace(res?.speciality);
          this.payload.search = specialityString;
          this.symptomps = specialityString;
        } else {
          delete this.payload.search;
          this.symptomps = "";
        }
      }
  
      // Handle city
      if (res?.city) {
        this.payload.city = this.commonService.replaceHyphenWithSpace(res?.city);
        this.city = this.payload.city;
      } else {
        delete this.payload.city;
        this.city = "";
      }
  
      // Handle locality
      if (res?.locality) {
        this.payload.locality = this.commonService.replaceHyphenWithSpace(res?.locality);
      } else {
        delete this.payload.locality;
      }
  
      this.searchDoctors(this.filterObject);
      this.settingTagsAndTitles();
      this.settingSchemaMarkUp();
    });
  
    this.eventService.getEvent("list-scroll").subscribe((res: any) => {
      if (res) {
        this.onScroll(1);
      }
    });
    this.headerBroadcastEvent();
    this.getFilterData();
  }
  
  //setting title and description
  settingTagsAndTitles() {
    this.title.setTitle(
      `Best ${this.symptomps} Doctors in ${this.payload.locality || ""} ${
        this.city
      }. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`
    );
    this.seoService.updateTags([
      {
        name: "description",
        content: `Best  ${this.symptomps} Doctors in ${
          this.payload.locality || ""
        } ${
          this.city
        }. Book Doctor 24x7 Appointment Online, View Fees, User feedbacks and Address of  ${
          this.symptomps
        } in ${this.city}. Nectar Plus Health.`,
      },
      {
        property: "og:title",
        content: `Best ${this.symptomps} Doctors in ${
          this.payload.locality || ""
        } ${
          this.city
        }. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`,
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
        content: `Best  ${this.symptomps} Doctors in ${
          this.payload.locality || ""
        } ${
          this.city
        }. Book Doctor 24x7 Appointment Online, View Fees, User feedbacks and Address of  ${
          this.symptomps
        } in ${this.city}. Nectar Plus Health.`,
      },
      {
        property: "og:image:alt",
        content: "A photo of a doctor looking at a computer.",
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
        content: `Best ${this.symptomps} Doctors in ${
          this.payload.locality || ""
        } ${
          this.city
        }. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`,
      },
      {
        name: "twitter:description",
        content: `Best  ${this.symptomps} Doctors in ${
          this.payload.locality || ""
        } ${
          this.city
        }. Book Doctor 24x7 Appointment Online, View Fees, User feedbacks and Address of  ${
          this.symptomps
        } in ${this.city}. Nectar Plus Health.`,
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }

  content: any;
  payload: any = {
    page: 1,
    size: 10,
  };
  totalItems: number;
  seoData: any = [];

  isLoading: boolean = true;

  searchDoctors(obj: any = {}, scroll: boolean = false) {
    this.isLoading = true;
    this.ngxLoader.start(); 
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }

    this.apiService
    .postParams(API_ENDPOINTS.doctor.searchDoctors, obj, this.payload)
    .subscribe({
      next: (res: any) => {
        this.apiHit = true;
        this.localStorage.removeItem("coordinates");
  
        let filteredData = res?.result?.data;
  
        // Filter the data if `this.payload.locality` exists
        if (this.payload.locality) {
          const normalizedPayloadLocality = this.payload.locality.toLowerCase().trim();
  
          filteredData = filteredData.filter((doctor: any) => {
            const normalizedDoctorLocality = doctor.locality?.toLowerCase().trim();
            return normalizedDoctorLocality === normalizedPayloadLocality;
          });
        }
  
  
        // Handle content assignment based on device width and scroll
        if (this.deviceWidth < 767 && scroll) {
          this.content.push(...filteredData); // Spread operator to append array contents
        } else {
          this.content = filteredData;
        }
  
        // Update total items count after filtering
        this.totalItems = filteredData.length;
  
        this.seoData = [];
        if (res?.result?.specialization) {
          this.seoData.push(res?.result?.specialization);
        }
        if (res?.result?.procedure) {
          this.seoData.push(res?.result?.procedure);
        }
        this.isLoading = false;
        this.ngxLoader.stop();
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.ngxLoader.stop(); 
      },
    });
  
  }

  headerBroadcastEvent() {
    this.eventService.broadcastEvent("doctor-list", true);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", true);
    }
  }

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
        this.searchDoctors(this.filterObject);
      });
  }


  removeLocality(){
    const currentLocality= this.localStorage.getItem('locality');
    if (currentLocality) {
      this.localStorage.removeItem('locality');
    }
    this.eventService.broadcastEvent('clear-speciality', true)
  }
  changingPage(e: any) {
    this.payload.page = e;
    if (this.filterObject) {
      this.searchDoctors(this.filterObject);
    } else {
      this.searchDoctors();
    }

    this.router.navigate([], {
      queryParams: { page: this.payload.page },
      queryParamsHandling: "merge",
    });
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  }

  onScroll(e: any) {
    if (
      this.totalItems > this.payload.page * this.payload.size &&
      this.deviceWidth < 767
    ) {
      this.payload.page = this.payload.page + 1;
      this.searchDoctors(this.filterObject, true);
    }
  }

  ngOnDestroy(): void {
    this.eventService.broadcastEvent("doctor-list", false);
    this.localStorage.removeItem("city");
    this.localStorage.removeItem("state");
    this.localStorage.removeItem("search-address");
    this.subscription.unsubscribe();
    this.behaviourSub.broadcastEvent("filter", {});
    this.eventService.broadcastEvent("doctor-list", false);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", false);
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

  settingSchemaMarkUp() {
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": this.document.location.origin,
            name: "Home",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `${this.document.location.origin}/${this.payload.city}/doctors`,
            name: this.payload.city,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": this.document.location.href,
            name: this.payload.search,
          },
        },
      ],
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }
}
