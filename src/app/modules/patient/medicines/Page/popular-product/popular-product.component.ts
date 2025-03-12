import { Component, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef, Inject, Input, AfterViewInit } from '@angular/core';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';
import { DOCUMENT } from '@angular/common';
// import { SharedModule } from "../../../../../shared/shared.module";

@Component({
  selector: 'nectar-popular-product',
  templateUrl: './popular-product.component.html',
  styleUrls: ['./popular-product.component.scss'],
  // imports: [SharedModule]
})
export class PopularProductComponent implements OnInit {
  activeTab: number = 1;
  data: any[] = [];
  filteredData: any[] = []; // Array to hold filtered data
  categories: any[] = [];
  currentUrl: string;
  pageNumber: number = 1;
  selectedCategoryIds: number[] = [];
  selectedFilter: string = 'All';
  expandedCategories: Set<number> = new Set<number>();
  dataArray: string[] = [];
  categoryPath: any;
  allProductUrls: string[] = []; // Array to store sitemap URLs
  @Input() productData: any[] = [];
  categoriesname: any;
  categoryNameurl: any;
  categor: any;
  newData: any = [];
  newArr: any[];
  starSize: string = '30px'; // Example size
  constructor(
    private dataService: MyupcharService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title,
    private actroute: ActivatedRoute,
    private SeoService: SeoService,
    private myUpchar: MyupcharService,
    @Inject(DOCUMENT) public document: any

  ) { }
  ngOnInit(): void {

    this.myUpchar.medicinedata$.subscribe(data => {
      this.productData = data;
      if (this.productData) {
        this.newArr = [...this.productData]
      }
    });

    this.settingTagsAndTitles();
    this.fetchAllData(this.pageNumber);
    this.dataService.getcategy().subscribe(response => {
      this.categories = response.data || [];
    });
    this.currentUrl = this.router.url;

    this.filterData()

  }


  viewProduct(productId: number, name: string): void {
    const encodedName = name
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/\+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\([^\)]*\)/g, '')
    .toLocaleLowerCase();    this.router.navigate(['medicines/details', productId, encodedName]);
  }

  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }

  toggleChildrenVisibility(categoryId: number, type: 'desktop' | 'mobile'): void {
    const categoryElement = document.getElementById(`${type}-category-${categoryId}`);
    if (categoryElement) {
      if (categoryElement.classList.contains('hidden')) {
        categoryElement.classList.remove('hidden');
        this.expandedCategories.add(categoryId);
      } else {
        categoryElement.classList.add('hidden');
        this.expandedCategories.delete(categoryId);
      }
    }
  }
  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }


  selectCategory(categoryId: number, categoryName: any): void {
    this.productData = [];
    this.categoryNameurl = categoryName;

    if (this.selectedCategoryIds.includes(categoryId)) {
      this.selectedCategoryIds = [];
    } else {
      this.selectedCategoryIds = [categoryId];
    }
  }


  fetchData(): void {
    this.data = [];
    const promises = this.selectedCategoryIds.map(categoryId => {
      const apiUrl = `https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&page=2&category_id=${categoryId}`;
      return this.http.get(apiUrl).toPromise();
    });
    Promise.all(promises).then(results => {
      this.data = results.flatMap((result: any) => result.data);
      this.filterData();
      this.updateUrl();
      this.cdr.detectChanges();
    });
  }

  fetchAllData(page: number): void {
    const apiUrl = `https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&page=${page}`;
    this.http.get<any>(apiUrl).subscribe(response => {
      const newData = response.data || [];
      this.data = [...this.data, ...newData]; // Concatenate new data
      this.filterData();
      this.cdr.detectChanges();
    });
  }

  filterData(): void {
    if (this.selectedFilter === 'All') {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => item.otc_type === this.selectedFilter);
    }
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterData();
  }

  viewMore(): void {
    this.pageNumber++;
    this.fetchAllData(this.pageNumber);
  }


  settingTagsAndTitles() {
    this.title.setTitle(
      "Shop Medicines & Health Products Online | India's Reliable Medical Store | Nectarplus.health"
    );
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
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/blog/wp-content/uploads/2023/09/nector-logo.png",
      },
    ]);
  }


  updateUrl(): void {
    const buildCategoryPath = (categories: any[], selectedId: number, path: string[] = []): string[] => {
      for (const category of categories) {
        if (category.category_id === selectedId) {
          path.push(category.name_en);
          return path;
        }
        if (category.children && category.children.length > 0) {
          const childPath = buildCategoryPath(category.children, selectedId, [...path, category.name_en]);
          if (childPath.length) {
            return childPath;
          }
        }
      }
      return [];
    };

    const selectedCategoryId = this.selectedCategoryIds[0];
    if (selectedCategoryId) {
      const categoryPath = buildCategoryPath(this.categories, selectedCategoryId).join('/');
      this.router.navigate(
        ['/medicines/all-medicines', categoryPath.replace(/\s+/g, '-').toLowerCase()],
        { relativeTo: this.actroute }
      );
    }
  }

  
}
