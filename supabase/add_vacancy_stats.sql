-- tez-jumys: 4-кезең — вакансия статистикасы (қаралым/хабарласу саны).
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

alter table vacancies add column if not exists views_count integer not null default 0;
alter table vacancies add column if not exists calls_count integer not null default 0;

-- Тікелей "update" арқылы емес, осы RPC функциялары арқылы ғана арттырылады —
-- солай әр пайдаланушыға вакансияның басқа бағандарын (жалақы, сипаттама, т.б.)
-- өзгертуге RLS арқылы рұқсат берудің қажеті болмайды.
create or replace function increment_vacancy_view(vacancy_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update vacancies set views_count = views_count + 1 where id = vacancy_id;
$$;

create or replace function increment_vacancy_call(vacancy_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update vacancies set calls_count = calls_count + 1 where id = vacancy_id;
$$;

grant execute on function increment_vacancy_view(uuid) to anon, authenticated;
grant execute on function increment_vacancy_call(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
