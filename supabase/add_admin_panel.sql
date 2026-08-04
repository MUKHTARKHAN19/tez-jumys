-- tez-jumys: Super Admin панелі үшін кестелер мен саясаттар.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

-- 1) Әкімшілер тізімі. Мұнда user_id болу — сол адамның админ екенін білдіреді.
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table admins enable row level security;
drop policy if exists "admin can read own admin row" on admins;
create policy "admin can read own admin row" on admins
  for select using (auth.uid() = user_id);

-- 2) Толық бұғатталған пайдаланушылар (қосымшаға кіре алмайды).
create table if not exists blocked_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);
alter table blocked_users enable row level security;
drop policy if exists "user can check own block status" on blocked_users;
create policy "user can check own block status" on blocked_users
  for select using (auth.uid() = user_id);
drop policy if exists "admin manages blocked_users" on blocked_users;
create policy "admin manages blocked_users" on blocked_users
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 3) Жұмыс берушіні бұғаттау — жаңа вакансия жариялай алмайды (бар вакансияларын
-- өзгерте/өшіре алады).
alter table employers add column if not exists is_blocked boolean not null default false;

drop policy if exists "admin manages employers" on employers;
create policy "admin manages employers" on employers
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 4) Жұмыс іздеуші профилін жасыру.
alter table seekers add column if not exists is_hidden boolean not null default false;

drop policy if exists "public read seekers" on seekers;
create policy "public read seekers" on seekers
  for select using (is_hidden = false);

drop policy if exists "admin manages seekers" on seekers;
create policy "admin manages seekers" on seekers
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 5) Тыйым салынған сөздер тізімі — Edge Function енді осы кестеден оқиды,
-- кодты өзгертпей-ақ админ панелінен сөз қосу/өшіру мүмкін болады.
create table if not exists banned_words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  created_at timestamptz not null default now()
);
alter table banned_words enable row level security;
drop policy if exists "admin manages banned_words" on banned_words;
create policy "admin manages banned_words" on banned_words
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

insert into banned_words (word) values
  ('сука'), ('сучк'), ('блядь'), ('бля'), ('хуй'), ('хуе'), ('хуё'), ('пизд'),
  ('ебан'), ('ебат'), ('ёбан'), ('мудак'), ('мудил'), ('долбоеб'), ('долбаеб'),
  ('гандон'), ('пидор'), ('пидар'), ('шлюх'), ('залуп'), ('мраз'), ('сволоч'),
  ('сіктір'), ('қотақ'), ('сігіл'), ('боқмұрын'), ('есек құл'), ('ешек құл')
on conflict (word) do nothing;

-- 6) Шағымдар (пайдаланушылар вакансия/профильге шағымдана алады, тек админ көреді).
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('vacancy', 'seeker')),
  target_id uuid not null,
  reporter_id uuid references auth.users (id) on delete set null,
  reason text,
  status text not null check (status in ('pending', 'reviewed')) default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on reports (status);
alter table reports enable row level security;

drop policy if exists "signed in user creates report" on reports;
create policy "signed in user creates report" on reports
  for insert with check (auth.uid() is not null);

drop policy if exists "admin manages reports" on reports;
create policy "admin manages reports" on reports
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 7) Админ кез келген вакансияны көре/өзгерте/өшіре алады (иесіне қарамастан).
drop policy if exists "admin manages all vacancies" on vacancies;
create policy "admin manages all vacancies" on vacancies
  for all using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 8) Бұғатталған жұмыс беруші жаңа вакансия ЖАРИЯЛАЙ алмасын, бірақ бар
-- вакансияларын көру/өзгерту/өшіру құқығы қалсын. Сол үшін ескі "for all"
-- саясатын 4 бөлек саясатқа бөлеміз.
drop policy if exists "employer manages own vacancies" on vacancies;

drop policy if exists "employer reads own vacancies" on vacancies;
create policy "employer reads own vacancies" on vacancies
  for select using (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  );

drop policy if exists "employer inserts own vacancies" on vacancies;
create policy "employer inserts own vacancies" on vacancies
  for insert with check (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
    and not exists (
      select 1 from employers
      where employers.id = vacancies.employer_id and employers.is_blocked = true
    )
  );

drop policy if exists "employer updates own vacancies" on vacancies;
create policy "employer updates own vacancies" on vacancies
  for update using (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  ) with check (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  );

drop policy if exists "employer deletes own vacancies" on vacancies;
create policy "employer deletes own vacancies" on vacancies
  for delete using (
    auth.uid() = (select user_id from employers where employers.id = vacancies.employer_id)
  );

notify pgrst, 'reload schema';

-- ==========================================================================
-- ӨЗІҢІЗДІ ӘКІМШІ (SUPER ADMIN) ЕТІП ТАҒАЙЫНДАУ
-- Төмендегі жолдағы 'сіздің-email@мысал.com' орнына өз аккаунтыңыздың
-- email-ін жазып, содан кейін осы бір жолды бөлек ІСКЕ ҚОСЫҢЫЗ.
-- ==========================================================================
 insert into admins (user_id)
 select id from auth.users where email = 'sbsbxbx01@mail.ru'
 on conflict (user_id) do nothing;
