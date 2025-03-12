import { Component, HostListener, Inject, OnInit ,PLATFORM_ID} from "@angular/core";
import { Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { isPlatformBrowser } from '@angular/common';

import {
  FROM_LITTLE_TO_CRITICAL_ISSUES_KEY,
  TransferStateService,
} from "src/app/services/transfer-state.service";

@Component({
  selector: "nectar-critical-issues",
  templateUrl: "./critical-issues.component.html",
  styleUrls: ["./critical-issues.component.scss"],
})
export class CriticalIssuesComponent implements OnInit {
  width: any = 0;
  isBrowser: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private commonService: CommonService,
    private transferStateService: TransferStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  cardWidth = 200;
  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.width = this.commonService.gettingWinowWidth();
    this.getListing();
    if (this.width < 767) {
      this.cardWidth = 135;
    }
  }

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: false,
    dots: false,
    
    // touchDrag: true,
    mouseDrag: true,

    margin: 24,
    navText: [
      '<img loading="lazy"src="assets/images/homepage/purple arrow right.svg" alt="" >',
      '<img loading="lazy"src="assets/images/homepage/purple arrow right.svg" alt="" >',
    ],
    autoWidth: true,
    responsive: {
      0: {
        items: 2,
        nav: true,
      },
      768: {
        items: 2,
        nav: true,
      },
      1200: {
        items: 6,
      },
      1440: {
        items: 7,
      },
    },
  };
  apiData: any;

  getListing() {
    return this.transferStateService
      .checkAndGetData(
        FROM_LITTLE_TO_CRITICAL_ISSUES_KEY,
        this.apiService.get(API_ENDPOINTS.patient.criticalIssuesHome, {}),
        []
      )
      .subscribe((res: any) => {
        if (this.width > 767) {
          this.apiData = res?.result;
        } else {
          const arrayOfArrays = [];
          for (let i = 0; i < res?.result.length; i += 2) {
            const pair = [res?.result[i], res?.result[i + 1]];
            arrayOfArrays.push(pair);
          }
          this.apiData = arrayOfArrays;
        }
      });
  }

  viewDoctor(str: string) {
    str = this.commonService.replaceSpaceWithHyphen(str);
    this.router.navigate([`/delhi/${str}`]);
  }
}
