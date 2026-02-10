import { SalaryFormValues } from '../../models/form.model';
import { CalcResults, CalcResult } from '../../models/result.model';
import { TaxConfig } from '../../models/tax-config.model';
import { calculateTaxes } from './calculate-taxes';
import { calculateInsurance } from './calculate-insurance';

const round = (value: number) => Math.round(value * 100) / 100;

const buildResult = (
  period: 'monthly' | 'yearly',
  gross: number,
  taxesTotal: number,
  insuranceTotal: number,
  taxes: CalcResult['taxes'],
  insurance: CalcResult['insurance']
): CalcResult => {
  const net = gross - taxesTotal - insuranceTotal;
  const effectiveTaxRate = gross > 0 ? taxesTotal / gross : 0;

  return {
    period,
    gross: round(gross),
    net: round(net),
    taxes,
    insurance,
    effectiveTaxRate: round(effectiveTaxRate * 100)
  };
};

export const calculateNetSalary = (
  values: SalaryFormValues,
  config: TaxConfig
): CalcResults => {
  const monthlyGross = values.period === 'monthly' ? values.gross : values.gross / 12;
  const monthlyBenefits = values.period === 'monthly' ? values.benefits : values.benefits / 12;
  const annualGross = monthlyGross * 12;
  const annualBenefits = monthlyBenefits * 12;

  const childAllowance = values.children ? config.allowances.childAllowance : 0;
  const allowances = config.allowances.basicAllowance + values.taxAllowance + childAllowance;
  const taxableIncomeAnnual = Math.max(0, annualGross + annualBenefits - allowances);

  const taxesAnnual = calculateTaxes(taxableIncomeAnnual, values, config);
  const insuranceMonthly = calculateInsurance(monthlyGross, values, config);

  const taxesMonthly = {
    incomeTax: round(taxesAnnual.incomeTax / 12),
    solidarityTax: round(taxesAnnual.solidarityTax / 12),
    churchTax: round(taxesAnnual.churchTax / 12),
    total: round(taxesAnnual.total / 12)
  };

  const monthlyGrossTotal = monthlyGross + monthlyBenefits;
  const yearlyGrossTotal = annualGross + annualBenefits;

  const monthlyResult = buildResult(
    'monthly',
    monthlyGrossTotal,
    taxesMonthly.total,
    insuranceMonthly.total,
    taxesMonthly,
    insuranceMonthly
  );

  const yearlyInsurance = {
    health: round(insuranceMonthly.health * 12),
    pension: round(insuranceMonthly.pension * 12),
    unemployment: round(insuranceMonthly.unemployment * 12),
    nursing: round(insuranceMonthly.nursing * 12),
    total: round(insuranceMonthly.total * 12)
  };

  const yearlyResult = buildResult(
    'yearly',
    yearlyGrossTotal,
    taxesAnnual.total,
    yearlyInsurance.total,
    taxesAnnual,
    yearlyInsurance
  );

  return {
    monthly: monthlyResult,
    yearly: yearlyResult,
    source: 'local'
  };
};
