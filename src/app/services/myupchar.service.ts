import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { Data } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class MyupcharService {
  [x: string]: any;
  private wishlist: any[] = [];
  catagroy = new Subject();
  fetchData() {
    throw new Error('Method not implemented.');
  }
  private getdata = 'https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&page=289'
  private categaryapi = 'https://www.myupchar.com/api/medicine/get_categories?api_key=a0a0f66fac42dbc1a1c5604c682731ed'
  private serchapi = 'https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&category_id='
  private productapi = 'https://www.myupchar.com/api/medicine/search?api_key=a0a0f66fac42dbc1a1c5604c682731ed&page=1&category_id='
  private singleProduct = 'https://www.myupchar.com/api/medicine/detail?api_key=a0a0f66fac42dbc1a1c5604c682731ed&product_id='
  constructor(private http: HttpClient) {

  }
  getviewdata(): Observable<any> {
    return this.http.get<any>(this.getdata);
  }
  getcategy(): Observable<any> {
    return this.http.get<any>(this.categaryapi);
  }
  Seachapi(id): Observable<any> {
    return this.http.get<any>(this.serchapi + `${id}`);
  }
  getProducts(id: any): Observable<any> {
    return this.http.get<any>(this.productapi + `${id}`);
  }
  getSingleProduct(id: any): Observable<any> {
    return this.http.get<any>(this.singleProduct + `${id}`);
  }

  private medicinedata = new BehaviorSubject<any[]>([]);
  medicinedata$ = this.medicinedata.asObservable();

  setMedicinedata(data: any[]) {
    this.medicinedata.next(data);
  }


  loadWishlist(): void {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        this.wishlist = JSON.parse(storedWishlist) || [];
      }
    } catch (error) {
      console.error('Failed to load wishlist from local storage', error);
      this.wishlist = [];
    }
  }

  getWishlist(): any[] {
    return this.wishlist;
  }

  addToWishlist(product: any) {
    const exists = this.wishlist.find(item => item.id === product.id);
    if (!exists) {
      this.wishlist.push(product);
      this.updateLocalStorage();
    }
  }

  removeFromWishlist(productId: any) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.updateLocalStorage();
  }

  private updateLocalStorage() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }



  generateSitemap(categoryId: any): Observable<string> {
    return this.getProducts(categoryId).pipe(
      map((data: any) => {
        // Assuming data contains an array of products
        const products = data.products || [];
        const baseUrl = 'http://localhost:54135/medicines/all-medicines/';

        // Start the XML structure
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        products.forEach((product: any) => {
          const productUrl = `${baseUrl}${product.product_id}`;
          xml += `  <url>\n`;
          xml += `    <loc>${productUrl}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        });

        // Close the XML structure
        xml += `</urlset>`;

        return xml;
      })
    );
  }

}