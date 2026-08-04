import type { AppLanguage } from '@/lib/i18n';
import type { SalaryPeriod } from '@/types/database';

const SALARY_PERIOD_LABELS: Record<AppLanguage, Record<SalaryPeriod, string>> = {
  kk: {
    month: 'айына',
    week: 'аптасына',
    day: 'күніне',
    hour: 'сағатына',
  },
  ru: {
    month: 'в месяц',
    week: 'в неделю',
    day: 'в день',
    hour: 'в час',
  },
};

export function getSalaryPeriodLabel(period: SalaryPeriod, language: AppLanguage) {
  return SALARY_PERIOD_LABELS[language][period];
}

export function getSalaryPeriodOptions(language: AppLanguage) {
  return (Object.keys(SALARY_PERIOD_LABELS[language]) as SalaryPeriod[]).map((value) => ({
    value,
    label: SALARY_PERIOD_LABELS[language][value],
  }));
}
