-- tez-jumys: жалақының төлем мерзімі (сағатына/күніне/аптасына/айына).

alter table vacancies
  add column if not exists salary_period text check (salary_period in ('hour', 'day', 'week', 'month'));

alter table vacancies alter column salary_period set default 'month';

update vacancies set salary_period = 'month' where salary_period is null;

notify pgrst, 'reload schema';
