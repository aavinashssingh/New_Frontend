import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "nectar-privacy-policy",
  templateUrl: "./privacy-policy.component.html",
  styleUrls: ["./privacy-policy.component.scss"],
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  constructor(
    private eventService: EventService,
    private title: Title,
    private seoService: SeoService,
    @Inject(DOCUMENT) public document: any
  ) {}
  // subscription: any;
  ngOnInit(): void {
    this.settingTitleAndTags();
    this.eventService.broadcastEvent("bgColor", "orange");
  }

  settingTitleAndTags() {
    //setting title and description
    this.title.setTitle(
      "Privacy Policy | Nectar Home - Your Data Protection and Security"
    );
    this.seoService.noIndexRobot();
    // this.meta.addTags();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "At Nectar Home, we prioritize the protection and security of your personal information. Our Privacy Policy outlines our commitment to safeguarding your data and ensuring online safety. Discover how we collect, use, and protect your confidential information while using our website's services. Rest assured that your trust is of utmost importance to us, and we strive to maintain the highest standards of data privacy. Experience peace of mind while accessing healthcare solutions with Nectar Home.",
      },
      {
        property: "og:title",
        content:
          "Privacy Policy | Nectar Home - Your Data Protection and Security",
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
          "At Nectar Home, we prioritize the protection and security of your personal information. Our Privacy Policy outlines our commitment to safeguarding your data and ensuring online safety. Discover how we collect, use, and protect your confidential information while using our website's services. Rest assured that your trust is of utmost importance to us, and we strive to maintain the highest standards of data privacy. Experience peace of mind while accessing healthcare solutions with Nectar Home.",
      },
      {
        property: "og:image:alt",
        content: "A photo of a lock with a keyhole.",
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
          "Privacy Policy | Nectar Home - Your Data Protection and Security",
      },
      {
        name: "twitter:description",
        content:
          "At Nectar Home, we prioritize the protection and security of your personal information. Our Privacy Policy outlines our commitment to safeguarding your data and ensuring online safety. Discover how we collect, use, and protect your confidential information while using our website's services. Rest assured that your trust is of utmost importance to us, and we strive to maintain the highest standards of data privacy. Experience peace of mind while accessing healthcare solutions with Nectar Home.",
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
