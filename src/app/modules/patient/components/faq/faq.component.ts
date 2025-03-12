import { AfterViewInit, Component, Input, OnInit, Renderer2 } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { SeoService } from "src/app/services/seo.service";
import {
  FAQ_NON_TYPE_KEY,
  TransferStateService,
} from "src/app/services/transfer-state.service";

@Component({
  selector: "nectar-faq",
  templateUrl: "./faq.component.html",
  styleUrls: ["./faq.component.scss"],
})
export class FaqComponent implements OnInit, AfterViewInit {
  isExpanded: boolean[] = [];

  constructor(
    private apiService: ApiService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private commonService: CommonService,
    private transferStateService: TransferStateService
  ) {

  }
  deviceWidth: any;
  @Input() type = null;
  @Input() id: any = null;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getListing();

  }
  ngAfterViewInit(): void {
    this.isExpanded = this.questionArray.map(() => false);
  }
  
  panelOpenState = false;
  questionArray: any;

  getListing() {
    if (!this.type) {
      this.transferStateService
        .checkAndGetData(
          FAQ_NON_TYPE_KEY,
          this.apiService.get(API_ENDPOINTS.patient.faq, {}),
          []
        )
        .subscribe((res: any) => {
          this.questionArray = res?.result?.data;
          this.settingSchemaMarkUp();
        });
    } else if (this.type == "surgery") {
      this.transferStateService
        .checkAndGetData(
          FAQ_NON_TYPE_KEY,
          this.apiService.get(`${API_ENDPOINTS.patient.faqSurgeryWise}`, {
            slug: this.id,
          }),
          []
        )
        .subscribe((res: any) => {
          this.questionArray = res?.result?.data;
          this.settingSchemaMarkUp();
        });
    }
  }

  settingSchemaMarkUp() {
    const entityArray = this.questionArray.map((item: any) => ({
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
