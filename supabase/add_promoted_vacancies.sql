-- tez-jumys: 6-кезең — Promoted (ақылы жоғарылатылған) вакансиялар.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

create extension if not exists pg_cron;

alter table vacancies add column if not exists is_promoted boolean not null default false;
alter table vacancies add column if not exists promoted_until timestamptz;

create index if not exists vacancies_is_promoted_idx on vacancies (is_promoted);

-- Күнделікті мерзімі өткен promoted вакансияларды өшіреді.
select cron.schedule(
  'clear-expired-promotions-job',
  '0 0 * * *',
  $$
  update vacancies
  set is_promoted = false, promoted_until = null
  where is_promoted = true and promoted_until is not null and promoted_until < now();
  $$
);

notify pgrst, 'reload schema';
