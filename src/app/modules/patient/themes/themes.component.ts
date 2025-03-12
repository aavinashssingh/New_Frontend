import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-themes",
  templateUrl: "./themes.component.html",
  styleUrls: ["./themes.component.scss"],
})
export class ThemesComponent implements OnInit {
  deviceWIdth: any;
  @ViewChild("matdrawer") public matdrawer;
  @ViewChild("matdrawer1") public matdrawer1;
  matDrawer$: Subscription;
  matDrawer$1: Subscription;
  mode!: string;
  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private router: Router,
    private commonService: CommonService
  ) { }
  securityToggle: boolean = false;
  ngOnInit(): void {
    this.deviceWIdth = this.commonService.gettingWinowWidth();
    if (this.deviceWIdth < 767 && this.localStorage.getItem("token")) {
      this.getUserData();
    }
    this.matDrawer$ = this.eventService
      .getEvent("patient-sidenav")
      .subscribe((res: boolean) => {
        if (res) {
          this.matdrawer.toggle();
        }
      });
    this.matDrawer$1 = this.eventService
      .getEvent("patient-profile-sidenav")
      .subscribe((res: boolean) => {
        if (res) {
          this.matdrawer1.toggle();
        }
      });
    this.eventService.getEvent("profile-update").subscribe((res: any) => {
      if (res) {
        this.getUserData();
      }
    });
    this.eventService.getEvent("login").subscribe((res: any) => {
      if (res && this.deviceWIdth < 767) {
        this.getUserData();
      }
    });
    let data = this.router.url.split("/");
    this.mode =
      data[1] == "register" || data[2] == "register" ? "register" : data[2];

    this.eventService.getEvent("showheader").subscribe((res: string) => {
      if (res) {
        this.mode = res;
      }
    });
  }

  userData: any;
  getUserData() {
    const userType = this.localStorage.getItem("userType");
    if (this.deviceWIdth > 767 && userType != 1) {
      return;
    }
    this.apiService
      .get(`${API_ENDPOINTS.patient.getUserDetail}`, {})
      .subscribe((res: any) => {
        this.userData = res?.result;
      });
  }

  logout() {
    this.apiService.logout();
  }
  onClose(num: number) {
    if (num == 1) {
      this.matdrawer.toggle();
    } else {
      this.matdrawer1.toggle();
    }
  }
  ngOnDestroy(): void {
    this.matDrawer$?.unsubscribe();
    this.matDrawer$1?.unsubscribe();
  }

  menus: any = [
    { name: "Find the doctors", route: "/hospital-list", icon: "assets/images/svg/search.svg" },
    { name: "Surgeries", route: "/surgeries", icon: "assets/images/svg/mat-surgeries.svg" },
    { name: "Medicines", route: "/medicines", icon: "assets/images/medicine.svg" },
    { name: "Blog/News", route: "https://blog.nectarplus.health/", icon: "assets/images/svg/blog.svg" },
    { name: "List your practice for Free", route: "/auth/doctors/newRegister" },
    { name: "Contact Us", route: "/contact-us", icon: "assets/images/svg/email.svg" },
    { name: "Privacy & Policy", route: "/privacy-policy", icon: "assets/images/svg/mat-privacy.svg" },
    { name: "Terms & Conditions", route: "/terms-conditions", icon: "assets/images/svg/mat-terms.svg" },
  ];
  
}
