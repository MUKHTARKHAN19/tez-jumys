-- tez-jumys: жұмыс іздеушінің жария профилі (екі жақты нарық — жұмыс берушілер
-- үміткерлерді іздей алады).

create table if not exists seekers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  contact_phone text not null,
  position_id uuid references positions (id),
  region_id uuid references regions (id),
  district_id uuid references districts (id),
  settlement_id uuid references settlements (id),
  bio text,
  created_at timestamptz not null default now()
);

create unique index if not exists seekers_user_id_key on seekers (user_id);
create index if not exists seekers_position_id_idx on seekers (position_id);
create index if not exists seekers_region_id_idx on seekers (region_id);
create index if not exists seekers_district_id_idx on seekers (district_id);

alter table seekers enable row level security;

create policy "public read seekers" on seekers for select using (true);

create policy "seeker manages own profile" on seekers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
