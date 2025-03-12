import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nectar-wishlist-page',
  templateUrl: './wishlist-page.component.html',
  styleUrls: ['./wishlist-page.component.scss']
})
export class WishlistPageComponent implements OnInit {
 text='Seeds of Change Organic Quinoa, Brown, & Red Rice'
  constructor() { }

  ngOnInit(): void {
  }

}
