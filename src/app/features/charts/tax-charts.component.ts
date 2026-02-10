import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalcResults } from '../../core/models/result.model';

@Component({
  selector: 'app-tax-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tax-charts.component.html',
  styleUrl: './tax-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxChartsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) results!: CalcResults;
  @Input({ required: true }) period!: 'monthly' | 'yearly';

  @ViewChild('chartCanvas', { static: true }) canvas?: ElementRef<HTMLCanvasElement>;
  private chart: any;
  private viewReady = false;

  async ngAfterViewInit(): Promise<void> {
    this.viewReady = true;
    await this.renderChart();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.viewReady) {
      return;
    }
    if (changes['results'] || changes['period']) {
      await this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private async renderChart(): Promise<void> {
    if (!this.canvas || !this.results) {
      return;
    }

    const { Chart } = await import('chart.js/auto');
    if (this.chart) {
      this.chart.destroy();
    }

    const result = this.results[this.period];
    const data = [result.taxes.total, result.insurance.total, result.net];

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Taxes', 'Insurance', 'Net'],
        datasets: [
          {
            data,
            backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)'],
            borderColor: ['rgba(255, 99, 132, 0.9)', 'rgba(54, 162, 235, 0.9)', 'rgba(75, 192, 192, 0.9)'],
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#dbe4ff'
            }
          }
        }
      }
    });
  }
}
