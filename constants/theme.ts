// Қосымшаның екі тақырыбы (Түнгі/Күндізгі) үшін түстер токендері + өлшемдер.
//
// Ескі атаулар (surface, danger, success, т.б.) — 400-ден астам жерде
// қолданылып қойған, сондықтан САҚТАЛДЫ (аты өзгермейді, тек мәні темаға
// қарай ауысады). Жаңа брендтік атаулар (card, cardSecondary, navBg, textDim,
// salary, salaryBg, locationPin) — солармен бірдей мәнді қосымша кілттер
// ретінде қосылды, келешекте соларды тікелей қолдануға да болады.

export const darkColors = {
  background: '#101018',
  backgroundElevated: '#14141D',
  surface: '#1A1A26',
  surfaceAlt: '#222230',
  border: '#2A2A3A',
  accent: '#7C6FE8',
  accentPressed: '#6A5DD6',
  accentSoft: 'rgba(124, 111, 232, 0.15)',
  logoBlue: '#3E6DF6',
  text: '#FFFFFF',
  textSecondary: '#B8B8C8',
  textMuted: '#8A8A9A',
  danger: '#EF5350',
  success: '#22C55E',
  warning: '#F2C14E',
  white: '#FFFFFF',
  // жаңа брендтік атаулар (жоғарыдағылармен бірдей мән):
  card: '#1A1A26',
  cardSecondary: '#222230',
  navBg: '#14141D',
  textDim: '#8A8A9A',
  salary: '#22C55E',
  salaryBg: 'rgba(34, 197, 94, 0.12)',
  locationPin: '#EF5350',
} as const;

type ColorTokensShape = { [K in keyof typeof darkColors]: string };

export const lightColors: ColorTokensShape = {
  background: '#F4F5FA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F7',
  border: '#E8E8F0',
  accent: '#7C6FE8',
  accentPressed: '#6A5DD6',
  accentSoft: '#EFEDFC',
  logoBlue: '#3E6DF6',
  text: '#17171F',
  textSecondary: '#555560',
  textMuted: '#8A8A95',
  danger: '#E0524E',
  success: '#16A34A',
  warning: '#D97706',
  white: '#FFFFFF',
  card: '#FFFFFF',
  cardSecondary: '#F0F0F7',
  navBg: '#FFFFFF',
  textDim: '#8A8A95',
  salary: '#16A34A',
  salaryBg: '#EAF9F0',
  locationPin: '#E0524E',
} as const;

export type ColorTokens = ColorTokensShape;
export type ThemeMode = 'dark' | 'light';

// Ескі, статикалық импорт — hook сырты (StyleSheet.create module-деңгейінде,
// т.б.) немесе әлі useTheme()-ге көшірілмеген жерлер үшін әдепкі (қараңғы)
// мәнді қайтарады. Экрандарда бұдан гөрі useTheme() қолданылған дұрыс.
export const colors = darkColors;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
} as const;

// Күндізгі режимдегі карточкаларға арналған жұмсақ көлеңке (спецификация
// бойынша). Қараңғы режимде қолданылмайды.
export const lightCardShadow = {
  shadowColor: '#141428',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
