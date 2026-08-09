-- tez-jumys: жоғарғы chip қатарында қолмен бекітілген топ-10 лауазымға сай,
-- бірақ дерекқорда әлі жоқ 2 лауазымды қосамыз.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

insert into positions (name_kk, name_ru, icon)
select 'Қара жұмысшы', 'Разнорабочий', 'construct-outline'
where not exists (select 1 from positions where name_kk = 'Қара жұмысшы');

insert into positions (name_kk, name_ru, icon)
select 'Кассир', 'Кассир', 'cash-outline'
where not exists (select 1 from positions where name_kk = 'Кассир');

notify pgrst, 'reload schema';
