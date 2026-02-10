import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { SalaryFormValues } from '../models/form.model';
import { CalcResults, CalcResult } from '../models/result.model';
import { LIVE_API_CONFIG } from '../utils/runtime-config';

export interface LiveApiResponse {
  monthly: CalcResult;
  yearly: CalcResult;
}

@Injectable({ providedIn: 'root' })
export class LiveApiService {
  constructor(private http: HttpClient) {}

  calculate(values: SalaryFormValues): Observable<CalcResults> {
    if (!LIVE_API_CONFIG.url) {
      return throwError(() => new Error('Live API URL is not configured.'));
    }

    const headers = LIVE_API_CONFIG.apiKey
      ? new HttpHeaders({ Authorization: `Bearer ${LIVE_API_CONFIG.apiKey}` })
      : undefined;

    return this.http.post<LiveApiResponse>(LIVE_API_CONFIG.url, values, { headers }).pipe(
      map((response) => ({
        monthly: response.monthly,
        yearly: response.yearly,
        source: 'live' as const
      }))
    );
  }
}
