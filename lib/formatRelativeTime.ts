import type { AppLanguage } from '@/lib/i18n';

export function formatRelativeTime(isoDate: string, language: AppLanguage): string {
  const created = new Date(isoDate).getTime();
  const diffDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return language === 'ru' ? 'Сегодня' : 'Бүгін';
  }

  if (language === 'ru') {
    return `${diffDays} ${ruDaysWord(diffDays)} назад`;
  }

  return `${diffDays} күн бұрын`;
}

function ruDaysWord(days: number) {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}
