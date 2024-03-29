import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutsComponent } from './layouts.component';

describe('HomePageComponent', () => {
  let component: LayoutsComponent;
  let fixture: ComponentFixture<LayoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
