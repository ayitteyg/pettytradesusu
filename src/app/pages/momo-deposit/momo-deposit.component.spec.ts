import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomoDepositComponent } from './momo-deposit.component';

describe('MomoDepositComponent', () => {
  let component: MomoDepositComponent;
  let fixture: ComponentFixture<MomoDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MomoDepositComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MomoDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
