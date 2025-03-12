import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
  ViewChild,
  PLATFORM_ID
} from "@angular/core";
import { Router } from "@angular/router";
import { CarouselComponent, OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { DOCUMENT,isPlatformBrowser } from "@angular/common";

import {
  TOP_RATED_KEY,
  TransferStateService,
} from "src/app/services/transfer-state.service";

@Component({
  selector: "nectar-top-rated",
  templateUrl: "./top-rated.component.html",
  styleUrls: ["./top-rated.component.scss"],
})
export class TopRatedComponent implements OnInit, AfterViewInit {
  width: any = 0;
  isBrowser: boolean = false;
  cardWidth: any = 310;
  @Input() type = 0;
  @Input() id: any = "";
  totalWidth: any = 0;
  rightButton: boolean = true;
  carousel: CarouselComponent;
  activeSlideIndex: number = 0;
  @ViewChild("owlCar") owlCar: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document,
    private transferStateService: TransferStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    let val = this._document.getElementById(this.id);
    if (val) {
      if (val.clientWidth >= val?.scrollWidth) {
        this.rightButton = false;
      }
      this.totalWidth = val?.scrollWidth;
    }
  }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.width = this.commonService.gettingWinowWidth();
    if (this.width < 767) {
      this.cardWidth = 260;
    }
    this.getTopRatedList();
  }

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    dots: false,
    autoWidth: true,
    startPosition: 0,
    // responsive: {
    //   0: {
    //     items: 2,
    //   },
    //   600: {
    //     items: 3,
    //   },
    //   1000: {
    //     items: 2,
    //   },
    // },
    margin: 20,
  };
  @HostListener("window:resize", ["$event"]) onResize() {
    this.width = this.commonService.gettingWinowWidth();
  }

  leftButtonDisable = true;
  rightButtonDisable = false;
  rightScrollWidth: any;
  public scrollRight(id: any): void {
    this.leftButtonDisable = false;
    if (this.topListing.length - 1 > this.activeSlideIndex) {
      this.owlCar.next();
    } else {
      this.rightButtonDisable = true;
    }
  }

  public scrollLeft(id: any): void {
    this.rightButtonDisable = false;
    if (this.activeSlideIndex == 0) {
      this.leftButtonDisable = true;
    }
    this.owlCar.prev();
  }
  topListing: any;

  getTopRatedList() {
    return this.transferStateService
      .checkAndGetData(
        TOP_RATED_KEY,
        this.apiService.get(API_ENDPOINTS.doctor.topRatedDoctors, {}),
        []
      )
      .subscribe((res: any) => {
        if (this.type == 0) {
          this.topListing = res?.result.topDentalDoc;
        } else {
          this.topListing = res?.result.shortestTimecardiologist;
        }

        if (this.topListing.length < 2) {
          this.rightButtonDisable = true;
          this.leftButtonDisable = true;
        }
      });
  }

  onSlideActivated(event: any) {
    this.activeSlideIndex = event.startPosition;
  }

  viewDoctor(str: string) {
    if (str == "dental") {
      this.router.navigate([`/delhi/dentist`]);
    } else {
      this.router.navigate([`/delhi/orthopedist`]);
    }
  }
}
