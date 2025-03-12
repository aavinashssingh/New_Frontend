import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from "@angular/material/bottom-sheet";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, debounceTime, distinctUntilChanged } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-search-suggestions-mobile",
  templateUrl: "./search-suggestions-mobile.component.html",
  styleUrls: ["./search-suggestions-mobile.component.scss"],
})
export class SearchSuggestionsMobileComponent implements OnInit, AfterViewInit {
  @ViewChild("symptoms", { static: true })
  symptoms: ElementRef;
  @ViewChild("location", { static: true })
  location: ElementRef;
  citySearchSubject: Subject<string> = new Subject();

  constructor(
    public bottomSheetRef: MatBottomSheetRef<SearchSuggestionsMobileComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private localStorage: LocalStorageService,
    private gService: GoogleMapsService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService
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
  inputFocused: string = "location";
  ngOnInit(): void {
    this.getCurrentCity()
    this.getSearchValue();
  }
  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe((res: any) => {
      if (res?.filter) {
        this.symptoms.nativeElement.value = res?.filter;
      }
      if (res?.location) {
        this.location.nativeElement.value = res?.location;
      }
    });
    if (this.data?.location) {
      this.location.nativeElement.value = this?.data?.location;
    }
    if (this.data?.symptomps) {
      this.symptoms.nativeElement.value = this?.data?.symptomps;
    }
    if (!this.location.nativeElement?.value) {
      // this.location.nativeElement.value = "Delhi";
    }
  }

  specialityOptions: any = [];
  servicesOptions: any = [];
  doctorsOptions: any = [];
  hospitalsOptions: any = [];
  clinicOptions: any = [];

  

  getSuggestion(data: any, type: string) {
    this.bottomSheetRef.dismiss();
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(data?.address?.city);
    if (type == "doctor") {
      this.eventService.broadcastEvent("doctor-route", data?._id);
      this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
    } else if (type == "hospital") {
      this.eventService.broadcastEvent("hospital-route", data?._id);
      this.router.navigate([
        `${city}/hospital/${data?.establishmentProfileSlug}`,
      ]);
    }
  }

  selectingValue(data: any, type = "symptoms") {
    if (this.data?.type != "both") {
      this.bottomSheetRef.dismiss({ symptoms: data });
    } else {
      this.symptoms.nativeElement.value = data;
      let obj: any = {};
      if (this.symptoms.nativeElement.value) {
        obj.filter = this.symptoms.nativeElement.value;
      }
      if (this.location.nativeElement.value) {
        obj.location = this.location.nativeElement.value;
      }
      if (obj.location && obj.filter) {
        this.bottomSheetRef.dismiss();
        this.router.navigate(["/doctor-list"], {
          queryParams: obj,
        });
      }
    }
  }
  placePredictions: any[] = [];
  searchSubject: Subject<string> = new Subject();
  placeService: any;

  selectedState: string;

  setSelectedCity(city: string) {
    this.selectedCity = city;

    this.location.nativeElement.value=city
    
    let obj: any = {};
    if (
      this.symptoms.nativeElement?.value &&
      this.location.nativeElement?.value &&
      this.data?.type == "both"
    ) {
      this.bottomSheetRef.dismiss();
      obj.filter = this.symptoms.nativeElement.value;
      if (this.location.nativeElement.value) {
        let location =
          this.selectedCity ||
          this.currentCity ||
          this.location.nativeElement.value;
        obj.location = this.commonService.replaceSpaceWithHyphen(location);
      }
      // this.router.navigate(["/doctor-list"], { queryParams: obj });
      this.router.navigate([
        `/${obj.location}/${obj.filter}/${this.selectedSubLocality || ""}`,
      ]);
    } else if (this.data?.type == "symptomps") {
      this.bottomSheetRef.dismiss({
        symptoms: this.symptoms.nativeElement.value,
      });
    } else if (this.data?.type == "location") {
      this.bottomSheetRef.dismiss({
        location: this.selectedCity,
      });
    }


  }
  setSelectedState(state: string) {
    this.selectedState = state;


    let obj: any = {};
    if (
      this.symptoms.nativeElement?.value &&
      this.location.nativeElement?.value &&
      this.data?.type == "both"
    ) {
      this.bottomSheetRef.dismiss();
      obj.filter = this.symptoms.nativeElement.value;
      if (this.location.nativeElement.value) {
        let location =
          this.selectedCity ||
          this.currentCity ||
          this.location.nativeElement.value;
        obj.location = this.commonService.replaceSpaceWithHyphen(location);
      }
      // this.router.navigate(["/doctor-list"], { queryParams: obj });
      this.router.navigate([
        `/${obj.location}/${obj.filter}/${this.selectedSubLocality || ""}`,
      ]);
    } else if (this.data?.type == "symptomps") {
      this.bottomSheetRef.dismiss({
        symptoms: this.symptoms.nativeElement.value,
      });
    } else if (this.data?.type == "location") {
      this.bottomSheetRef.dismiss({
        location: this.selectedState,
      });
    }

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
  selectedCity: string='';
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
    });
  }

  currentCity: string;
  states = [];
  cities = [];
  filteredStates = [];
  filteredCities = [];
  initFocusFlag:any=true



  onCitySelect(event: any): void {
    const selectedCity = event.option.value;
    this.localStorage.setItem("city", this.selectedCity);
this.currentCity=selectedCity
  }

  onCitySearch(event: any): void {
    const inputValue = event.target.value;
    this.citySearchSubject.next(inputValue); // Trigger the subject
  }
  specialization() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specialityOptions = res?.result?.data;
      });
  }

  getCurrentCity() {
    this.apiService
      .get(API_ENDPOINTS.STATE.getAllState, "")
      .subscribe((res: any) => {
        this.cities = res?.result.map((city: any) => city.name);
      this.filteredCities = [...this.cities];
      this.localStorage.getItem("city");
      const currentCity = this.localStorage.getItem("city");
      this.currentCity = currentCity ? currentCity : "Delhi";
      this.localStorage.setItem("city", this.currentCity);
      this.location.nativeElement.value = this.currentCity;
      if (!this.symptoms.nativeElement.value) {
        if(!this.initFocusFlag){
          this.symptoms.nativeElement.focus();
          this.initFocusFlag=false
        }
        this.specialization();
      }
      this.citySearchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((inputValue: string) => {
          this.filteredCities = this.cities.filter(state =>
            state.toLowerCase().includes(inputValue.toLowerCase())
          );
        });
    });
    

  }

  pressedEnter(e: any) {
    if (
      e.code == "Enter" ||
      e.code === "NumpadEnter" ||
      e.code === "Return" ||
      e.keyCode === 13
    ) {
      let obj: any = {};
      if (
        this.symptoms.nativeElement?.value &&
        this.location.nativeElement?.value &&
        this.data?.type == "both"
      ) {
        this.bottomSheetRef.dismiss();
        obj.filter = this.symptoms.nativeElement.value;
        if (this.location.nativeElement.value) {
          let location =
            this.selectedCity ||
            this.currentCity ||
            this.location.nativeElement.value;
          obj.location = this.commonService.replaceSpaceWithHyphen(location);
        }
        // this.router.navigate(["/doctor-list"], { queryParams: obj });
        this.router.navigate([
          `/${obj.location}/${obj.filter}/${this.selectedSubLocality || ""}`,
        ]);
      } else if (this.data?.type == "symptomps") {
        this.bottomSheetRef.dismiss({
          symptoms: this.symptoms.nativeElement.value,
        });
      } else if (this.data?.type == "location") {
        this.bottomSheetRef.dismiss({
          location: this.location.nativeElement.value,
        });
      }
    }
  }
}
