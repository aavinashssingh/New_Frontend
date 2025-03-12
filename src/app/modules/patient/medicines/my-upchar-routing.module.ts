import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexPageComponent } from './index-page/index-page.component';
import { WishlistPageComponent } from '../medicines/wishlist-page/wishlist-page.component';
import { ViewComponent } from './Page/view/view.component';
import { LayoutComponent } from './layout.component';
import { PopularProductComponent } from './Page/popular-product/popular-product.component';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: IndexPageComponent
      },
      {
        path: 'details/:id/:name',
        component: ViewComponent
      }
,            {
        path: 'wishlist',
        component: WishlistPageComponent
      },
      {
        path: 'all-medicines',
        component: PopularProductComponent
      },
      {
        path: 'all-medicines/:categoryName',
        component: PopularProductComponent
      },
      {
        path: 'all-medicines/:categoryName/:categoryName',
        component: PopularProductComponent
      },
      {
        path: 'all-medicines/:categoryName/:categoryName/:categoryName',
        component: PopularProductComponent
      },
      {
        path: 'all-medicines/:categoryName/:categoryName/:categoryName/:categoryName',
        component: PopularProductComponent
      },
    ]
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyUpcharRoutingModule { }
