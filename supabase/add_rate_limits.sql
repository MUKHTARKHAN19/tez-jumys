-- tez-jumys: 5-кезең — вакансия жариялау мен шағым беруге лимит қою (спамнан қорғау).
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

-- 1) Вакансия жариялау: бір employer сағатына max 5, тәулігіне max 15.
create or replace function enforce_vacancy_rate_limit()
returns trigger
language plpgsql
as $$
declare
  hourly_count integer;
  daily_count integer;
begin
  select count(*) into hourly_count
  from vacancies
  where employer_id = new.employer_id
    and created_at > now() - interval '1 hour';

  if hourly_count >= 5 then
    raise exception 'rate_limit_hourly' using errcode = 'P0001';
  end if;

  select count(*) into daily_count
  from vacancies
  where employer_id = new.employer_id
    and created_at > now() - interval '1 day';

  if daily_count >= 15 then
    raise exception 'rate_limit_daily' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists vacancies_rate_limit on vacancies;
create trigger vacancies_rate_limit
  before insert on vacancies
  for each row execute function enforce_vacancy_rate_limit();

-- 2) Шағым беру: бір пайдаланушы тәулігіне max 10 шағым.
-- Бұрын reports.reporter_id клиенттен жіберілмей келген — енді RLS соны талап етеді
-- (ReportButton.tsx та сәйкес жаңартылды), лимитті дұрыс есептеу үшін бұл міндетті.
drop policy if exists "signed in user creates report" on reports;
create policy "signed in user creates report" on reports
  for insert with check (auth.uid() = reporter_id);

create or replace function enforce_report_rate_limit()
returns trigger
language plpgsql
as $$
declare
  daily_count integer;
begin
  select count(*) into daily_count
  from reports
  where reporter_id = new.reporter_id
    and created_at > now() - interval '1 day';

  if daily_count >= 10 then
    raise exception 'rate_limit_daily' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reports_rate_limit on reports;
create trigger reports_rate_limit
  before insert on reports
  for each row execute function enforce_report_rate_limit();

notify pgrst, 'reload schema';
