import { SalaryFormValues } from './form.model';
import { CalcResults } from './result.model';

export interface CalcHistoryEntry {
  id: string;
  timestamp: string;
  inputs: SalaryFormValues;
  results: CalcResults;
}
