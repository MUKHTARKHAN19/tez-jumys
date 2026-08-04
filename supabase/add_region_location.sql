-- tez-jumys: орналасуды облыс деңгейінде де таңдауға рұқсат беру
-- (облыс → аудан → ауыл, әрқайсысы жеке-жеке жеткілікті болады).

alter table employers add column if not exists region_id uuid references regions (id);
alter table vacancies add column if not exists region_id uuid references regions (id);

create index if not exists employers_region_id_idx on employers (region_id);
create index if not exists vacancies_region_id_idx on vacancies (region_id);

-- Бұрын аудан таңдалып қойған жазбалар үшін region_id-ды автоматты толтыру.
update vacancies v set region_id = d.region_id
from districts d
where v.district_id = d.id and v.region_id is null;

update employers e set region_id = d.region_id
from districts d
where e.district_id = d.id and e.region_id is null;

notify pgrst, 'reload schema';
