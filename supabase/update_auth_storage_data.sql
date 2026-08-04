-- tez-jumys: 2-кезең — фото өрістері, Storage bucket, нақты бастапқы деректер.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.
-- (supabase/schema.sql бірінші рет орындалған соң, осыны қосымша ретінде іске қосыңыз.)

-- 1) Фотоға арналған бағандар
alter table employers add column if not exists logo_url text;
alter table vacancies add column if not exists photo_url text;

-- Скриптті қайта қоссаңыз дерек қайталанбас үшін бірегейлік индекстері
create unique index if not exists regions_name_kk_key on regions (name_kk);
create unique index if not exists positions_name_kk_key on positions (name_kk);
create unique index if not exists districts_region_name_key on districts (region_id, name_kk);
create unique index if not exists settlements_district_name_key on settlements (district_id, name_kk);

-- Әр пайдаланушының бизнес профилі біреу ғана болады (upsert осыған сүйенеді)
create unique index if not exists employers_user_id_key on employers (user_id);

-- 2) Storage bucket (вакансия/логотип суреттері үшін, жария оқуға ашық)
insert into storage.buckets (id, name, public)
values ('tez-jumys', 'tez-jumys', true)
on conflict (id) do nothing;

drop policy if exists "public read tez-jumys" on storage.objects;
create policy "public read tez-jumys" on storage.objects
  for select using (bucket_id = 'tez-jumys');

drop policy if exists "authenticated upload tez-jumys" on storage.objects;
create policy "authenticated upload tez-jumys" on storage.objects
  for insert to authenticated with check (bucket_id = 'tez-jumys');

drop policy if exists "owner update tez-jumys" on storage.objects;
create policy "owner update tez-jumys" on storage.objects
  for update to authenticated using (bucket_id = 'tez-jumys' and owner = auth.uid());

drop policy if exists "owner delete tez-jumys" on storage.objects;
create policy "owner delete tez-jumys" on storage.objects
  for delete to authenticated using (bucket_id = 'tez-jumys' and owner = auth.uid());

-- 3) Қазақстанның облыстары мен қалалары (17 облыс + 3 республикалық маңызы бар қала)
insert into regions (name_kk, name_ru) values
  ('Абай облысы', 'Абайская область'),
  ('Ақмола облысы', 'Акмолинская область'),
  ('Ақтөбе облысы', 'Актюбинская область'),
  ('Алматы облысы', 'Алматинская область'),
  ('Атырау облысы', 'Атырауская область'),
  ('Батыс Қазақстан облысы', 'Западно-Казахстанская область'),
  ('Жамбыл облысы', 'Жамбылская область'),
  ('Жетісу облысы', 'Жетысуская область'),
  ('Қарағанды облысы', 'Карагандинская область'),
  ('Қостанай облысы', 'Костанайская область'),
  ('Қызылорда облысы', 'Кызылординская область'),
  ('Маңғыстау облысы', 'Мангистауская область'),
  ('Павлодар облысы', 'Павлодарская область'),
  ('Солтүстік Қазақстан облысы', 'Северо-Казахстанская область'),
  ('Түркістан облысы', 'Туркестанская область'),
  ('Ұлытау облысы', 'Улытауская область'),
  ('Шығыс Қазақстан облысы', 'Восточно-Казахстанская область'),
  ('Астана қаласы', 'город Астана'),
  ('Алматы қаласы', 'город Алматы'),
  ('Шымкент қаласы', 'город Шымкент')
on conflict (name_kk) do nothing;

-- 4) Жиі кездесетін лауазымдар/санаттар
insert into positions (name_kk, name_ru, icon) values
  ('Сатушы', 'Продавец', 'cart-outline'),
  ('Сатушы-кассир', 'Продавец-кассир', 'cash-outline'),
  ('Курьер', 'Курьер', 'bicycle-outline'),
  ('Құрылысшы', 'Строитель', 'hammer-outline'),
  ('Тазалаушы', 'Уборщик', 'sparkles-outline'),
  ('Жүргізуші', 'Водитель', 'car-outline'),
  ('Ресепшн', 'Ресепшн', 'desktop-outline'),
  ('Даяшы', 'Официант', 'restaurant-outline'),
  ('Аспаз', 'Повар', 'flame-outline'),
  ('Күзетші', 'Охранник', 'shield-outline'),
  ('Оператор', 'Оператор', 'call-outline'),
  ('Мерчандайзер', 'Мерчандайзер', 'pricetags-outline'),
  ('Электрик', 'Электрик', 'flash-outline'),
  ('Сантехник', 'Сантехник', 'water-outline'),
  ('Бояушы', 'Маляр', 'color-palette-outline'),
  ('Бала бақушы', 'Няня', 'happy-outline'),
  ('Тігінші', 'Швея', 'cut-outline'),
  ('Складшы', 'Кладовщик', 'cube-outline')
on conflict (name_kk) do nothing;

-- 5) Мысал аудандар/елді мекендер (Алматы облысы) — толық геосправочник кейін
-- ресми КАТО классификаторынан импортталуы керек, бұл тек демо үшін.
with region as (select id from regions where name_kk = 'Алматы облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru
from region, (values
  ('Іле ауданы', 'Илийский район'),
  ('Талғар ауданы', 'Талгарский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with district as (select id from districts where name_kk = 'Іле ауданы' limit 1)
insert into settlements (district_id, name_kk, name_ru)
select district.id, s.name_kk, s.name_ru
from district, (values
  ('Өтеген батыр', 'Отеген батыр'),
  ('Байсерке', 'Байсерке')
) as s(name_kk, name_ru)
on conflict (district_id, name_kk) do nothing;
