import { PeriodType } from './form.model';

export interface TaxBreakdown {
  incomeTax: number;
  solidarityTax: number;
  churchTax: number;
  total: number;
}

export interface InsuranceBreakdown {
  health: number;
  pension: number;
  unemployment: number;
  nursing: number;
  total: number;
}

export interface CalcResult {
  period: PeriodType;
  gross: number;
  net: number;
  taxes: TaxBreakdown;
  insurance: InsuranceBreakdown;
  effectiveTaxRate: number;
}

export interface CalcResults {
  monthly: CalcResult;
  yearly: CalcResult;
  source: 'local' | 'live';
}
