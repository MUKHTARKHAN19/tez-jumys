-- tez-jumys: жаңа лауазым — Мобилограф.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

insert into positions (name_kk, name_ru, icon)
select 'Мобилограф', 'Мобилограф', 'camera-outline'
where not exists (select 1 from positions where name_kk = 'Мобилограф');

notify pgrst, 'reload schema';
