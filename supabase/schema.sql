-- tez-jumys: types/database.ts файлындағы құрылымға сай кестелер.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  name_kk text not null,
  name_ru text not null
);

create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions (id) on delete cascade,
  name_kk text not null,
  name_ru text not null
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts (id) on delete cascade,
  name_kk text not null,
  name_ru text not null
);

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  name_kk text not null,
  name_ru text not null,
  icon text
);

create table if not exists employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null,
  contact_phone text not null,
  settlement_id uuid references settlements (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists vacancies (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers (id) on delete cascade,
  position_id uuid not null references positions (id) on delete restrict,
  settlement_id uuid not null references settlements (id) on delete restrict,
  salary_from integer,
  salary_to integer,
  schedule text check (schedule in ('full_time', 'part_time', 'shift', 'flexible')),
  description text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists districts_region_id_idx on districts (region_id);
create index if not exists settlements_district_id_idx on settlements (district_id);
create index if not exists employers_user_id_idx on employers (user_id);
create index if not exists vacancies_employer_id_idx on vacancies (employer_id);
create index if not exists vacancies_position_id_idx on vacancies (position_id);
create index if not exists vacancies_settlement_id_idx on vacancies (settlement_id);

-- Row Level Security
alter table regions enable row level security;
alter table districts enable row level security;
alter table settlements enable row level security;
alter table positions enable row level security;
alter table employers enable row level security;
alter table vacancies enable row level security;

-- Анықтамалық кестелер (regions/districts/settlements/positions) кез келгенге оқуға ашық.
create policy "public read regions" on regions for select using (true);
create policy "public read districts" on districts for select using (true);
create policy "public read settlements" on settlements for select using (true);
create policy "public read positions" on positions for select using (true);

-- Белсенді вакансияларды кез келген адам көре алады.
create policy "public read active vacancies" on vacancies
  for select using (is_active = true);

-- Жұмыс беруші тек өз бизнес профилін көреді/өзгертеді.
create policy "employer manages own profile" on employers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Жұмыс беруші тек өзінің вакансияларын жасайды/өзгертеді/жояды.
create policy "employer manages own vacancies" on vacancies
  for all using (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  )
  with check (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  );
