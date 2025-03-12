import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "nectar-terms-conditions",
  templateUrl: "./terms-conditions.component.html",
  styleUrls: ["./terms-conditions.component.scss"],
})
export class TermsConditionsComponent implements OnInit, OnDestroy {
  constructor(
    private eventService: EventService,
    private title: Title,
    private seoService: SeoService,
    @Inject(DOCUMENT) public document: any
  ) {}
  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.eventService.broadcastEvent("bgColor", "orange");
  }

  settingTagsAndTitles() {
    //setting title and description
    this.title.setTitle(
      "Terms and Conditions | Nectar Home - Your Agreement for Seamless Healthcare"
    );
    // this.meta.addTags();
    this.seoService.noIndexRobot();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Welcome to Nectar Home's Terms and Conditions page. This section outlines the rules, guidelines, and agreements governing your use of our website's services. Please review these terms carefully as they govern your interactions and transactions on our platform. By using Nectar Home, you agree to abide by these terms, ensuring a seamless and secure experience. We are dedicated to providing transparent and fair conditions, prioritizing your well-being and convenience throughout your journey with us.",
      },
      {
        property: "og:title",
        content:
          "Terms and Conditions | Nectar Home - Your Agreement for Seamless Healthcare",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: this.document.location.href,
      },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
      {
        property: "og:description",
        content:
          "Welcome to Nectar Home's Terms and Conditions page. This section outlines the rules, guidelines, and agreements governing your use of our website's services. Please review these terms carefully as they govern your interactions and transactions on our platform. By using Nectar Home, you agree to abide by these terms, ensuring a seamless and secure experience. We are dedicated to providing transparent and fair conditions, prioritizing your well-being and convenience throughout your journey with us.",
      },
      {
        property: "og:image:alt",
        content: "A photo of a stack of legal documents.",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "628",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: this.document.location.href,
      },
      {
        name: "twitter:title",
        content:
          "Terms and Conditions | Nectar Home - Your Agreement for Seamless Healthcare",
      },
      {
        name: "twitter:description",
        content:
          "Welcome to Nectar Home's Terms and Conditions page. This section outlines the rules, guidelines, and agreements governing your use of our website's services. Please review these terms carefully as they govern your interactions and transactions on our platform. By using Nectar Home, you agree to abide by these terms, ensuring a seamless and secure experience. We are dedicated to providing transparent and fair conditions, prioritizing your well-being and convenience throughout your journey with us.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }

  ngOnDestroy() {
    this.eventService.broadcastEvent("bgColor", "white");
    this.seoService.indexAndFollowRobot();
  }
}
