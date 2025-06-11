import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiipingDetailsComponent } from './shipping-details.component';

describe('ShiipingDetailsComponent', () => {
  let component: ShiipingDetailsComponent;
  let fixture: ComponentFixture<ShiipingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiipingDetailsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ShiipingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
