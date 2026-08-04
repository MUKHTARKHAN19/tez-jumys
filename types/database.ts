// Supabase-тегі кестелерге сай типтер.

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
  region_id: string | null;
  district_id: string | null;
  settlement_id: string | null;
  logo_url: string | null;
  is_blocked: boolean;
  created_at: string;
}

export type VacancySchedule = 'full_time' | 'part_time' | 'shift' | 'flexible';
export type SalaryPeriod = 'hour' | 'day' | 'week' | 'month';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Vacancy {
  id: string;
  employer_id: string;
  position_id: string;
  region_id: string;
  district_id: string | null;
  settlement_id: string | null;
  salary_from: number | null;
  salary_to: number | null;
  salary_period: SalaryPeriod | null;
  schedule: VacancySchedule | null;
  description: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  moderation_status: ModerationStatus;
  moderation_note: string | null;
  views_count: number;
  calls_count: number;
  is_promoted: boolean;
  promoted_until: string | null;
  created_at: string;
}

// Экрандарда карточка/тізім деректерін біріктіру үшін қолданылатын кеңейтілген түрлер.
export interface VacancyWithRelations extends Vacancy {
  position: Position | null;
  region: Region | null;
  district: District | null;
  settlement: Settlement | null;
  employer: Employer | null;
}

export interface Seeker {
  id: string;
  user_id: string;
  full_name: string;
  contact_phone: string;
  position_id: string | null;
  region_id: string | null;
  district_id: string | null;
  settlement_id: string | null;
  bio: string | null;
  is_hidden: boolean;
  created_at: string;
}

export interface SeekerWithRelations extends Seeker {
  position: Position | null;
  region: Region | null;
  district: District | null;
  settlement: Settlement | null;
}

export interface BannedWord {
  id: string;
  word: string;
  created_at: string;
}

export type ReportTargetType = 'vacancy' | 'seeker';
export type ReportStatus = 'pending' | 'reviewed';

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reporter_id: string | null;
  reason: string | null;
  status: ReportStatus;
  created_at: string;
}

export type ApplicationStatus = 'new' | 'viewed';

export interface Application {
  id: string;
  vacancy_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  created_at: string;
}

export interface ApplicationWithRelations extends Application {
  seeker: SeekerWithRelations | null;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  position_id: string | null;
  region_id: string | null;
  district_id: string | null;
  settlement_id: string | null;
  created_at: string;
}

export interface SavedSearchWithRelations extends SavedSearch {
  position: Position | null;
  region: Region | null;
  district: District | null;
  settlement: Settlement | null;
}
