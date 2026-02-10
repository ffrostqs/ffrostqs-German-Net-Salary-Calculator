import { SalaryFormValues } from '../../models/form.model';
import { TaxBreakdown } from '../../models/result.model';
import { TaxConfig } from '../../models/tax-config.model';

const round = (value: number) => Math.round(value * 100) / 100;

export const calculateTaxes = (
  taxableIncomeAnnual: number,
  values: SalaryFormValues,
  config: TaxConfig
): TaxBreakdown => {
  const brackets = config.taxBrackets;
  let remaining = taxableIncomeAnnual;
  let prevCap = 0;
  let incomeTax = 0;

  for (const bracket of brackets) {
    const cap = bracket.upTo ?? Infinity;
    const taxable = Math.max(0, Math.min(remaining, cap - prevCap));
    incomeTax += taxable * bracket.rate;
    remaining -= taxable;
    prevCap = cap;
    if (remaining <= 0) {
      break;
    }
  }

  const classFactor = config.taxClasses[String(values.taxClass)]?.factor ?? 1;
  incomeTax *= classFactor;

  const solidarityTax = incomeTax > config.solidarityThreshold ? incomeTax * config.solidarityRate : 0;
  const churchRate = config.churchTaxRateByState[values.state] ?? 0.09;
  const churchTax = values.churchTax ? incomeTax * churchRate : 0;

  const total = incomeTax + solidarityTax + churchTax;

  return {
    incomeTax: round(incomeTax),
    solidarityTax: round(solidarityTax),
    churchTax: round(churchTax),
    total: round(total)
  };
};
