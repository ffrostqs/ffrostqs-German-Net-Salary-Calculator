import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SalaryFormComponent } from './features/salary-form/salary-form.component';
import { ResultsPanelComponent } from './features/results-panel/results-panel.component';
import { AppStore } from './store/signals-store/app.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SalaryFormComponent, ResultsPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(private store: AppStore) {}

  ngOnInit(): void {
    this.store.initialize();
  }
}
