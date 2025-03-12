import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { Subject, debounceTime, distinctUntilChanged, fromEvent } from "rxjs";
import { LocalStorageService } from "src/app/services/storage.service";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { DOCUMENT, Location, isPlatformBrowser } from "@angular/common";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { SearchSuggestionsMobileComponent } from "src/app/shared/components/search-suggestions-mobile/search-suggestions-mobile.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { CommonService } from "src/app/services/common.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { NgxUiLoaderService } from "ngx-ui-loader";

@Component({
  selector: "nectar-hospital-details",
  templateUrl: "./hospital-details.component.html",
  styleUrls: ["./hospital-details.component.scss"],
})
export class HospitalDetailsComponent implements OnInit {
  @ViewChild("symptoms") symptoms: ElementRef<HTMLInputElement>;
  @ViewChild("location") location: ElementRef<HTMLInputElement>;
  deviceWidth: any;
  selected = 0;
  hospitalId: any;
  tabContent: any = [
    {
      name: "About",
    },
    {
      name: "Doctors",
      count: 0,
    },
    {
      name: "Procedures",
    },

    {
      name: "Services",
    },

    {
      name: "FAQs",
    },
    {
      name: "Videos",
    },
    {
      name: "Review",
      count: 0,
    },
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public gService: GoogleMapsService,
    private localStorage: LocalStorageService,
    public eventService: EventService,
    public locations: Location,
    private bottomSheet: MatBottomSheet,
    public commonService: CommonService,
    private title: Title,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private formatTime: FormatTimeService,
    private loader: NgxUiLoaderService,
    @Inject(DOCUMENT) public document: any,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
  
  
      this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm: string) => {
        this.fetchSuggestions(searchTerm);
      });
  
  
    }
  
    private fetchSuggestions(searchTerm: string): void {
      this.apiService.searchSuggestions(searchTerm).subscribe((res: any) => {
        this.specialityOptions = res?.result?.data?.specializationData?.data || [];
        this.servicesOptions = res?.result?.data?.procedureData?.data || [];
        this.hospitalsOptions = res?.result?.data?.hospitalData?.data || [];
        this.doctorsOptions = res?.result?.data?.doctorData?.data || [];
        this.clinicOptions = res?.result?.data?.clinicData?.data || [];
      });
    }
  
    getSuggestionList(event: any): void {
      const inputValue = event.target.value;
      if (inputValue && inputValue.length > 2) {
        this.searchSubject.next(inputValue);
      }
      
  }
  placePredictions: any[] = [];
  searchSubject: Subject<string> = new Subject();
  placeService: any;

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("remove-header-mobile", true);
    }
    this.activatedRoute.params.subscribe((res: any) => {
      const docSlug = res?.slug;
      const city = this.commonService.replaceHyphenWithSpace(res?.city);
      this.apiService
        .get(API_ENDPOINTS.COMMON.getIdFromSlug, {
          profileSlug: docSlug,
          city: city,
        })
        .subscribe((res: any) => {
          this.hospitalId = res?.result?.data?.establishmentId;
          this.selected = 0;
          this.getHospitalDetail();
        });
    });

    this.getSearchValue();
  }

  ngAfterViewInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params["city"]) {
        let city = this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(params["city"])
        );
        this.location.nativeElement.value = city;
        this.localStorage.setItem("search-address", city);
      } else {
        if (isPlatformBrowser(this.platformId)) {
          // this.location.nativeElement.value = "Delhi";
        }
      }
    });
  }

  settingTagsAndTitles() {
    this.title.setTitle(
      `${this.hospitalDetail?.name}, ${this.hospitalDetail?.hospitalType} in ${this.hospitalDetail?.address?.locality}, ${this.hospitalDetail?.address?.city} | Nectar Plus Health`
    );
    this.seoService.updateTags([
      {
        name: "description",
        content: `${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city}. Book Appointments Online, View Doctor Fees, address, for ${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city} | Nectar Plus Health`,
      },
      {
        property: "og:title",
        content: `${this.hospitalDetail?.name}, ${this.hospitalDetail?.hospitalType} in ${this.hospitalDetail?.address?.locality}, ${this.hospitalDetail?.address?.city} | Nectar Plus Health`,
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
        content: this.hospitalDetail?.profilePic,
      },
      {
        property: "og:description",
        content: `${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city}. Book Appointments Online, View Doctor Fees, address, for ${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city} | Nectar Plus Health`,
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
        content: `${this.hospitalDetail?.name}, ${this.hospitalDetail?.hospitalType} in ${this.hospitalDetail?.address?.locality}, ${this.hospitalDetail?.address?.city} | Nectar Plus Health`,
      },
      {
        name: "twitter:description",
        content: `${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city}. Book Appointments Online, View Doctor Fees, address, for ${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city} | Nectar Plus Health`,
      },
      {
        name: "twitter:image",
        content: this.hospitalDetail?.profilePic,
      },
    ]);
  }

  onSearch(event: any) {
    const value = event.target.value;
    if (value) {
      this.searchSubject.next(value);
    } else {
      this.placePredictions = [];
    }
  }
  getSearchValue() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((res: any) => {
      this.onSearchInput(res);
    });
  }
  onSearchInput(value: string) {
    if (value?.length) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.placePredictions = predictions;
          } else {
            this.placePredictions = [];
          }
        }
      );
    } else {
      this.placePredictions = [];
    }
  }

  search(e: any) {
    if (e.code == "Enter") {
      let obj: any = {};
      if (this.symptoms.nativeElement.value) {
        obj.filter = this.commonService.replaceSpaceWithHyphen(
          this.symptoms.nativeElement.value
        );
      }
      if (this.location.nativeElement.value) {
        let location =
          this.selectedCity ||
          this.currentCity ||
          this.location.nativeElement.value;
        obj.location = this.commonService.replaceSpaceWithHyphen(location);
      }
      if (this.selectedSubLocality) {
        this.selectedSubLocality = this.commonService.replaceSpaceWithHyphen(
          this.selectedSubLocality
        );
      }
      if (obj.location && obj.filter) {
        this.router.navigate([
          `/${obj.location}/${obj.filter}/${this.selectedSubLocality || ""}`,
        ]);
      }
    }
  }

  openLoginDialog() {
    this.dialog.open(LoginModalComponent, {
      disableClose: true,
      data: { type: "hospital" },
      autoFocus: false,
    });
  }

  hospitalDetail: any;
  getHospitalDetail() {
    this.loader.start();
    if (!this.hospitalId) return;

    this.apiService
      .get(`${API_ENDPOINTS.patient.hospitalProfile}`, {
        establishmentId: this.hospitalId,
      })
      .subscribe((res: any) => {
        this.hospitalDetail = res?.result[0];
        this.loader.stop();
        let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        if (this.hospitalDetail.establishmentTiming) {
          Object.keys(this.hospitalDetail.establishmentTiming).forEach(
            (key) => {
              if (!days.includes(key))
                delete this.hospitalDetail.establishmentTiming[key];
            }
          );
        }
        this.settingTagsAndTitles();
        this.settingSchemaMarkUpForBreadcrumb();
        this.gettingReviewData();
        this.tabContent[1].count = this.hospitalDetail?.doctorCount;
        this.tabContent[6].count = this.hospitalDetail?.reviews;
      });
  }
  selectedCity: string;
  selectedSubLocality: string;
  getPlace(data: any) {
    this.localStorage.setItem("search-address", data?.description);
    this.gService.getAddressComponents(data?.place_id).then((res: any) => {
      res?.address_components.forEach((e: any) => {
        if (e.types.includes("administrative_area_level_3")) {
          this.selectedCity = e.long_name;
        } else if (
          e.types.includes("sublocality_level_1") ||
          e.types.includes("sublocality")
        ) {
          this.selectedSubLocality = e.long_name;
        }
      });
      let lng = res?.geometry?.location?.lng();
      let lat = res?.geometry?.location?.lat();
      this.localStorage.setItem("coordinates", JSON.stringify([lng, lat]));
      if (!this.symptoms.nativeElement.value) {
        this.symptoms.nativeElement.focus();
        // this.specialization();
      }
      this.search({ code: "Enter" });
    });
  }

  specialization() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specialityOptions = res?.result?.data;
      });
  }
  getCurrentCity() {
    this.gService
      .getCurrentCity()
      .then((city) => {
        this.currentCity = city;
        this.localStorage.setItem("city", city);
        this.location.nativeElement.value = this.currentCity;
        if (!this.symptoms.nativeElement.value) {
          this.symptoms.nativeElement.focus();
          // this.specialization();
        }
        this.search({ code: "Enter" });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  specialityOptions: any = [];
  servicesOptions: any = [];
  doctorsOptions: any = [];
  hospitalsOptions: any = [];
  clinicOptions: any = [];

  currentCity: any;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;


 


  closeSuggestion(data: string) {
    this.autocomplete.closePanel();
    if (data == "symptomps") {
      this.symptoms.nativeElement.value = "";
    } else {
      this.location.nativeElement.value = "";
    }
  }

  focusOnLocation() {
    if (!this.location.nativeElement.value) {
      setTimeout(() => {
        this.location.nativeElement.focus();
      }, 0);
    }
  }

  getSuggestion(data: any, type: string) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(data?.address?.city);
    if (type == "doctor") {
      this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
    } else if (type == "hospital") {
      this.eventService.broadcastEvent("hospital-route", data?._id);
      this.router.navigate([
        `${city}/hospital/${data?.establishmentProfileSlug}`,
      ]);
    }
  }

  tabChange(num: number) {
    this.selected = num;
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  openShareDialog() {
    this.dialog.open(ShareModalComponent, {
      panelClass: "shareModal",
      data: { name: "hospital profile" },
    });
  }

  ngOnDestroy() {
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("remove-header-mobile", false);
    }
  }

  openBottomSheet() {
    if (this.deviceWidth < 767) {
      this.bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: { type: "both" },
        panelClass: "search-bottom-sheet",
      });
    }
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
    });
  }
  formatName(value: any, maxLength) {
    if (value?.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  settingSchemaMarkUpForBreadcrumb() {
    let city = this.commonService.replaceSpaceWithHyphen(
      this.hospitalDetail?.address?.city
    );
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
            "@id": `${this.document.location.origin}/${city}/doctors`,
            name: this.hospitalDetail?.address?.city,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `${this.document.location.origin}/${city}/doctors`,
            name: this.hospitalDetail?.hospitalType,
          },
        },

        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@id": this.document.location.href,
            name: this.hospitalDetail?.name,
          },
        },
      ],
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  gettingReviewData() {
    let reviewArray: any;
    this.eventService.getEvent("sharing-reviews").subscribe((res: any) => {
      if (res) {
        reviewArray = res?.map((item: any) => {
          return {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: item?.patientName,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: item?.rating,
            },
            reviewBody: item?.feedback,
          };
        });
      }
      this.settingSchemaMarkupForProfile(reviewArray);
    });
  }
  settingSchemaMarkupForProfile(reviewArray: any = "") {
    let timeArray: any = [];
    for (let key in this.hospitalDetail?.establishmentTiming) {
      let hrsString;
      let startTime =
        this.hospitalDetail?.establishmentTiming?.[key]?.[0]?.["from"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[1]?.["from"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[2]?.["from"];
      let endTime =
        this.hospitalDetail?.establishmentTiming?.[key]?.[2]?.["to"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[1]?.["to"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[0]?.["to"];
      if (startTime && endTime) {
        hrsString = this.formatTime.convertTo24HourFormat(startTime, endTime);
        let timeString = `${key.slice(0, 2)} ${hrsString}`;
        timeArray.push(timeString);
      }
    }
    const jsonLdData = {
      "@context": "http://schema.org",
      "@type":
        this?.hospitalDetail?.hospitalTypeDetails?.category == 1
          ? "Hospital"
          : "MedicalClinic",
      name: this.hospitalDetail?.name,
      url: this.document.location.href,
      address: {
        "@type": "PostalAddress",
        streetAddress: this.hospitalDetail?.address?.locality,
        addressLocality: this.hospitalDetail?.address?.city,
        addressRegion: this.hospitalDetail?.stateName?.name,
        postalCode: this.hospitalDetail?.address?.pincode,
      },
      openingHours: timeArray,
      medicalSpecialty: this.hospitalDetail?.specialization?.map(
        (item: any) => {
          return item?.name;
        }
      ),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: this.hospitalDetail?.rating,
        reviewCount: this.hospitalDetail?.reviews,
      },
      review: reviewArray,
      image: [
        {
          "@type": "ImageObject",
          url: this.hospitalDetail?.profilePic,
        },
      ],
      geo: {
        "@type": "GeoCoordinates",
        latitude: this.hospitalDetail?.location?.coordinates?.[1],
        longitude: this.hospitalDetail?.location?.coordinates?.[0],
      },
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }
}
