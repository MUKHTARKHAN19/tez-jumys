import type { AppLanguage } from '@/lib/i18n';
import type { VacancySchedule } from '@/types/database';

const SCHEDULE_LABELS: Record<AppLanguage, Record<VacancySchedule, string>> = {
  kk: {
    full_time: 'Толық жұмыс күні',
    part_time: 'Жарты ставка',
    shift: 'Кезекпен',
    flexible: 'Икемді кесте',
  },
  ru: {
    full_time: 'Полный день',
    part_time: 'Неполная занятость',
    shift: 'Посменно',
    flexible: 'Гибкий график',
  },
};

export function getScheduleLabel(schedule: VacancySchedule, language: AppLanguage) {
  return SCHEDULE_LABELS[language][schedule];
}

export function getScheduleOptions(language: AppLanguage) {
  return (Object.keys(SCHEDULE_LABELS[language]) as VacancySchedule[]).map((value) => ({
    value,
    label: SCHEDULE_LABELS[language][value],
  }));
}
