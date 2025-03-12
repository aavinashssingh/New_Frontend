import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyUpcharRoutingModule } from './my-upchar-routing.module';
import { IndexPageComponent } from './index-page/index-page.component';
import { PopularProductComponent } from './Page/popular-product/popular-product.component';
import { SearchbarComponent } from './Page/searchbar/searchbar.component';
import { WishlistPageComponent } from './wishlist-page/wishlist-page.component';
import { AddCartPageComponent } from './add-cart-page/add-cart-page.component';
import { ViewComponent } from './Page/view/view.component';
import { LayoutComponent } from './layout.component';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingModule } from 'angular-star-rating';

@NgModule({
  declarations: [
    IndexPageComponent,
    PopularProductComponent,
    SearchbarComponent,
    WishlistPageComponent,
    AddCartPageComponent,
    ViewComponent, LayoutComponent,

  ],
  imports: [
    CommonModule,
    MyUpcharRoutingModule, FormsModule, MatToolbarModule, MatSidenavModule, MatIconModule,
    MatExpansionModule, MatListModule, MatButtonModule, HttpClientModule, SharedModule,StarRatingModule
  ]
})
export class MyUpcharModule { }
