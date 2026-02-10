import { SalaryFormValues } from '../../models/form.model';
import { InsuranceBreakdown } from '../../models/result.model';
import { TaxConfig } from '../../models/tax-config.model';

const round = (value: number) => Math.round(value * 100) / 100;

export const calculateInsurance = (
  monthlyGross: number,
  values: SalaryFormValues,
  config: TaxConfig
): InsuranceBreakdown => {
  const rates = config.insuranceRates;
  const additional = Math.max(values.healthAdditionalRate, 0) / 100;

  let health = 0;
  if (values.healthInsuranceType === 'public') {
    health = monthlyGross * (rates.health + additional);
  } else {
    health = monthlyGross * rates.health;
  }

  const pension = values.pensionInsurance ? monthlyGross * rates.pension : 0;
  const unemployment = values.unemploymentInsurance ? monthlyGross * rates.unemployment : 0;
  const nursing = monthlyGross * rates.nursing;

  const total = health + pension + unemployment + nursing;

  return {
    health: round(health),
    pension: round(pension),
    unemployment: round(unemployment),
    nursing: round(nursing),
    total: round(total)
  };
};
