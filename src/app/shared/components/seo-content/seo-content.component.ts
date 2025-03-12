import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "nectar-seo-content",
  templateUrl: "./seo-content.component.html",
  styleUrls: ["./seo-content.component.scss"],
})
export class SeoContentComponent implements OnInit {
  @Input() allowDescription: boolean = true;
  @Input() data: any = "";
  @Input() city: string = "";
  @Input() search: string = "";
  isExpanded: boolean = false;

  deviceWidth: any;
  constructor(
    private sanitizer: DomSanitizer,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  sanitizeHtml(html: string): string {
    if (html) {
      html = html.replace(/@variable/g, this.city); 
      html = html.replace(/&amp;nbsp;/g, "&nbsp;"); 
    }
  
    // Bypass security trust (sanitize the resulting HTML)
    return this.sanitizer.bypassSecurityTrustHtml(html) as string;
  }
  

  toggleDescription() {
    this.isExpanded = !this.isExpanded;
  }
}
