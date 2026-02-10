import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppStore } from '../../store/signals-store/app.store';
import { FEDERAL_STATES } from '../../core/models/state.model';
import { HealthInsuranceType, PeriodType, SalaryFormValues } from '../../core/models/form.model';

type BoolString = 'true' | 'false';

@Component({
  selector: 'app-salary-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary-form.component.html',
  styleUrl: './salary-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryFormComponent implements OnInit, OnDestroy {
  readonly states = FEDERAL_STATES;
  readonly years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  private readonly destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private store = inject(AppStore);

  form = this.fb.nonNullable.group({
    period: ['monthly' as PeriodType, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    gross: [4500, [Validators.required, Validators.min(0)]],
    benefits: [0, [Validators.min(0)]],
    age: [30, [Validators.required, Validators.min(16)]],
    state: ['BE', Validators.required],
    taxClass: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
    children: ['false' as BoolString],
    churchTax: ['false' as BoolString],
    taxAllowance: [0, [Validators.min(0)]],
    healthInsuranceType: ['public' as HealthInsuranceType, Validators.required],
    healthAdditionalRate: [1.3, [Validators.min(0), Validators.max(5)]],
    pensionInsurance: ['true' as BoolString],
    unemploymentInsurance: ['true' as BoolString]
  });

  constructor() {}

  ngOnInit(): void {
    const values = this.store.formValues();
    this.form.patchValue(
      {
        ...values,
        children: values.children ? 'true' : 'false',
        churchTax: values.churchTax ? 'true' : 'false',
        pensionInsurance: values.pensionInsurance ? 'true' : 'false',
        unemploymentInsurance: values.unemploymentInsurance ? 'true' : 'false'
      },
      { emitEvent: false }
    );

    this.form.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe((value) => {
      this.store.updateFormValues(this.normalizeValues());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.store.updateFormValues(this.normalizeValues());
  }

  private normalizeValues(): SalaryFormValues {
    const raw = this.form.getRawValue();
    return {
      ...raw,
      churchTax: raw.churchTax === 'true',
      children: raw.children === 'true',
      pensionInsurance: raw.pensionInsurance === 'true',
      unemploymentInsurance: raw.unemploymentInsurance === 'true'
    };
  }
}
