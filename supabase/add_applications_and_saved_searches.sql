-- tez-jumys: 3-кезең — вакансияға өтініш беру + сақталған іздеу (job alert).
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

-- 1) Өтініштер: жұмыс іздеуші вакансияға "Өтініш беру" батырмасын басқанда жазылады.
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies (id) on delete cascade,
  seeker_id uuid not null references seekers (id) on delete cascade,
  status text not null check (status in ('new', 'viewed')) default 'new',
  created_at timestamptz not null default now(),
  unique (vacancy_id, seeker_id)
);
create index if not exists applications_vacancy_id_idx on applications (vacancy_id);
create index if not exists applications_seeker_id_idx on applications (seeker_id);

alter table applications enable row level security;

drop policy if exists "seeker manages own applications" on applications;
create policy "seeker manages own applications" on applications
  for all using (
    auth.uid() = (select user_id from seekers where seekers.id = applications.seeker_id)
  )
  with check (
    auth.uid() = (select user_id from seekers where seekers.id = applications.seeker_id)
  );

drop policy if exists "employer reads applications to own vacancies" on applications;
create policy "employer reads applications to own vacancies" on applications
  for select using (
    auth.uid() = (
      select e.user_id from vacancies v
      join employers e on e.id = v.employer_id
      where v.id = applications.vacancy_id
    )
  );

drop policy if exists "employer updates applications to own vacancies" on applications;
create policy "employer updates applications to own vacancies" on applications
  for update using (
    auth.uid() = (
      select e.user_id from vacancies v
      join employers e on e.id = v.employer_id
      where v.id = applications.vacancy_id
    )
  );

-- 2) Сақталған іздеулер: пайдаланушы лауазым/орналасу бойынша сүзгіні сақтайды,
-- сол сүзгіге сәйкес жаңа вакансия мақұлданғанда push келеді.
create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  position_id uuid references positions (id) on delete cascade,
  region_id uuid references regions (id) on delete cascade,
  district_id uuid references districts (id) on delete cascade,
  settlement_id uuid references settlements (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists saved_searches_user_id_idx on saved_searches (user_id);

alter table saved_searches enable row level security;

drop policy if exists "user manages own saved searches" on saved_searches;
create policy "user manages own saved searches" on saved_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
