import { Injectable, inject, signal } from '@angular/core';
import { SalaryFormValues, DEFAULT_FORM_VALUES } from '../../core/models/form.model';
import { TaxConfig } from '../../core/models/tax-config.model';
import { CalcResults } from '../../core/models/result.model';
import { CalcHistoryEntry } from '../../core/models/history.model';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { TaxConfigService } from '../../core/services/tax-config.service';
import { LiveApiService } from '../../core/services/live-api.service';
import { calculateNetSalary } from '../../core/utils/calc/calculate-net-salary';
import { hashString, stableStringify } from '../../core/utils/hash';

export type LoadingState = 'idle' | 'loading' | 'error';

const HISTORY_KEY = 'salaryCalcHistory';
const LIVE_MODE_KEY = 'salaryCalcLiveMode';
const LIVE_CACHE_PREFIX = 'salaryCalcLiveCache:';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private storage = inject(LocalStorageService);
  private taxConfigService = inject(TaxConfigService);
  private liveApi = inject(LiveApiService);

  readonly formValues = signal<SalaryFormValues>(DEFAULT_FORM_VALUES);
  readonly taxConfig = signal<TaxConfig | null>(null);
  readonly results = signal<CalcResults | null>(null);
  readonly history = signal<CalcHistoryEntry[]>(this.storage.get(HISTORY_KEY, []));
  readonly liveMode = signal<boolean>(this.storage.get(LIVE_MODE_KEY, false));
  readonly loadingState = signal<{ taxConfig: LoadingState; liveCalc: LoadingState }>({
    taxConfig: 'idle',
    liveCalc: 'idle'
  });
  readonly lastError = signal<string | null>(null);

  private lastHash = '';
  private liveRequestId = 0;

  initialize(): void {
    this.loadingState.update((state) => ({ ...state, taxConfig: 'loading' }));
    this.taxConfigService.loadTaxConfig().subscribe({
      next: (config) => {
        this.taxConfig.set(config);
        this.loadingState.update((state) => ({ ...state, taxConfig: 'idle' }));
        this.calculate();
      },
      error: () => {
        this.loadingState.update((state) => ({ ...state, taxConfig: 'error' }));
        this.lastError.set('Failed to load tax configuration.');
      }
    });
  }

  refreshTaxConfig(): void {
    this.loadingState.update((state) => ({ ...state, taxConfig: 'loading' }));
    this.taxConfigService.loadTaxConfig(true).subscribe({
      next: (config) => {
        this.taxConfig.set(config);
        this.loadingState.update((state) => ({ ...state, taxConfig: 'idle' }));
        this.lastError.set(null);
        this.calculate(true);
      },
      error: () => {
        this.loadingState.update((state) => ({ ...state, taxConfig: 'error' }));
        this.lastError.set('Unable to refresh tax data.');
      }
    });
  }

  updateFormValues(values: SalaryFormValues): void {
    this.formValues.set(values);
    this.calculate();
  }

  toggleLiveMode(enabled: boolean): void {
    this.liveMode.set(enabled);
    this.storage.set(LIVE_MODE_KEY, enabled);
    this.calculate(true);
  }

  private calculate(force = false): void {
    const config = this.taxConfig();
    const values = this.formValues();
    if (!config) {
      return;
    }

    const hash = hashString(stableStringify({ values, year: config.year, live: this.liveMode() }));
    if (!force && hash === this.lastHash) {
      return;
    }
    this.lastHash = hash;

    if (this.liveMode()) {
      const cacheKey = `${LIVE_CACHE_PREFIX}${hash}`;
      if (!force) {
        const cached = this.storage.get<CalcResults | null>(cacheKey, null);
        if (cached) {
          this.results.set(cached);
          this.loadingState.update((state) => ({ ...state, liveCalc: 'idle' }));
          this.lastError.set(null);
          return;
        }
      }

      this.loadingState.update((state) => ({ ...state, liveCalc: 'loading' }));
      const requestId = ++this.liveRequestId;
      this.liveApi.calculate(values).subscribe({
        next: (result) => {
          if (requestId !== this.liveRequestId) {
            return;
          }
          this.results.set(result);
          this.storage.set(cacheKey, result);
          this.loadingState.update((state) => ({ ...state, liveCalc: 'idle' }));
          this.lastError.set(null);
          this.addHistory(values, result);
        },
        error: (err: Error) => {
          if (requestId !== this.liveRequestId) {
            return;
          }
          this.loadingState.update((state) => ({ ...state, liveCalc: 'error' }));
          this.lastError.set(err.message || 'Live API error. Falling back to local calculation.');
          const localResult = calculateNetSalary(values, config);
          this.results.set(localResult);
          this.addHistory(values, localResult);
        }
      });
      return;
    }

    const localResult = calculateNetSalary(values, config);
    this.results.set(localResult);
    this.loadingState.update((state) => ({ ...state, liveCalc: 'idle' }));
    this.lastError.set(null);
    this.addHistory(values, localResult);
  }

  private addHistory(values: SalaryFormValues, result: CalcResults): void {
    const existing = this.history()[0];
    if (existing && hashString(stableStringify(existing.inputs)) === hashString(stableStringify(values))) {
      return;
    }

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

    const entry: CalcHistoryEntry = {
      id,
      timestamp: new Date().toISOString(),
      inputs: values,
      results: result
    };

    const updated = [entry, ...this.history()].slice(0, 10);
    this.history.set(updated);
    this.storage.set(HISTORY_KEY, updated);
  }
}
