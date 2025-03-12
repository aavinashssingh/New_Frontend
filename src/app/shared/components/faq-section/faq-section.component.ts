import { Component, Input, OnInit, Renderer2 } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  selector: "nectar-faq-section",
  templateUrl: "./faq-section.component.html",
  styleUrls: ["./faq-section.component.scss"],
})
export class FaqSectionComponent implements OnInit {
  @Input() id: any;
  @Input() type: any = "doctor";
  @Input() tab = 1;
  deviceWidth: any;
  isExpanded: boolean[] = [];

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.isExpanded = this.apiData.map(() => false);

    if (this.id) {
      this.getFaqs();
    }
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.eventService.getEvent("doctor-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getFaqs();
      }
    });
    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getFaqs();
      }
    });
  }
  apiData: any = [];
  getFaqs() {
    let payload: any = {};
    if (this.type === "doctor") {
      payload.id = this.id;
      payload.userType = 2;
    } else {
      payload.establishmentId = this.id;
      payload.userType = 3;
    }
    this.apiService.get(API_ENDPOINTS.patient.doctorFAQ, payload).subscribe((res: any) => {
      this.apiData = res?.result?.data || [];
      this.isExpanded = this.apiData.map(() => false); // Initialize after fetching data
      this.settingSchemaMarkUp();
    });
  }

  settingSchemaMarkUp() {
    const entityArray = this.apiData.map((item: any) => ({
      "@type": "Question",
      name: item?.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item?.answer,
      },
    }));

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entityArray,
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }
  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }
}
