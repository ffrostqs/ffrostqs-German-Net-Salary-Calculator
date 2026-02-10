export type PeriodType = 'monthly' | 'yearly';

export type HealthInsuranceType = 'public' | 'private';

export interface SalaryFormValues {
  period: PeriodType;
  year: number;
  gross: number;
  benefits: number;

  age: number;
  state: string;
  taxClass: number;
  children: boolean;
  churchTax: boolean;
  taxAllowance: number;

  healthInsuranceType: HealthInsuranceType;
  healthAdditionalRate: number;
  pensionInsurance: boolean;
  unemploymentInsurance: boolean;
}

export const DEFAULT_FORM_VALUES: SalaryFormValues = {
  period: 'monthly',
  year: new Date().getFullYear(),
  gross: 4500,
  benefits: 0,
  age: 30,
  state: 'BE',
  taxClass: 1,
  children: false,
  churchTax: false,
  taxAllowance: 0,
  healthInsuranceType: 'public',
  healthAdditionalRate: 1.3,
  pensionInsurance: true,
  unemploymentInsurance: true
};
