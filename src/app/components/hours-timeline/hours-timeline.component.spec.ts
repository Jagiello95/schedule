import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursTimelineComponent } from './hours-timeline.component';

describe('HoursTimelineComponent', () => {
  let component: HoursTimelineComponent;
  let fixture: ComponentFixture<HoursTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoursTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
