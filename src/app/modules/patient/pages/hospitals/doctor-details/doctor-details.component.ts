import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { LocalStorageService } from "src/app/services/storage.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { Subject, debounceTime, distinctUntilChanged, fromEvent } from "rxjs";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import {
  DOCUMENT,
  DatePipe,
  Location,
  isPlatformBrowser,
} from "@angular/common";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SelectEstablishmentComponent } from "../select-establishment/select-establishment.component";
import { BottomSheetClinicVisitComponent } from "src/app/shared/components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { SearchSuggestionsMobileComponent } from "src/app/shared/components/search-suggestions-mobile/search-suggestions-mobile.component";
import { CommonService } from "src/app/services/common.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { FormatTimeService } from "src/app/services/format-time.service";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { environment } from "src/environments/environment";
import {
  DOCTOR_DETAILS_KEY,
  TransferStateService,
} from "src/app/services/transfer-state.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: "nectar-doctor-details",
  templateUrl: "./doctor-details.component.html",
  styleUrls: ["./doctor-details.component.scss"],
  providers: [],
})
export class DoctorDetailsComponent implements OnInit, OnDestroy {
  bookAppointment: boolean = false;
  currentCity: any;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  selectedState: string;
  cities: any;
  isScrolled: boolean = false; // Variable to track scroll state
  searchSource: string;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private gService: GoogleMapsService,
    public locations: Location,
    private _bottomSheet: MatBottomSheet,
    private datePipe: DatePipe,
    public commonService: CommonService,
    private title: Title,
    private renderer: Renderer2,
    private seoService: SeoService,
    private formatPipe: FormatarrayPipe,
    private _renderer2: Renderer2,
    private formatTime: FormatTimeService,
    private loader: NgxUiLoaderService,
    @Inject(DOCUMENT) public document: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferStateService: TransferStateService,
    private http: HttpClient
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

  doctorId: any;
  userId: any;
  @ViewChild("symptoms") symptoms: ElementRef<HTMLInputElement>;
  @ViewChild("location") location: ElementRef<HTMLInputElement>;
  placePredictions: any[] = [];
  searchSubject: Subject<string> = new Subject();
  citySearchSubject: Subject<string> = new Subject();

  placeService: any;
  estabId: string;
  deviceWidth: any;
  doctor_Specialization: any;

  message: string;
  oninitLocationFocusFlag: any = true
  ngOnInit(): void {
    this.localStorage.removeItem("viewDoctorProfileFlag")
    this.getCurrentCity();
    this.activateRoute.params.subscribe((res: any) => {
      const docSlug = res?.slug;

      const city = this.commonService.replaceHyphenWithSpace(res?.city);

      this.apiService
        .get(API_ENDPOINTS.COMMON.getIdFromSlug, {
          profileSlug: docSlug,
          city: city,
        })
        .subscribe((res: any) => {
          if (!res?.result?.data?.doctorId) this.router.navigate(["/404"]);

          this.doctorId = res?.result?.data?.doctorId;

          this.estabId = res?.result?.data?.establishmentId;
          this.selected = 0;

          this.getDoctorDetail();
        });
    });

    this.deviceWidth = this.commonService.gettingWinowWidth();

    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("remove-header-mobile", true);
    }

    this.getSearchValue();
    // this.get_All_procedure();
  }

  settingTagsAndTitles() {
    this.title.setTitle(
      `${this.doctorDetail?.fullName}- ${this.formatPipe.transform(
        this.doctorDetail?.specialization,
        "name"
      )} - Book Doctor Appointment Online, View Fees, Patient Stories | Nectar Health`
    );
    this.seoService.updateTags([
      {
        name: "description",
        content: `${this.doctorDetail?.fullName} is ${this.formatPipe.transform(
          this.doctorDetail?.specialization,
          "name"
        )} in ${this.selectedHospital?.address?.locality}, ${this.selectedHospital?.address?.city
          }. Book appointments Online, View Fees, Patient Testimonials for ${this.doctorDetail?.fullName
          } | Nectar Health`,
      },
      {
        property: "og:title",
        content: `${this.doctorDetail?.fullName}- ${this.formatPipe.transform(
          this.doctorDetail?.specialization,
          "name"
        )} - Book Doctor Appointment Online, View Fees, Patient Stories | Nectar Health`,
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
        content: this.doctorDetail?.profilePic,
      },
      {
        property: "og:description",
        content: `${this.doctorDetail?.fullName} is ${this.formatPipe.transform(
          this.doctorDetail?.specialization,
          "name"
        )} in ${this.selectedHospital?.address?.locality}, ${this.selectedHospital?.address?.city
          }. Book appointments Online, View Fees, Patient Testimonials for ${this.doctorDetail?.fullName
          } | Nectar Health`,
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
        content: `${this.doctorDetail?.fullName}- ${this.formatPipe.transform(
          this.doctorDetail?.specialization,
          "name"
        )} - Book Doctor Appointment Online, View Fees, Patient Stories | Nectar Health`,
      },
      {
        name: "twitter:description",
        content: `${this.doctorDetail?.fullName} is ${this.formatPipe.transform(
          this.doctorDetail?.specialization,
          "name"
        )} in ${this.selectedHospital?.address?.locality}, ${this.selectedHospital?.address?.city
          }. Book appointments Online, View Fees, Patient Testimonials for ${this.doctorDetail?.fullName
          } | Nectar Health`,
      },
      {
        name: "twitter:image",
        content: this.doctorDetail?.profilePic,
      },
    ]);
  }

  ngAfterViewInit(): void {
    this.activateRoute.params.subscribe((params) => {
      if (params["city"]) {
        let city = this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(params["city"])
        );
      
        if(params["locality"]){
          let locality = this.commonService.titleCase(
            this.commonService.replaceHyphenWithSpace(params["locality"])
          );
        }

        this.location.nativeElement.value = city;
        this.localStorage.setItem("search-address", city);
      } else {
        if (isPlatformBrowser(this.platformId)) {
          // this.location.nativeElement.value = "Delhi";
        }
      }
    });
  }
  onSearch(event: any) {
    // const value = event.target.value;
    // if (value) {
    //   this.searchSubject.next(value);
    // } else {
    //   this.placePredictions = [];
    // }

    const inputValue = event.target.value;
    this.citySearchSubject.next(inputValue); // Trigger the subject
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
  selected = 0;
  // tabContent: any = [
  //   {
  //     name: "About",
  //     img: "assets/images/svg/info-icon.svg",
  //   },
  //   {
  //     name: "Services",
  //     img: "assets/images/svg/services.svg",
  //   },
  //   {
  //     name: "Videos",
  //     img: "assets/images/svg/videos.svg",
  //   },
  //   {
  //     name: "FAQs",
  //     img: "assets/images/svg/faq.svg",
  //   },
  //   {
  //     name: "Review",
  //     img: "assets/images/svg/review.svg",
  //     count: 0,
  //   },
  //   {
  //     name: "Procedure",
  //     img: "assets/images/svg/services.svg",
  //     count: 0,
  //   },
  // ];

  tabContent: any = [
    {
      name: "About",
      img: "assets/images/svg/info-icon.svg",
    },
    {
      name: "Services",
      img: "assets/images/svg/services.svg",
    },
    // {
    //   name: "Procedure",
    //   img: "assets/images/svg/services.svg",
    //   count: 0,
    // },
    {
      name: "Videos",
      img: "assets/images/svg/videos.svg",
    },
    {
      name: "FAQs",
      img: "assets/images/svg/faq.svg",
    },
    {
      name: "Review",
      img: "assets/images/svg/review.svg",
      count: 0,
    }
   
  ];

  openShareDialog() {
    this.dialog.open(ShareModalComponent, {
      panelClass: "shareModal",
      data: { name: "doctor profile" },
      scrollStrategy: new NoopScrollStrategy(),
    });
  }

  openLoginDialog() {
    this.dialog.open(LoginModalComponent, {
      disableClose: true,
      data: {
        name: JSON.stringify(this.doctorDetail?.fullName),
        type: "doctor",
        claimProfile: true,
        profile: this.doctorDetail?.profilePic, // Send the entire doctor profile
        specializationName: this.doctorDetail?.specialization[0]?.name // Send Specialization.name
      },
      autoFocus: false,
    });
  }
  doctorDetail: any;
  selectedHospital: any;

  getDoctorDetail() {
    if (!this.doctorId) return;

    this.loader.start();

    this.transferStateService
      .checkAndGetData(
        DOCTOR_DETAILS_KEY(this.doctorId),
        this.apiService.get(`${API_ENDPOINTS.patient.doctorDetail}`, {
          doctorId: this.doctorId,
        }),
        []
      )
      .subscribe((res: any) => {
        this.doctorDetail = res?.result[0];
        this.selectedHospital = this.doctorDetail?.establishmentmaster?.[0];
        this.loader.stop();
        this.settingTagsAndTitles();
        this.getAppointmentCounts(this.doctorId, this.selectedHospital?._id);
        this.settingSchemaMarkUpForBreadcrumb();
        this.gettingReviewData();
        if (!this.doctorDetail.profilePic) {
          this.doctorDetail.profilePic = "assets/images/svg/Nectar Favicon.svg";
        }
        this.tabContent[4].count = this.doctorDetail?.totalReview || 0;
        this.doctor_Specialization=this.doctorDetail?.specialization;
        this.localStorage.removeItem("doctor-detail")
        let obj: any = {
          fullname: this.doctorDetail?.fullName,
          specialization: this.doctorDetail?.specialization,
          address: `${this.doctorDetail?.establishmentmaster[0]?.address?.locality || ""
            }, ${this.doctorDetail?.establishmentmaster[0]?.address?.city || ""
            }  `,
          city: this.doctorDetail?.establishmentmaster[0]?.address?.city,
          doctorProfileSlug: this.doctorDetail?.doctorProfileSlug,
          doctorId: this.doctorId,
          doctorPic: this.doctorDetail?.profilePic || "assets/images/svg/Nectar Favicon.svg",
          consultationFees: this.doctorDetail?.consultationFees,
          videoConsultationFees: this.doctorDetail?.videoConsultationFees,
          consultationDetails: this.doctorDetail?.consultationDetails,
          consultationType: this.doctorDetail?.consultationType,
          profilePic: this.doctorDetail?.profilePic || "assets/images/svg/Nectar Favicon.svg"
        };

        this.localStorage.setItem("doctor-detail", JSON.stringify(obj));

        this.localStorage.setItem("doctorInformation", JSON.stringify(obj))


        if (isPlatformBrowser(this.platformId))
          this.message = `Hi Nectar+ Health, I'm interested in booking a appointment with ${this.doctorDetail?.fullName} (${window?.location}). Can you provide me with some more information?`;
          this.get_All_procedure();
      });
  }

// doctorDetail$ = new BehaviorSubject<any>(null);
// selectedHospital: any;

// getDoctorDetail() {
//   if (!this.doctorId) return;

//   this.loader.start();

//   this.transferStateService
//     .checkAndGetData(
//       DOCTOR_DETAILS_KEY(this.doctorId),
//       this.apiService.get(`${API_ENDPOINTS.patient.doctorDetail}`, {
//         doctorId: this.doctorId,
//       }),
//       []
//     )
//     .subscribe((res: any) => {
//       const doctorDetail = res?.result[0];
//       this.doctorDetail = doctorDetail;
//       this.selectedHospital = doctorDetail?.establishmentmaster?.[0];

//       this.loader.stop();
//       this.settingTagsAndTitles();
//       this.getAppointmentCounts(this.doctorId, this.selectedHospital?._id);
//       this.settingSchemaMarkUpForBreadcrumb();
//       this.gettingReviewData();

//       if (!doctorDetail.profilePic) {
//         doctorDetail.profilePic = "assets/images/svg/Nectar Favicon.svg";
//       }

//       this.tabContent[4].count = doctorDetail?.totalReview || 0;
//       this.doctor_Specialization = doctorDetail?.specialization;

//       // Store doctor details locally
//       let obj: any = {
//         fullname: doctorDetail?.fullName,
//         specialization: doctorDetail?.specialization,
//         address: `${doctorDetail?.establishmentmaster?.[0]?.address?.locality || ""}, 
//                   ${doctorDetail?.establishmentmaster?.[0]?.address?.city || ""}`,
//         city: doctorDetail?.establishmentmaster?.[0]?.address?.city,
//         doctorProfileSlug: doctorDetail?.doctorProfileSlug,
//         doctorId: this.doctorId,
//         doctorPic: doctorDetail?.profilePic || "assets/images/svg/Nectar Favicon.svg",
//         consultationFees: doctorDetail?.consultationFees,
//         videoConsultationFees: doctorDetail?.videoConsultationFees,
//         consultationDetails: doctorDetail?.consultationDetails,
//         consultationType: doctorDetail?.consultationType,
//         profilePic: doctorDetail?.profilePic || "assets/images/svg/Nectar Favicon.svg"
//       };

//       this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
//       this.localStorage.setItem("doctorInformation", JSON.stringify(obj));

//       // Emit updated doctor details
//       this.doctorDetail$.next(doctorDetail);

//       if (isPlatformBrowser(this.platformId)) {
//         this.message = `Hi Nectar+ Health, I'm interested in booking an appointment with ${doctorDetail?.fullName} (${window?.location}). Can you provide me with some more information?`;
//       }

//       // Fetch procedures after setting specialization
//       this.get_All_procedure();
//     });
// }


  phoneNumber = environment.mobile;

  // get whatsappLink(): string {
  //   // this.setdigitalSCript()
  //   return `https://api.whatsapp.com/send?phone=${this.phoneNumber
  //     }&text=${encodeURIComponent(this.message)}`;

  // }

  
  setdigitalSCript() {
    this.seoService.appendScript(
      ` function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-11399196295/UzysCPutmPgYEIfdx7sq',
      'event_callback': callback
  })
`,
      this.renderer
    );
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

  hospitalData: any;
  enableBackdrop(e: any) {
    this.hospitalData = e;
    this.bookAppointment = true;
    window.scroll(0, 0);
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
        this.specialization();
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

  // getCurrentCity() {
  //   this.gService
  //     .getCurrentCity()
  //     .then((city) => {
  //       this.currentCity = city;
  //       this.localStorage.setItem("city", city);
  //       this.location.nativeElement.value = this.currentCity;
  //       if (!this.symptoms.nativeElement.value) {
  //         this.symptoms.nativeElement.focus();
  //         this.specialization();
  //       }
  //       this.search({ code: "Enter" });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }

  specialityOptions: any = [];
  servicesOptions: any = [];
  doctorsOptions: any = [];
  hospitalsOptions: any = [];
  clinicOptions: any = [];
  filteredCities = [];

 

  onCitySearch(event: any): void {
    const inputValue = event.target.value.toLowerCase();
    
    this.filteredCities = this.cities.filter(city => {
      return (city.name && city.name.toLowerCase().includes(inputValue)) ||
             (city.locality && city.locality.toLowerCase().includes(inputValue));
    });
  }


  onCitySelect(event: any): void {
    const selectedValue = event.source.value; // city.name from the mat-option value
    // Set the input value to the selected city name
    this.location.nativeElement.value = selectedValue;
  
    // Find the full city object from the list using its name
    const matchingCity = this.cities.find(city => city.name === selectedValue);
  
    if (matchingCity) {
      if (matchingCity.source === 'state') {
        this.searchSource = 'state';
        this.localStorage.setItem("city", matchingCity.name);
        this.currentCity = matchingCity.name;
      } else if (matchingCity.source === 'establishment') {
        this.searchSource = 'establishment';
        this.selectedSubLocality = matchingCity.city;
        this.localStorage.setItem("city", matchingCity.city);
        this.localStorage.setItem("locality", matchingCity.name);
        this.currentCity = matchingCity.name;
      }
    }
  }
  
  
  validateCity(event: any): void {
    const enteredCity = event.target.value.trim();
  
    const matchingCity = this.filteredCities.find(city => 
      city.name === enteredCity || (city.locality && city.locality === enteredCity)
    );
  
    if (matchingCity) {
      // Valid city found
      this.currentCity = matchingCity.name;
      this.searchSource = matchingCity.source;
      if (matchingCity.source === 'establishment') {
        this.selectedSubLocality = matchingCity.city;
      }
    } else {
      // Invalid city, clear the input
      event.target.value = '';
      this.currentCity = '';
      this.searchSource = '';
      this.selectedSubLocality = '';
    }
  }

  
  // getCurrentCity() {
  //   this.activateRoute.params.subscribe((res: any) => {
  //     if(res.city){
  //       this.currentCity = res.city;
  //       this.localStorage.setItem("city", this.currentCity);
        
  //       this.location.nativeElement.value = this.currentCity;
  
  //     }
  //     if(res.locality){
  //       this.currentCity = res.locality;
  //       this.localStorage.setItem("locality", this.currentCity);
  //       this.location.nativeElement.value = this.currentCity;
  //     }
      
  //   });
  // }
  getCurrentCity() {
    this.activateRoute.params.subscribe((res: any) => {
      if (this.location) {  
        if (res.city) {
          this.currentCity = res.city;
          this.localStorage.setItem("city", this.currentCity);
          this.location.nativeElement.value = this.currentCity;
        }
        if (res.locality) {
          this.currentCity = res.locality;
          this.localStorage.setItem("locality", this.currentCity);
          this.location.nativeElement.value = this.currentCity;
        }
      }
    });
  }


  setSelectedCity(city: string) {
    this.selectedCity = city;
  }



  setSelectedState(state: string) {
    this.selectedState = state;
  }

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
      this.eventService.broadcastEvent("doctor-route", data?._id);
      this.eventService.broadcastEvent("doctor-clinic", {
        id: data._id,
        establishmentId: data?.establishmentId,
      });
      this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
    } else if (type == "hospital") {
      this.eventService.broadcastEvent("hospital-route", data?._id);
      this.router.navigate([
        `${city}/hospital/${data?.establishmentProfileSlug}`,
      ]);
    }
  }

  tabChangeReview() {
    this.selected = 6;
    scrollTo(0, 0);
  }

  openBottomSheet(type: any, data: any = {}, date1: any = new Date()) {
    let date = this.datePipe.transform(date1 || new Date(), "EEE, d MMM");

    if (type == "Hospital") {
      let bottomsheet = this._bottomSheet.open(SelectEstablishmentComponent, {
        data: { doctorId: this.doctorId, type: "doctor-listing" },
      });

      bottomsheet.afterDismissed().subscribe((res: any) => {
        if (res) {
          this.selectedHospital = this.doctorDetail?.establishmentmaster.find(
            (obj) => obj._id === res._id
          );
          this.getAppointmentCounts(this.doctorId, this.selectedHospital._id);
        }
      });
    } else {
      this._bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: this.doctorId,
          establishmentIds: this.estabId,
          date,
        },
      });
      this.eventService.broadcastEvent("hospital-data", { _id: this.estabId });
    }
  }

  dateRange: any = [];
  getAppointmentCounts(doctorId, hospitalId) {
    if (this.deviceWidth < 767) {
      let payload = {
        doctorId: doctorId,
        establishmentId: hospitalId,
      };
      this.apiService
        .get(`${API_ENDPOINTS.patient.getAppointmentCountsDaily}`, payload)
        .subscribe({
          next: (res: any) => {
            this.dateRange = res?.result?.dateRange;
          },
          error: (err) => {
            console.log(err);
            this.dateRange = [];
          },
        });
    }
  }

  ngOnDestroy() {
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("remove-header-mobile", false);
    }
  }

  openBottomSheet1() {
    if (this.deviceWidth < 767) {
      this._bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: { type: "both" },
        panelClass: "search-bottom-sheet",
      });
    }
  }

  scrollTop: any;
  @HostListener("window:scroll", [])
  onWindowScroll() {
    fromEvent(window, "scroll")
      .pipe(debounceTime(100)) // Debounce to limit event firing
      .subscribe(() => {
        this.scrollTop =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      });

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 100;
    this.isScrolled = scrollPosition > 100;
  }

  formatName(value: any, maxLength) {
    if (value?.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  breadcrumbRedirection(type: any) {
    const city = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail?.establishmentmaster[0]?.address?.city
    );
    const specailization = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail.specialization?.[0]?.name
    );
    if (type != "city") {
      const locality = this.commonService.replaceSpaceWithHyphen(
        this.doctorDetail?.establishmentmaster[0]?.address?.locality
      );
      this.localStorage.setItem("search-address", locality);
      this.router.navigate([`/${city}/${specailization}/${locality}`]);
    } else {
      this.localStorage.setItem("search-address", city);
      this.router.navigate([`/${city}/${specailization}`]);
    }
  }

  settingSchemaMarkUpForBreadcrumb() {
    const city = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail?.establishmentmaster[0]?.address?.city
    );
    const specailization = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail.specialization?.[0]?.name
    );
    const locality = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail?.establishmentmaster[0]?.address?.locality
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
            "@id": `${this.document.location.origin}/${city}/${specailization}`,
            name: this.selectedHospital?.address?.city,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `${this.document.location.origin}/${city}/${specailization}`,
            name: this.doctorDetail?.specialization[0]?.name,
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@id": `${this.document.location.origin}/${city}/${specailization}/${locality}`,
            name: this.selectedHospital?.address?.locality,
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@id": this.document.location.href,
            name: this.doctorDetail?.fullName,
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
    let timingObject = JSON.parse(
      JSON.stringify(
        this.doctorDetail?.establishmentmaster?.[0]?.establishmenttiming?.[0]
      )
    );
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    if (timingObject) {
      Object.keys(timingObject).forEach((key) => {
        if (!days.includes(key)) delete timingObject[key];
      });
    }
    let timeArray: any = [];
    for (let key in timingObject) {
      let hrsString;
      let startTime =
        timingObject?.[key]?.[0]?.["from"] ||
        timingObject?.[key]?.[1]?.["from"] ||
        timingObject?.[key]?.[2]?.["from"];
      let endTime =
        timingObject?.[key]?.[2]?.["to"] ||
        timingObject?.[key]?.[1]?.["to"] ||
        timingObject?.[key]?.[0]?.["to"];
      if (startTime && endTime) {
        hrsString = this.formatTime.convertTo24HourFormat(startTime, endTime);
        let timeString = `${key.slice(0, 2)} ${hrsString}`;
        timeArray.push(timeString);
      }
    }
    let addressArray = this.doctorDetail?.establishmentmaster?.map(
      (item: any) => {
        return {
          "@type": "PostalAddress",
          streetAddress:
            item?.address?.landmark + "," + item?.address?.locality,
          addressLocality: item?.address?.city,
          addressRegion: item?.stateName?.[0],
          postalCode: item?.address?.pincode,
        };
      }
    );

    const geoArray = this.doctorDetail?.establishmentmaster?.map(
      (item: any) => {
        return {
          "@type": "GeoCoordinates",
          latitude: item?.location?.coordinates[1],
          longitude: item?.location?.coordinates[0],
        };
      }
    );

    const jsonLdData = {
      "@context": "http://schema.org",
      "@type": "Physician",
      name: this.doctorDetail?.fullName,
      url: this.document.location.href,
      image: this.doctorDetail?.profilePic,
      address: addressArray,
      medicalSpecialty: this.doctorDetail?.specialization.map((item: any) => {
        return item?.name;
      }),
      availableService: this.doctorDetail?.service.map((item: any) => {
        return item?.name;
      }),
      hospitalAffiliation: this.doctorDetail?.establishmentmaster?.map(
        (item: any) => {
          return item?.name;
        }
      ),
      review: reviewArray || [],
      geo: geoArray,
      sameAs: this.doctorDetail?.social?.map((item: any) => {
        return item?.url;
      }),
      priceRange: this.doctorDetail?.establishmentmaster?.map((item: any) => {
        return item?.consultationFees;
      }),

      openingHours: timeArray,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: this.doctorDetail?.rating,
        reviewCount: this.doctorDetail?.totalReview,
      },
    };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  menus: any = [
    {
      name: "Find the doctors",
      route: "/hospital-list",
      icon: "assets/images/svg/search.svg",
    },
    {
      name: "Surgeries",
      route: "/surgeries",
      icon: "assets/images/svg/mat-surgeries.svg",
    },
    {
      name: "Medicines",
      route: "/medicines",
      icon: "assets/images/medicine.svg",
    },
    {
      name: "Blog/News",
      route: "https://blog.nectarplus.health/",
      icon: "assets/images/svg/blog.svg",
    },
    {
      name: "List your practice for Free",
      route: "/auth/doctors/newRegister",
      // icon: "assets/images/svg/mat-per.svg",
    },
    {
      name: "Contact Us",
      route: "/contact-us",
      icon: "assets/images/svg/email.svg",
    },
    {
      name: "Privacy & Policy",
      route: "/privacy-policy",
      icon: "assets/images/svg/mat-privacy.svg",
    },
    {
      name: "Terms & Conditions",
      route: "/terms-conditions",
      icon: "assets/images/svg/mat-terms.svg",
    },
  ];

  filteredDocProcedure$ = new BehaviorSubject<any[]>([]);

  // get_All_procedure(){
  //   const url = `${API_ENDPOINTS.MASTER.procedure}`;
  //   this.http.get<any>(url).subscribe((res) => {
      
  //     this.doc_procedure = res.result;
  //     console.log("doc_procedure: ",this.doc_procedure);
  //   });
  // }

  // get_All_procedure() {
  //   const url = `${API_ENDPOINTS.MASTER.procedure}`;
  //   this.http.get<any>(url).subscribe((res) => {
  //     if (res.result) {
  //       const specializationIds = this.doctor_Specialization.map(specialization => specialization._id);
        
  //       const filteredProcedures = res.result.data.filter((procedure: any) =>
  //         specializationIds.includes(procedure.specializationId)
  //       );

  //       this.filteredDocProcedure$.next(filteredProcedures); // Update BehaviorSubject
  //       console.log("Filtered doc_procedure: ", filteredProcedures);
  //     }
  //   });
  // }

  get_All_procedure() {
    const url = `${API_ENDPOINTS.MASTER.procedure}`;
    this.http.get<any>(url).subscribe((res) => {
      if (res.result) {
        const specializationIds = this.doctor_Specialization.map(specialization => specialization._id);
        const filteredProcedures = res.result.data.filter((procedure: any) =>
          specializationIds.includes(procedure.specializationId)
        );
  
        this.filteredDocProcedure$.next([...filteredProcedures]); 
      }
    });
  }

}
