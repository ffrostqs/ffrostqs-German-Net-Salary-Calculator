import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '../../store/signals-store/app.store';
import { TaxChartsComponent } from '../charts/tax-charts.component';
import { CalcResults } from '../../core/models/result.model';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule, TaxChartsComponent],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsPanelComponent {
  displayPeriod = signal<'monthly' | 'yearly'>('monthly');

  constructor(public store: AppStore) {}

  setPeriod(period: 'monthly' | 'yearly'): void {
    this.displayPeriod.set(period);
  }

  getResult(results: CalcResults) {
    return results[this.displayPeriod()];
  }

  getComparison(results: CalcResults) {
    const history = this.store.history();
    if (history.length < 2) {
      return null;
    }
    const current = results[this.displayPeriod()].net;
    const previous = history[1].results[this.displayPeriod()].net;
    const rawDiff = current - previous;
    const diff = Math.abs(rawDiff);
    return {
      diff,
      direction: rawDiff >= 0 ? 'up' : 'down'
    };
  }
}
