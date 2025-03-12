import { DatePipe } from "@angular/common";
import { Component, Input, OnInit, Renderer2 } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  selector: "nectar-videos-section",
  templateUrl: "./videos-section.component.html",
  styleUrls: ["./videos-section.component.scss"],
})
export class VideosSectionComponent implements OnInit {
  @Input() id: any;
  @Input() type: any = "doctor";
  @Input() tab = 1;
  apiHit: boolean = false;
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.getVideos();
    }
    this.eventService.getEvent("doctor-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getVideos();
      }
    });
    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getVideos();
      }
    });
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
    // autoWidth:true,
    // stagePadding: 80,
    margin: 20,
    items: 2.4,
  };
  apiData: any = [];
  getVideos() {
    let payload: any = {};
    if (this.type == "doctor") {
      payload.id = this.id;
      payload.userType = 2;
    } else {
      payload.establishmentId = this.id;
      payload.userType = 3;
    }

    this.apiService
      .get(API_ENDPOINTS.patient.doctorVideos, payload)
      .subscribe((res: any) => {
        this.apiHit = true;
        this.apiData = res?.result?.data;
        this.settingSchemaMarkUp();
        this.apiData.forEach((element: any) => {
          element.url = element?.url.replace("watch?v=", "embed/");
        });
      });
  }

  settingSchemaMarkUp() {
    const entityArray = this.apiData.map((item: any) => ({
      "@type": "VideoObject",
      name: item?.title || "",
      uploadDate: this.datePipe.transform(item?.createdAt, "YYYY-MM-dd"),
      contentUrl: item.url || "",
      embedUrl: item.url || "",
      thumbnailUrl: "",
    }));

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      mainEntity: entityArray,
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }
}
