import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjScheduleComponent } from './aj-schedule.component';

describe('AjScheduleComponent', () => {
  let component: AjScheduleComponent;
  let fixture: ComponentFixture<AjScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
