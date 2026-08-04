-- tez-jumys: 1-кезең (дүкен талаптары) — пайдаланушылық блоктау + EULA келісімі.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.
-- Ескерту: аккаунтты өшіру (1.1) және пароль қалпына келтіру (1.2) үшін жаңа
-- кесте керек емес — тек Edge Function/экрандар арқылы іске асады.

-- 1) Пайдаланушылық блоктау. blocked_name — блоктаған сәттегі аты-жөні/компания
-- атауының көшірмесі: RLS блокталғаннан кейін сол пайдаланушының жазбасын жасырып
-- тастайтындықтан, "Блокталғандар" тізімінде атын қайта оқи алмаймыз.
create table if not exists user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_user_id uuid not null references auth.users (id) on delete cascade,
  blocked_name text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id)
);
alter table user_blocks enable row level security;
drop policy if exists "user manages own blocks" on user_blocks;
create policy "user manages own blocks" on user_blocks
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- 2) Блокталған жұмыс берушінің вакансиялары енді жарияда көрінбейді.
drop policy if exists "public read active vacancies" on vacancies;
create policy "public read active vacancies" on vacancies
  for select using (
    is_active = true
    and moderation_status = 'approved'
    and not exists (
      select 1 from user_blocks
      join employers on employers.id = vacancies.employer_id
      where user_blocks.blocker_id = auth.uid()
        and user_blocks.blocked_user_id = employers.user_id
    )
  );

-- 3) Блокталған үміткердің профилі енді "Үміткерлер" тізімінде көрінбейді.
drop policy if exists "public read seekers" on seekers;
create policy "public read seekers" on seekers
  for select using (
    is_hidden = false
    and not exists (
      select 1 from user_blocks
      where user_blocks.blocker_id = auth.uid()
        and user_blocks.blocked_user_id = seekers.user_id
    )
  );

-- 4) Қауымдастық ережелерімен келісу (бір рет қана сұралады, есепте сақталады).
create table if not exists eula_acceptances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  accepted_at timestamptz not null default now()
);
alter table eula_acceptances enable row level security;
drop policy if exists "user manages own eula acceptance" on eula_acceptances;
create policy "user manages own eula acceptance" on eula_acceptances
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
