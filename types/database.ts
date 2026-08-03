// Supabase-тегі кестелерге сай типтер. Деректер әзірге қосылмаған — тек құрылым.

export interface Region {
  id: string;
  name_kk: string;
  name_ru: string;
}

export interface District {
  id: string;
  region_id: string;
  name_kk: string;
  name_ru: string;
}

export interface Settlement {
  id: string;
  district_id: string;
  name_kk: string;
  name_ru: string;
}

export interface Position {
  id: string;
  name_kk: string;
  name_ru: string;
  icon: string | null;
}

export interface Employer {
  id: string;
  user_id: string;
  business_name: string;
  contact_phone: string;
  settlement_id: string | null;
  created_at: string;
}

export type VacancySchedule = 'full_time' | 'part_time' | 'shift' | 'flexible';

export interface Vacancy {
  id: string;
  employer_id: string;
  position_id: string;
  settlement_id: string;
  salary_from: number | null;
  salary_to: number | null;
  schedule: VacancySchedule | null;
  description: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

// Экрандарда карточка/тізім деректерін біріктіру үшін қолданылатын кеңейтілген түрлер.
export interface VacancyWithRelations extends Vacancy {
  position: Position | null;
  settlement: Settlement | null;
  employer: Employer | null;
}

export interface Database {
  public: {
    Tables: {
      regions: { Row: Region; Insert: Region; Update: Partial<Region> };
      districts: { Row: District; Insert: District; Update: Partial<District> };
      settlements: { Row: Settlement; Insert: Settlement; Update: Partial<Settlement> };
      positions: { Row: Position; Insert: Position; Update: Partial<Position> };
      employers: { Row: Employer; Insert: Employer; Update: Partial<Employer> };
      vacancies: { Row: Vacancy; Insert: Vacancy; Update: Partial<Vacancy> };
    };
  };
}
