import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/services/api.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { EventService } from "src/app/services/event.service";
import { Subject, debounceTime, distinctUntilChanged, fromEvent } from "rxjs";
import { LocalStorageService } from "src/app/services/storage.service";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SearchSuggestionsMobileComponent } from "../search-suggestions-mobile/search-suggestions-mobile.component";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { CommonService } from "src/app/services/common.service";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { localityData } from '../../../utils/locality'




@Component({
  selector: "nectar-global-search",
  templateUrl: "./global-search.component.html",
  styleUrls: ["./global-search.component.scss"],
})
export class GlobalSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('symptoms', { static: false }) symptoms!: ElementRef<HTMLInputElement>;
  @ViewChild("location", { static: true }) location: ElementRef;
  @Input() type = "header";
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  deviceWidth: any;
  searchStateSubject: Subject<string> = new Subject();
  citySearchSubject: Subject<string> = new Subject();
  states = [];
  cities = [];
  filteredStates = [];
  filteredCities = [];
  searchSource: any
  constructor(
    private apiService: ApiService,
    private router: Router,
    private gService: GoogleMapsService,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private _document: Document
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

  placePredictions: any[] = [];
  searchSubject: Subject<string> = new Subject();
  placeService: any;
  initFocusFlag: any = true
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getCurrentCity();
    this.getSearchValue();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.location.nativeElement.value = "Delhi";
    }
  }
  getSearchData() {
    let obj: any = {};
    if (this.symptoms.nativeElement.value) {
      obj.filter = this.commonService.replaceSpaceWithHyphen(
        this.symptoms.nativeElement.value
      );
    }
    if (this.location.nativeElement.value) {
      let location =
        this.location.nativeElement.value ||
        this.selectedCity ||
        this.currentCity ||
        this.selectedState

      obj.location = this.commonService.replaceSpaceWithHyphen(location);
    }
    if (this.searchSource == 'establishment') {
      this.selectedSubLocality = this.commonService.replaceSpaceWithHyphen(
        this.selectedSubLocality
      );
    }
    if (obj.location && obj.filter) {
      if (this.selectedSubLocality) {
        if (this.selectedSubLocality == 'new delhi' || this.selectedSubLocality == 'New Delhi') {
          this.selectedSubLocality = 'delhi'
        }
        this.router.navigate([
          `/${this.selectedSubLocality}/${obj.filter}/${obj.location}`,
        ]);
      }
      else {
        this.router.navigate([
          `/${obj.location}/${obj.filter}`,
        ]);
      }

    }
  }
  currentCity: any;




  // getCurrentCity() {
  //   this.apiService
  //     .get(API_ENDPOINTS.hospital.getLocalityList, "")
  //     .subscribe((res: any) => {
  //       this.cities = res?.result
  //       this.filteredCities = res.result;
  //       this.localStorage.getItem("city");
  //       const currentCity = this.localStorage.getItem("city");
  //       this.currentCity = currentCity ? currentCity : "Delhi";
  //       this.localStorage.setItem("city", this.currentCity);
  //       this.location.nativeElement.value = this.currentCity;
  //       if (!this.symptoms.nativeElement.value) {
  //         if (!this.initFocusFlag) {
  //           this.symptoms.nativeElement.focus();
  //           this.initFocusFlag = false
  //         }
  //         // this.specialization();
  //       }
  //       this.citySearchSubject
  //         .pipe(
  //           debounceTime(300),
  //           distinctUntilChanged()
  //         )
  //         .subscribe((inputValue: string) => {
  //           this.filteredCities = this.cities.filter(state =>
  //             state.toLowerCase().includes(inputValue.toLowerCase())
  //           );
  //         });
  //     });


  // }



  getCurrentCity() {
    // Fetch data from local JSON
    const res = localityData;

    this.cities = res?.result.map(item => item); // Extracting only names


    this.filteredCities = [...this.cities];

    const currentCity = this.localStorage.getItem("city") || "Delhi";
    this.currentCity = currentCity;
    this.localStorage.setItem("city", this.currentCity);
    this.location.nativeElement.value = this.currentCity;

    // if (!this.symptoms.nativeElement.value) {
    //   if (!this.initFocusFlag) {
    //     this.symptoms.nativeElement.focus();
    //     this.initFocusFlag = false;
    //   }
    // }

   
    if (this.symptoms && this.symptoms.nativeElement.value) {  
        if (!this.initFocusFlag) {
          this.symptoms.nativeElement.focus();
          this.initFocusFlag = false;
        }
    }
    

    this.citySearchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((inputValue: string) => {
        this.filteredCities = this.cities.filter(state =>
          state.toLowerCase().includes(inputValue.toLowerCase())
        );
      });
  }










  validateCity(event: any): void {
    const enteredCity = event.target.value.trim();
    console.log('Validating input:', enteredCity);

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
      // console.log('Valid City:', matchingCity);
      // console.log('Search Source:', this.searchSource);
    } else {
      // Invalid city, clear the input
      event.target.value = '';
      this.currentCity = '';
      this.searchSource = '';
      this.selectedSubLocality = '';
      // console.log('Invalid City, input cleared.');
    }
  }




  onSearch(event: any) {
    const value = event.target.value.city;
    if (value) {
      this.searchSubject.next(value);
    } else {
      this.placePredictions = [];
    }
  }

  onCitySelect(event: any): void {
    const selectedValue = event.source.value; // city.name from the mat-option value
    console.log('Selected value:', selectedValue);


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




  onCitySearch(event: any): void {
    const inputValue = event.target.value.toLowerCase();


    this.filteredCities = this.cities.filter(city => {
      return (city.name && city.name.toLowerCase().includes(inputValue)) ||
        (city.locality && city.locality.toLowerCase().includes(inputValue));
    });
  
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




  selectedCity: string;
  selectedState: string;
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
    });
  }

  setSelectedCity(city: string) {
    this.selectedCity = city;
    this.localStorage.setItem("city", this.currentCity);
  }
  setSelectedState(state: string) {
    this.selectedState = state;
  }

  specialization() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specialityOptions = res?.result?.data;
      });
  }



  specialityOptions: any = [];
  servicesOptions: any = [];
  doctorsOptions: any = [];
  hospitalsOptions: any = [];
  clinicOptions: any = [];


  getSuggestionList(event: any): void {
    const inputValue = event.target.value;
    if (inputValue && inputValue.length > 2) {
      this.searchSubject.next(inputValue);
    }

  }











  closeSuggestion(data: string) {
    if (data == "symptomps") {
      this.symptoms.nativeElement.value = "";
    } else {
      this.location.nativeElement.value = "";
    }
  }







  getSuggestion(data: any, type: string) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(data?.address?.city);
    if (type == "doctor") {
      this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
    } else if (type == "hospital") {
      this.router.navigate([
        `${city}/hospital/${data?.establishmentProfileSlug}`,
      ]);
    }
  }

  focusOnLocation() {
    if (!this.location.nativeElement.value) {
      setTimeout(() => {
        this.location.nativeElement.focus();
      }, 0);
    }
  }

  scrollToTop() {
    scrollTo(0, 0);
  }

  scrollTop: any;
  bottomReached: boolean = false;
  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scroll$ = fromEvent(window, "scroll").pipe(debounceTime(100));
    scroll$.subscribe(() => {
      const scrollTop =
        window.scrollY ||
        this._document.documentElement.scrollTop ||
        this._document.body.scrollTop ||
        0;
      this.scrollTop = scrollTop;

      const scrollHeight = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = this._document.documentElement.scrollHeight;

      if (scrollHeight + windowHeight > documentHeight - 700) {
        this.bottomReached = true;
      } else {
        this.bottomReached = false;
      }
    });
  }

  openBottomSheet(data: any) {
    if (this.deviceWidth < 767) {
      let obj: any = { type: data };
      const sheetRef = this.bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: obj,
        panelClass: "search-bottom-sheet",
      });
      sheetRef.afterDismissed().subscribe((data: any) => {
        if (data?.symptoms) {
          this.symptoms.nativeElement.value = data?.symptoms;
        }
        if (data?.location) {
          this.location.nativeElement.value = data?.location;
        }
      });
    }
  }

  focusinmethod() {
    let b = this._document.body;
    b.style.overflow = "hidden";
  }
  focusoutmethod() {
    let b = this._document.body;
    b.style.overflow = "auto";
  }

  ngOnDestroy(): void {
    this.focusoutmethod();
  }
}
