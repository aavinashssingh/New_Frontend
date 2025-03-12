import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnInit, Renderer2 } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { SeoService } from "src/app/services/seo.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-home-wrapper",
  templateUrl: "./home-wrapper.component.html",
})
export class HomeWrapperComponent implements OnInit {
  constructor(
    private title: Title,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private router: Router,

    @Inject(DOCUMENT) public document: any,
    private localStorage: LocalStorageService,

  ) {}

  
  ngOnInit(): void {

    const routes = {
      2: ROUTE_CONSTANT.DOCTOR.dashboard,
      3: ROUTE_CONSTANT.HOSPITAL.dashboard,
    };

    const isLogged = this.localStorage.getItem("isLogged");
    const userType = this.localStorage.getItem("userType");
    
    if(isLogged && userType){
      this.router.navigate([routes[userType]])
    }
    this.addingTagsAndTitle();
    this.settingSchemaMarkups();
  }

  addingTagsAndTitle() {
    this.title.setTitle(
      "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in India"
    );

    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Welcome to Nectar Home - Your one-stop destination for online doctor consultations and hospital booking in India. Connect with skilled doctors, book appointments effortlessly, and access multiple hospitals from the comfort of your home. Experience seamless healthcare access with Nectar Home.",
      },
      {
        property: "og:title",
        content:
          "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in  India",
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
          "Welcome to Nectar Home - Your one-stop destination for online doctor consultations and hospital booking in India. Connect with skilled doctors, book appointments effortlessly, and access multiple hospitals from the comfort of your home. Experience seamless healthcare access with Nectar Home.",
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
          "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in India",
      },
      {
        name: "twitter:description",
        content:
          "Welcome to Nectar Home - Your one-stop destination for online doctor consultations and hospital booking in India. Connect with skilled doctors, book appointments effortlessly, and access multiple hospitals from the comfort of your home. Experience seamless healthcare access with Nectar Home.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }

  settingSchemaMarkups() {
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nectar Plus Health",
      url: this.document.location.origin,
      logo: "https://nectorplus.s3.ap-south-1.amazonaws.com/aa697f30-31bb-11ee-a0c0-ad1b782616cb-Nectar%20Logo.png",
      description:
        "We are a leading healthcare organization dedicated to providing quality medical services.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+918810232143",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "1032, 11th Floor, Westend Mall, Janakpuri West",
        addressLocality: "Janakpuri",
        addressRegion: "New Delhi",
        postalCode: "110058",
        addressCountry: "India",
      },
      sameAs: [
        "https://www.facebook.com/nectarplushealth",
        "https://twitter.com/nectarhealth_IN",
        "https://www.instagram.com/nectarplushealth/",
        "https://www.youtube.com/@nectarplushealth",
        "https://www.linkedin.com/company/nectar-plus-health/about/",
      ],
    };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  settingHomeSchema() {
    let content = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Nectar Plus Health",
      url: this.document.location.origin,
      description:
        "We are a leading healthcare organization dedicated to providing quality medical services.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${this.document.location.origin}/{city}/{search}`,
        "query-input": [
          {
            "@type": "PropertyValueSpecification",
            valueName: "city",
            valueRequired: true,
          },
          {
            "@type": "PropertyValueSpecification",
            valueName: "search",
            valueRequired: true,
          },
        ],
      },
      sameAs: [
        "https://www.facebook.com/nectarplushealth",
        "https://twitter.com/nectarhealth_IN",
        "https://www.instagram.com/nectarplushealth/",
        "https://www.youtube.com/@nectarplushealth",
        "https://www.linkedin.com/company/nectar-plus-health/about/",
      ],
      image: [
        {
          "@type": "ImageObject",
          url: "https://nectorplus.s3.ap-south-1.amazonaws.com/aa697f30-31bb-11ee-a0c0-ad1b782616cb-Nectar%20Logo.png",
        },
      ],
    };
    this.seoService.setJsonLd(this._renderer2, content);
  }
}
