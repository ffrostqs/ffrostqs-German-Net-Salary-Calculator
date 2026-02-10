export interface TaxBracket {
  upTo: number | null;
  rate: number;
}

export interface TaxClassConfig {
  factor: number;
}

export interface InsuranceRates {
  health: number;
  healthAdditional: number;
  pension: number;
  unemployment: number;
  nursing: number;
}

export interface TaxConfig {
  year: number;
  lastUpdated: string;
  taxClasses: Record<string, TaxClassConfig>;
  limits: {
    minijob: number;
    midijob: number;
    midijobEmployeeFactor: number;
  };
  allowances: {
    basicAllowance: number;
    childAllowance: number;
  };
  taxBrackets: TaxBracket[];
  insuranceRates: InsuranceRates;
  solidarityRate: number;
  solidarityThreshold: number;
  churchTaxRateByState: Record<string, number>;
}
