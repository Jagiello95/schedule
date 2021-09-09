import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemYComponent } from './item-y.component';

describe('ItemYComponent', () => {
  let component: ItemYComponent;
  let fixture: ComponentFixture<ItemYComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemYComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemYComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
