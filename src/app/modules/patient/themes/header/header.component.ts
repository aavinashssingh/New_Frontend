import { BreakpointObserver } from "@angular/cdk/layout";
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { BreakpointValues } from "src/app/shared/constant/layout.constant";
import { debounceTime } from "rxjs/operators";
import { Subscription, fromEvent } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { SupportModalComponent } from "src/app/modules/registration-process/support-modal/support-modal.component";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { SearchSuggestionsMobileComponent } from "src/app/shared/components/search-suggestions-mobile/search-suggestions-mobile.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { CommonService } from "src/app/services/common.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "nectar-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobile = false;
  doctorDetail: any;
  constructor(
    private breakpoint: BreakpointObserver,
    private router: Router,
    private eventService: EventService,
    private matdialog: MatDialog,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private bottomSheet: MatBottomSheet,
    private commonService: CommonService,

    @Inject(DOCUMENT) private _document: Document
  ) {}
  mode!: string;
  deviceWidth: any;
  isDoctorDetailPage:any;
  doctorListMode = false;
  newLogin = false;
  newRegister = false;
  isLoggedin = false;
  stepSubscription$: Subscription;
  steps: {
    currentstep: number;
    laststep: number;
    showstep: boolean;
  } = {
    currentstep: 1,
    laststep: 5,
    showstep: false,
  };
  headerColor: string;
  isDoctor:any=false


  loggedin:any=true
  onLogout() {

    this.loggedin=false
    this.apiService.logout();
  }

 


  ngOnInit(): void {


if(this.router.url=='/auth/doctors/newlogin'){
this.newLogin=true
}
if(this.router.url=='/auth/doctors/newRegister'){
this.newRegister=true
}

    this.subscribedEvents();



    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getSteps();
    const userType = this.localStorage.getItem("userType");
    if (
      this.localStorage.getItem("token") &&
      userType == APP_CONSTANTS.USER_TYPES.PATIENT
    ) {
      this.isLoggedin = true;
      this.getUserData();

    }
    else if (this.localStorage.getItem("token") &&
    userType == APP_CONSTANTS.USER_TYPES.DOCTOR){
      this.isDoctor=true
        this.isLoggedin=true
        this.getUserDetail();

    }
    this.doctorListingScreen();
    let data = this.router.url.split("/");
    this.mode =
      data[1] == "register" || data[2] == "register" ? "register" : data[2];

    this.isMobile = this.breakpoint.isMatched(BreakpointValues.mobileMax);

   
    this.router.events.subscribe(() => {
      this.isDoctorDetailPage = this.router.url.includes('/doctor/'); // Adjust this if necessary
    });

  }
  getUserDetail() {
    this.apiService
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {
        this.doctorDetail = res?.result[0];
      });
  }

  @HostListener("window:resize", ["$event"]) onResize() {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.isMobile = this.breakpoint.isMatched(BreakpointValues.tabletMax);
    if (this.doctorListMode) {
      this.doctorListHeader = false;
    }
  }

  //  events subscribed

  subscribedEvents() {
    // getting Login event

    this.eventService.getEvent("login").subscribe((res: string) => {
      const userType = this.localStorage.getItem("userType") || "";
      if (res && userType == APP_CONSTANTS.USER_TYPES.PATIENT) {
        this.isLoggedin = true;
        this.getUserData();
      } else {
        this.isLoggedin = false;
      }
    });

    // update profile event

    this.eventService.getEvent("profile-update").subscribe((res: boolean) => {
      if (res) {
        this.getUserData();
      }
    });

    // changiing header event

    this.eventService.getEvent("reset-header").subscribe((res: string) => {
      if (res) {
        this.show = true;
      }
    });

    // changing bg of header event

    this.eventService.getEvent("bgColor").subscribe((res: any) => {
      if (res) {
        this.headerColor = res;
      } else {
        this.headerColor = "";
      }
    });

    // show header event
    this.eventService.getEvent("showheader").subscribe((res: string) => {
      if (res) {
        this.mode = res;
      }
    });

    // remove header in case of mobile screen

    this.eventService.getEvent("remove-header-mobile").subscribe((res: any) => {
      this.removeHeader = res;
    });

    // serach bar in middle

    this.eventService.getEvent("enable-serach").subscribe((res: any) => {
      this.mobileHeaderSearch = res;
    });
  }
  removeHeader: boolean = false;

  firstSectionContent = [
    { name: "Find Doctors", url: "/hospital-list", isActive: false },
    { name: "Surgeries", url: "/surgeries", isActive: false },
    { name: "Medicines", url: "/medicines", isActive: false },
    { name: "About Us", url: "/about-us/about", isActive: false },
    // { name: "Blogs/News", url: "https://blog.nectarplus.health/", isActive: false },
  ];
  

  show = true;
  mobileHeaderSearch: boolean = false;
  doctorListHeader: boolean = false;
  scrollTop: any;
  @HostListener("window:scroll", [])


 
  onWindowScroll() {
    const scroll$ = fromEvent(window, "scroll").pipe(debounceTime(100));
    scroll$.subscribe(() => {
      const scrollTop =
        window.scrollY ||
        this._document.documentElement.scrollTop ||
        this._document.body.scrollTop ||
        0;
      if (this.router.url == "/") {
        if (scrollTop > 250 && this.deviceWidth > 767) {
          this.show = false;
          this.eventService.broadcastEvent("scrolled-up", true);
        } else {
          this.show = true;
          this.eventService.broadcastEvent("scrolled-up", false);
        }
      }
      this.scrollTop = scrollTop;
      if (this.doctorListMode) {
        this.show = true;
        if (scrollTop > 50 && this.deviceWidth > 767) {
          this.doctorListHeader = true;
        } else {
          this.doctorListHeader = false;
        }
      }
    });
  }

  doctorListingScreen() {
    this.eventService.getEvent("doctor-list").subscribe((res: boolean) => {
      this.doctorListMode = res;
      this.show = true;
    });

    this.eventService.getEvent("view-doctor").subscribe((res: boolean) => {
      this.doctorListMode = false;
      this.show = true;
      this.doctorListHeader = false;
    });
  }
  openDialog() {
    this.matdialog.open(SupportModalComponent);
  }

  onSaveExit() {
    this.eventService.broadcastEvent("saveExit", true);
  }
  getSteps() {
    this.stepSubscription$ = this.eventService
      .getEvent("step")
      .subscribe(
        (res: { currentstep: number; laststep: number; showstep: boolean }) => {
          this.steps = res;
        }
      );
  }
  clearLocalStorage(keys: string[]) {
    keys.forEach((value: string) => {
      this.localStorage.removeItem(value);
    });
  }
  ngOnDestroy(): void {
    if (this.stepSubscription$) {
      this.stepSubscription$.unsubscribe();
    }
  }
  logout() {
    this.apiService.logout();
  }
  redirection(data: any) {
    // Toggle active class
    this.firstSectionContent.forEach((item) => {
      item.isActive = false;
    });
    data.isActive = true;
  
    // Check if the clicked item is "Blogs/News"
    if (data.name !== "Blogs/News") {
      // Navigate to the internal route using Angular Router
      this.router.navigate([data.url]);
    } else {
      // Open the external blog URL in a new tab
      window.open("https://blog.nectarplus.health/", "_blank");
    }
  }
  
  
  
 
  

  userData: any;
  getUserData() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getUserDetail}`, {})
      .subscribe((res: any) => {
        this.userData = res?.result;
      });
  }

  openSidenav() {
    this.eventService.broadcastEvent("patient-sidenav", true);
  }

  openProfileSideNav() {
    this.eventService.broadcastEvent("patient-profile-sidenav", true);
  }

  openBottomSheet() {
    if (this.deviceWidth < 767) {
      this.bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: { type: "both" },
        panelClass: "search-bottom-sheet",
      });
    }
  }
}
