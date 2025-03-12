import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { AdressedService } from 'src/app/services/adressed.service';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { ImageViewModalComponent } from 'src/app/shared/image-view-modal/image-view-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'nectar-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  isPopupVisible = false;
  id: number;
  titlemeta: any;
  productDetails: any = {};
  discountPercentage: string;
  relateddata: any[] = [];
  breadcrumb: any = [];
  name: string;
  UrlName: any;
  breadcrumbText: any;
  discrptiondata: any;
  mrp: any;
  constructor(
    private dataService: MyupcharService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private adressservies: AdressedService,
    private meta: Meta,
    private title: Title,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private SeoService: SeoService,
    private viewportScroller: ViewportScroller,
    @Inject(DOCUMENT) public document: any
  ) {
    this.discrptiondata = `Shop for ${this.name}  medicines and health essentials online with confidence at Nectar Health,India's reliable medical store. Enjoy fast delivery, premium-quality products,and expert advice to address all your health and wellness needs.With Nectar Health, .`
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.actRoute.params.subscribe(params => {
      this.id = +params['id']; // Convert id to number
      this.name = params['name'].replace(/\s+/g, '-').replace(/-/g, ' ').toLowerCase();
      this.fetchProductDetails(this.id, this.name);
    });

    //Realted Product fun
    this.dataService.getviewdata().subscribe((d) => {
      this.relateddata = d.data;
    });
    //tag and title service
    this.meta.addTag({ name: 'keywords', content: `${this.name} | Nectarplus.health` });
    this.meta.addTag({ name: 'breadcrumb', content: this.breadcrumb });
    this.settingTagsAndTitles();
    this.addJsonLdScript();
  }

  viewProduct(productId: number, name: string): void {
    const encodedName = name
      .replace(/\s+/g, '-')
      .replace(/'/g, '')
      .replace(/\+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/\([^\)]*\)/g, '')
      .toLocaleLowerCase();
    this.router.navigate(['medicines/details', productId, encodedName]).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]); // Scroll to the top
    });
  }

  fetchProductDetails(id: number, name: string): void {
    this.dataService.getSingleProduct(id).subscribe((res: any) => {
      this.productDetails = res.details;
      this.breadcrumb = this.productDetails.breadcrumb.breadcrumb_en;
      const breadcrumbString = this.breadcrumb.slice(1).map(item => item.text).join(' > ');
      this.meta.updateTag({ name: 'breadcrumb', content: breadcrumbString });

      // Calculate and log the discount percentage for the first offer
      if (this.productDetails.offers && this.productDetails.offers.length > 0) {
        const offer = this.productDetails.offers[0];
        const mrp = offer.mrp;
        const finalPrice = offer.final_price;
        if (mrp !== undefined && finalPrice !== undefined && mrp > 0) {
          const discountPercentage = ((mrp - finalPrice) / mrp) * 100;
          const formattedDiscount = discountPercentage.toFixed(0);
          this.discountPercentage = formattedDiscount
        }
      } else {
        // console.log('No offers available.');
      }
    });
  }


  //===================================
  //seo content work here
  settingTagsAndTitles() {
    this.title.setTitle(
      this.name
        .split(' ') // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
        .join(' ')
    );


    // this.meta.addTags();
    this.SeoService.updateTags([
      {
        name: "description",
        content: `${this.discrptiondata}`
      },
      {
        name: "og:title",
        content:
          `Nectar:${this.name}`,
      },
      {
        property: "og:type",
        content: "Product:eCommerce",
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
        content: `Buy Online ${this.name},${this.productDetails.form} at Best Prices in India from trusted brands ✔Free shipping all over India  ✔ Return policy | Nectarplus.health`
      },
      {
        name: "twitter:card",
        property: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
      },
      {
        property: "twitter:description",
        content: `${this.discrptiondata}`
      },
      {
        property: "twitter:url",
        cotent: this.document.location.href
      },

      // {
      //   name: "og:product_category",
      //   content:
      //     `${this.productDetails.product_category.name_en ,this.productDetails.product_category.permalink}`
      // },
      // {
      //   type: 'application/ld+json',
      //   content: JSON.stringify(breadcrumbJsonLd)
      // }
    ]);
  }
  addJsonLdScript() {
    if (!this.productDetails) {
      // console.error('Product details not loaded');
      return;
    }

    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": this.name,
      "description": this.discrptiondata,
      "sku": this.id,
      "brand": {
        "@type": "Brand",
        "name": this.productDetails.otc_type
      },
      "offers": {
        "@type": "Offer",
        "url": this.document.location.href,
        "priceCurrency": "INR",  // Replace with the appropriate currency code if necessary
        "price": this.mrp,
        "discount": "5%",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "NectarPlus:Medicines Product"  // Replace with the name of the selling organization
        }
      },
      "additionalType": "https://schema.org/Drug"
    }

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }


  viewImage(url: any) {
    this.dialog.open(ImageViewModalComponent, {
      data: url,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy(),
    });
  }
}








