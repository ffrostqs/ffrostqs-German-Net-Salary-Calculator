import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppStore } from './store/signals-store/app.store';

class AppStoreStub {
  initialize() {}
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: AppStore, useClass: AppStoreStub }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
