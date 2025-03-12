import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import {
  HOME_BLOG_KEY,
  TransferStateService,
} from "src/app/services/transfer-state.service";

@Component({
  selector: "nectar-blogs",
  templateUrl: "./blogs.component.html",
  styleUrls: ["./blogs.component.scss"],
})
export class BlogsComponent implements OnInit {
  apiData: any = [];
  cardWidth: any = 356;
  deviceWidh: any;

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferStateService: TransferStateService
  ) {}
  ngOnInit(): void {
    this.deviceWidh = this.commonService.gettingWinowWidth();

    if (this.deviceWidh < 767) this.cardWidth = 260;

    if (isPlatformBrowser(this.platformId)) this.getPopularBlogs();
  }
  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: false,
    dots: false,
    // touchDrag:true,
    // mouseDrag:true,
    // pullDrag:true,
    // autoHeight: true,
    autoWidth: true,
    // stagePadding: 80,
    margin: 20,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1440: {
        items: 3,
      },
    },
  };

  goToBlogs() {
    window.open("https://blog.nectarplus.health/");
  }

  getPopularBlogs() {
    return this.transferStateService
      .checkAndGetData(HOME_BLOG_KEY, this.apiService.getPopularBlogs(), [])
      .subscribe((res: any) => {
        this.apiData = res;
        this.apiData.forEach((element: any) => {
          this.apiService.getCategory(element.id).subscribe((res: any) => {
            element.categoryName = res[0]?.name;
          });
        });
      });
  }

  viewBlog(data: any) {
    window.open(`https://blog.nectarplus.health/${data?.link}`);
  }
}
