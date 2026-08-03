// UI каркасын көрсету үшін уақытша плейсхолдер деректер.
// Кейін бұл жерде Supabase-тен ("positions", "regions" т.б. кестелерден) нақты сұраныстар болады.

import type { District, Position, Region, Settlement } from '@/types/database';

export const PLACEHOLDER_POSITIONS: Position[] = [
  { id: 'placeholder-1', name_kk: 'Сатушы', name_ru: 'Продавец', icon: 'cart-outline' },
  { id: 'placeholder-2', name_kk: 'Курьер', name_ru: 'Курьер', icon: 'bicycle-outline' },
  { id: 'placeholder-3', name_kk: 'Құрылысшы', name_ru: 'Строитель', icon: 'hammer-outline' },
  { id: 'placeholder-4', name_kk: 'Тазалаушы', name_ru: 'Уборщик', icon: 'sparkles-outline' },
  { id: 'placeholder-5', name_kk: 'Жүргізуші', name_ru: 'Водитель', icon: 'car-outline' },
  { id: 'placeholder-6', name_kk: 'Ресепшн', name_ru: 'Ресепшн', icon: 'desktop-outline' },
];

// Орналасу фильтрінің каскадты UI-ін (облыс → аудан → ауыл) көрсету үшін ғана.
export const PLACEHOLDER_REGIONS: Region[] = [
  { id: 'region-1', name_kk: 'Алматы облысы', name_ru: 'Алматинская область' },
  { id: 'region-2', name_kk: 'Түркістан облысы', name_ru: 'Туркестанская область' },
];

export const PLACEHOLDER_DISTRICTS: District[] = [
  { id: 'district-1', region_id: 'region-1', name_kk: 'Іле ауданы', name_ru: 'Илийский район' },
  { id: 'district-2', region_id: 'region-1', name_kk: 'Талғар ауданы', name_ru: 'Талгарский район' },
  { id: 'district-3', region_id: 'region-2', name_kk: 'Сайрам ауданы', name_ru: 'Сайрамский район' },
  { id: 'district-4', region_id: 'region-2', name_kk: 'Түлкібас ауданы', name_ru: 'Тюлькубасский район' },
];

export const PLACEHOLDER_SETTLEMENTS: Settlement[] = [
  { id: 'settlement-1', district_id: 'district-1', name_kk: 'Өтеген батыр', name_ru: 'Отеген батыр' },
  { id: 'settlement-2', district_id: 'district-1', name_kk: 'Байсерке', name_ru: 'Байсерке' },
  { id: 'settlement-3', district_id: 'district-2', name_kk: 'Талғар қаласы', name_ru: 'город Талгар' },
  { id: 'settlement-4', district_id: 'district-3', name_kk: 'Ақсукент', name_ru: 'Аксукент' },
];
