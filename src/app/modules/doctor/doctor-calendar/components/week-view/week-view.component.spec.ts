import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WeekViewComponent } from "./WeekViewComponent";

describe("WeekViewComponent", () => {
  let component: WeekViewComponent;
  let fixture: ComponentFixture<WeekViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeekViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeekViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
