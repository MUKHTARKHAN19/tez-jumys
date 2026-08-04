import { getSalaryPeriodLabel } from '@/constants/salaryPeriod';
import type { TranslationKey } from '@/constants/translations';
import type { AppLanguage } from '@/lib/i18n';
import type { SalaryPeriod } from '@/types/database';

export function formatSalary(
  from: number | null,
  to: number | null,
  language: AppLanguage,
  t: (key: TranslationKey) => string,
  period?: SalaryPeriod | null
) {
  if (!from && !to) return t('vacancy.salaryNegotiable');

  const periodSuffix = period ? ` / ${getSalaryPeriodLabel(period, language)}` : '';

  if (from && to) {
    return `${from.toLocaleString('ru-RU')} – ${to.toLocaleString('ru-RU')} ₸${periodSuffix}`;
  }

  const value = from ?? to ?? 0;
  return `${t('vacancy.salaryFromPrefix')}${value.toLocaleString('ru-RU')} ₸${t('vacancy.salaryFromSuffix')}${periodSuffix}`;
}
