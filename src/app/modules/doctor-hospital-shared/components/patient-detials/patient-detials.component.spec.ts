import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetialsComponent } from './patient-detials.component';

describe('PatientDetialsComponent', () => {
  let component: PatientDetialsComponent;
  let fixture: ComponentFixture<PatientDetialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDetialsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDetialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
