import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TaxConfig } from '../models/tax-config.model';
import { LocalStorageService } from './local-storage.service';

const STORAGE_KEY = 'taxConfigCache';

@Injectable({ providedIn: 'root' })
export class TaxConfigService {
  constructor(private http: HttpClient, private storage: LocalStorageService) {}

  loadTaxConfig(forceRefresh = false): Observable<TaxConfig> {
    if (!forceRefresh) {
      const cached = this.storage.get<TaxConfig | null>(STORAGE_KEY, null);
      if (cached) {
        return of(cached);
      }
    }

    return this.http.get<TaxConfig>('assets/data/tax-config.json').pipe(
      tap((config) => this.storage.set(STORAGE_KEY, config))
    );
  }

  cacheTaxConfig(config: TaxConfig): void {
    this.storage.set(STORAGE_KEY, config);
  }
}
