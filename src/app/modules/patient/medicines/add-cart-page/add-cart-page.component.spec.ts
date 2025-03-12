import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCartPageComponent } from './add-cart-page.component';

describe('AddCartPageComponent', () => {
  let component: AddCartPageComponent;
  let fixture: ComponentFixture<AddCartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCartPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
