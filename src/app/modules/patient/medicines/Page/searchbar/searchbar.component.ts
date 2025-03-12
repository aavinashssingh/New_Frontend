import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'nectar-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
  category = [];
  currentUrl: string;
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  @ViewChild('searchInput') searchInput!: ElementRef; // Reference to the input element
  searchQuery: string = '';

  constructor(private service: MyupcharService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects; // Use urlAfterRedirects to get the current URL
        if (this.currentUrl === '/medicines/details') {
          this.resetSearchInput();
        }
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query; // Update the searchQuery property

    if (query.length >= 4) {
      const apiUrl = `https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&name=${query}`;
      this.http.get<any>(apiUrl).subscribe(response => {
        this.suggestions = response.data || [];
        this.showSuggestions = true;
      });
    } else {
      this.clearSuggestions();
    }
  }

  goToProduct(productId: number, name: string): void {
    const encodedName = name
      .replace(/\s+/g, '-')
      .replace(/'/g, '')
      .replace(/\+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/\([^\)]*\)/g, '')
      .toLocaleLowerCase();
    this.router.navigate(['medicines/details', productId, encodedName]);
    this.resetSearchInput();
  }
  //added by gurmeet
  resetSearchInput(): void {
    this.searchQuery = '';
    this.clearSuggestions();
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  };
  clearSuggestions(): void {
    this.suggestions = [];
    this.showSuggestions = false;
  }

  getSelectedData(name_en: string) {
    const selectedCategory = this.category.find(cat => cat.name_en === name_en);
    if (selectedCategory) {
      // console.log(selectedCategory.children);
    }
  }
}
