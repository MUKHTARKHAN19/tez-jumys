-- tez-jumys: орналасуды ауыл деңгейінен басқа, аудан деңгейінде де таңдауға рұқсат беру.
-- Көптеген аудандарда әлі ауыл дерегі жоқ болғандықтан, ауыл (settlement) міндетті емес,
-- ал аудан (district) міндетті түйін болады.

alter table employers add column if not exists district_id uuid references districts (id);
alter table employers alter column settlement_id drop not null;

alter table vacancies add column if not exists district_id uuid references districts (id);
alter table vacancies alter column settlement_id drop not null;

create index if not exists employers_district_id_idx on employers (district_id);
create index if not exists vacancies_district_id_idx on vacancies (district_id);
