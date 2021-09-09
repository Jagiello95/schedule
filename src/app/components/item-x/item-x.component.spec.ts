import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemXComponent } from './item-x.component';

describe('ItemXComponent', () => {
  let component: ItemXComponent;
  let fixture: ComponentFixture<ItemXComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemXComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
