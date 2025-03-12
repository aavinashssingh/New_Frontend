import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, debounceTime, distinctUntilChanged } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";

import { localityData } from '../../../utils/locality'

@Component({
  selector: "nectar-wrap-search",
  templateUrl: "./wrap-search.component.html",
  styleUrls: ["./wrap-search.component.scss"],
})
export class WrapSearchComponent implements OnInit {
  @ViewChild("symptoms") symptoms: ElementRef<HTMLInputElement>;
  @ViewChild("location", { static: false })
  location: ElementRef<HTMLInputElement>;
  selectedState: string;
  cities: any;
  searchSource: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private apiService: ApiService,
    private gService: GoogleMapsService,
    private localStorage: LocalStorageService,
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
  placePredictions: any[] = [];
  searchSubject: Subject<string> = new Subject();
  citySearchSubject: Subject<string> = new Subject();

  placeService: any;
  ngOnInit(): void {
    this.getSearchValue();
    this.getCurrentCity();

    setTimeout(() => {
      const routeArray = this.router.url.split("/");
      let filter = this.commonService.titleCase(
        this.commonService.replaceHyphenWithSpace(routeArray[2])
      );
      filter =
        filter != "Doctors"
          ? filter.replace(/%28/g, "(").replace(/%29/g, ")")
          : "";
      const location =
        this.localStorage.getItem("search-address") ||
        this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(routeArray[1])
        );
      if (location == "Hospital List" || !location) {
        const currentCity = this.localStorage.getItem("city");
        const currentLocality = this.localStorage.getItem("locality");

        if (currentLocality) {
          this.location.nativeElement.value = currentLocality;
        } else {
          this.location.nativeElement.value = currentCity ? currentCity : "Delhi";
        }
      } else {
        const currentLocality = this.localStorage.getItem("locality");
        if (currentLocality) {
          this.location.nativeElement.value = currentLocality;
        } else {
          this.location.nativeElement.value = location;
        }
      }
      this.symptoms.nativeElement.value = filter || "";
    });

    this.eventService.getEvent("clear-speciality").subscribe((res: any) => {
      if (res) {
        this.symptoms.nativeElement.value = "";
      }
    });
  }


  onCitySearch(event: any): void {
    const inputValue = event.target.value.toLowerCase();

    this.filteredCities = this.cities.filter(city => {
      return (city.name && city.name.toLowerCase().includes(inputValue)) ||
        (city.locality && city.locality.toLowerCase().includes(inputValue));
    });
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
    } else {
      // Invalid city, clear the input
      event.target.value = '';
      this.currentCity = '';
      this.searchSource = '';
      this.selectedSubLocality = '';
    }
  }


  currentCity: any;


  getCurrentCity() {


    this.activatedRoute.params.subscribe((res: any) => {
      console.log(res, 'res');
      if (res.city) {
        console.log(res.city, 'res.city');
        this.currentCity = res.city;
        this.localStorage.setItem("city", this.currentCity);

        this.location.nativeElement.value = this.currentCity;

      }
      if (res.locality) {
        console.log(res.locality, 'res.locality');
        this.currentCity = res.locality;
        this.localStorage.setItem("locality", this.currentCity);
        this.location.nativeElement.value = this.currentCity;
      }

    });

    const res = localityData;

    this.cities = res?.result.map(item => item); // Extracting only names
    this.filteredCities = [...this.cities];

    if (!this.symptoms.nativeElement.value) {
      this.symptoms.nativeElement.focus();
      // this.specialization();
    }

    this.citySearchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((inputValue: string) => {
        this.filteredCities = this.cities.filter(state =>
          state.toLowerCase().includes(inputValue.toLowerCase())
        );
      });

    // this.apiService
    //   .get(API_ENDPOINTS.hospital.getLocalityList, "")
    //   .subscribe((res: any) => {
    //     this.cities = res?.result
    //   this.filteredCities = res.result;    
    //   if (!this.symptoms.nativeElement.value) {
    //     this.symptoms.nativeElement.focus();
    //     // this.specialization();
    //   }
    //   this.citySearchSubject
    //     .pipe(
    //       debounceTime(300),
    //       distinctUntilChanged()
    //     )
    //     .subscribe((inputValue: string) => {
    //       this.filteredCities = this.cities.filter(state =>
    //         state.toLowerCase().includes(inputValue.toLowerCase())
    //       );
    //     });
    // });



    console.log(this.currentCity, 'currentCity');
  }

  filteredCities = [];

  onSearch(event: any) {
    const inputValue = event.target.value;
    this.citySearchSubject.next(inputValue); // Trigger the subject
  }


  setSelectedCity(city: string) {
    this.selectedCity = city;
  }
  setSelectedState(state: string) {
    this.selectedState = state;
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
      if (this.searchSource == 'establishment') {
        this.selectedSubLocality = this.commonService.replaceSpaceWithHyphen(
          this.selectedSubLocality
        );
      }
      if (obj.location && obj.filter) {
        if (this.selectedSubLocality) {
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
  }

  specialityOptions: any = [];
  servicesOptions: any = [];
  doctorsOptions: any = [];
  hospitalsOptions: any = [];
  clinicOptions: any = [];


  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;




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
}
