import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from "@angular/common";
import { SeoService } from 'src/app/services/seo.service';
import { json } from 'express';
import { MyupcharService } from 'src/app/services/myupchar.service';

@Component({
  selector: 'nectar-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss']
})
export class IndexPageComponent implements OnInit {

  activeTab: number = 1;
  medicinedata: any[] = [];
  filteredData: any[] = []; // Array to hold filtered data
  currentUrl: string;
  pageNumber: number = 1;
  selectedCategoryIds: number[] = [];
  selectedFilter: string = 'All';
  catgryname: any;
  category: { imgSrc: string; text: string; containerClass: string; Id: string; };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private SeoService: SeoService,
    private myUpchar:MyupcharService,
    @Inject(DOCUMENT) public document: any

  ) { }
  interval: any;
  categories = [
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Sexual-Health-Image.png',
      text: 'Sexual Health',
      containerClass: 'con-1',
      Id: '1'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Women-Care-Image.png',
      text: 'Women Care',
      containerClass: 'con-2',
      Id: '2'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Heart-Care-Image.png',
      text: 'Health and Nutrition',
      containerClass: 'con-3',
      Id: '6'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Oral-and-Dental-Care-Image.png',
      text: 'Oral and Dental Care',
      containerClass: 'con-4',
      Id: '40'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Heart-Care-Image.png',
      text: 'Eye Care',
      containerClass: 'con-5',
      Id: '50'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Mental-Healt-Image.png',
      text: 'Mental Health',
      containerClass: 'con-6',
      Id: '75'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Baby-Care-Image.png',
      text: 'Baby Care',
      containerClass: 'con-7',
      Id: '90'
    },
    {
      imgSrc: '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/First-Aid-Image.png',
      text: 'First Aid',
      containerClass: 'con-8',
      Id: '116'
    }
  ]

  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.fetchData();

  }

  selectCategory(categoryId: number): void {
    this.category = this.categories.find(cat => cat.Id === categoryId.toString());
    if (!this.category) {
      return;
    }
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index === -1) {
      this.selectedCategoryIds.push(categoryId);
      this.fetchData();
    } else {
      this.selectedCategoryIds.splice(index, 1);
    }
  };


  
  fetchData(): void {
    this.medicinedata = [];
    const promises = this.selectedCategoryIds.map(categoryId => {
      const apiUrl = `https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&page=2&category_id=${categoryId}`;
      return this.http.get(apiUrl).toPromise();
    });
    Promise.all(promises).then(results => {
      this.medicinedata = results.flatMap((result: any) => result.data); // Store fetched data
      this.router.navigate(['/medicines/all-medicines/', this.category.text.replace(/\s+/g, '-').toLocaleLowerCase()], { state: { data: this.medicinedata } });

      this.myUpchar.setMedicinedata(this.medicinedata);
      this.cdr.detectChanges(); // Ensure the UI updates with the fetched data
    }).catch(error => {
      // console.warn('Error fetching data', error);
    });
  }










  //seo contant
  settingTagsAndTitles() {
    this.title.setTitle(
      "Shop Medicines & Health Products Online | India's Reliable Medical Store | Nectarplus.health"
    );
    // this.meta.addTags();
    this.SeoService.updateTags([
      {
        name: "description",
        content: "Shop for medicines and health essentials online with confidence at Nectar Health, India's reliable medical store. Enjoy fast delivery, premium-quality products, and expert advice to address all your health and wellness needs. With Nectar Health, you can trust exceptional service and care for your well-being."
      },
      {
        name: "og:title",
        content:
          "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
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
        name: "twitter:card",
        property: "summary_large_image",
      },
      // {
      //   name: "twitter:site",
      //   property: this.document.location.href,
      // },
      // {
      //   name: "twitter:title",
      //   property:
      //     "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
      // },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }
}
