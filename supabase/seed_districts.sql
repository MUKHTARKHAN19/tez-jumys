-- tez-jumys: Қазақстанның 17 облысы бойынша аудандар (ауылдарсыз).
-- Дерек artifact-те тексерілді. Supabase SQL Editor-де толығымен көшіріп, Run басыңыз.
-- Бұрын қосылған "Іле ауданы" / "Талғар ауданы" қайталанбайды (unique индекс "on conflict do nothing" арқылы қорғайды).

with region as (select id from regions where name_kk = 'Ақмола облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Аққөл ауданы', 'Аккольский район'),
  ('Астрахан ауданы', 'Астраханский район'),
  ('Атбасар ауданы', 'Атбасарский район'),
  ('Біржан сал ауданы', 'Биржан сал район'),
  ('Бұланды ауданы', 'Буландынский район'),
  ('Егіндікөл ауданы', 'Егиндыкольский район'),
  ('Ерейментау ауданы', 'Ерейментауский район'),
  ('Жақсы ауданы', 'Жаксынский район'),
  ('Жарқайың ауданы', 'Жаркаинский район'),
  ('Зеренді ауданы', 'Зерендинский район'),
  ('Қорғалжын ауданы', 'Коргалжынский район'),
  ('Сандықтау ауданы', 'Сандыктауский район'),
  ('Целиноград ауданы', 'Целиноградский район'),
  ('Шортанды ауданы', 'Шортандинский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Ақтөбе облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Айтекеби ауданы', 'Айтекебийский район'),
  ('Алға ауданы', 'Алгинский район'),
  ('Байғанин ауданы', 'Байганинский район'),
  ('Қарғалы ауданы', 'Каргалинский район'),
  ('Қобда ауданы', 'Кобдинский район'),
  ('Мартөк ауданы', 'Мартукский район'),
  ('Мұғалжар ауданы', 'Мугалжарский район'),
  ('Ойыл ауданы', 'Уилский район'),
  ('Темір ауданы', 'Темирский район'),
  ('Хромтау ауданы', 'Хромтауский район'),
  ('Шалқар ауданы', 'Шалкарский район'),
  ('Ырғыз ауданы', 'Иргизский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Алматы облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Балқаш ауданы', 'Балхашский район'),
  ('Еңбекшіқазақ ауданы', 'Енбекшиказахский район'),
  ('Жамбыл ауданы', 'Жамбылский район'),
  ('Іле ауданы', 'Илийский район'),
  ('Қарасай ауданы', 'Карасайский район'),
  ('Райымбек ауданы', 'Райымбекский район'),
  ('Талғар ауданы', 'Талгарский район'),
  ('Ұйғыр ауданы', 'Уйгурский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Атырау облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Жылыой ауданы', 'Жылыойский район'),
  ('Индер ауданы', 'Индерский район'),
  ('Исатай ауданы', 'Исатайский район'),
  ('Құрманғазы ауданы', 'Курмангазинский район'),
  ('Мақат ауданы', 'Макатский район'),
  ('Махамбет ауданы', 'Махамбетский район'),
  ('Қызылқоға ауданы', 'Кызылкогинский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Батыс Қазақстан облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Ақжайық ауданы', 'Акжаикский район'),
  ('Бөкей ордасы ауданы', 'Бокейординский район'),
  ('Бөрлі ауданы', 'Бурлинский район'),
  ('Жаңақала ауданы', 'Жангалинский район'),
  ('Жәнібек ауданы', 'Жанибекский район'),
  ('Зеленов ауданы', 'Зеленовский район'),
  ('Қаратөбе ауданы', 'Каратобинский район'),
  ('Қазталов ауданы', 'Казталовский район'),
  ('Сырым ауданы', 'Сырымский район'),
  ('Тасқала ауданы', 'Таскалинский район'),
  ('Теректі ауданы', 'Теректинский район'),
  ('Шыңғырлау ауданы', 'Чингирлауский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Жамбыл облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Байзақ ауданы', 'Байзакский район'),
  ('Жамбыл ауданы', 'Жамбылский район'),
  ('Жуалы ауданы', 'Жуалынский район'),
  ('Қордай ауданы', 'Кордайский район'),
  ('Меркі ауданы', 'Меркенский район'),
  ('Мойынқұм ауданы', 'Мойынкумский район'),
  ('Сарысу ауданы', 'Сарысуский район'),
  ('Талас ауданы', 'Таласский район'),
  ('Т. Рысқұлов ауданы', 'Турар Рыскуловский район'),
  ('Шу ауданы', 'Шуский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Жетісу облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Ақсу ауданы', 'Аксуский район'),
  ('Алакөл ауданы', 'Алакольский район'),
  ('Ескелді ауданы', 'Ескельдинский район'),
  ('Кербұлақ ауданы', 'Кербулакский район'),
  ('Көксу ауданы', 'Коксуский район'),
  ('Панфилов ауданы', 'Панфиловский район'),
  ('Сарқант ауданы', 'Саркандский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Қарағанды облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Абай ауданы', 'Абайский район'),
  ('Ақтоғай ауданы', 'Актогайский район'),
  ('Бұқар жырау ауданы', 'Бухаржырауский район'),
  ('Жаңаарқа ауданы', 'Жанааркинский район'),
  ('Қарқаралы ауданы', 'Каркаралинский район'),
  ('Нұра ауданы', 'Нуринский район'),
  ('Осакаров ауданы', 'Осакаровский район'),
  ('Шет ауданы', 'Шетский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Қостанай облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Алтынсарин ауданы', 'Алтынсаринский район'),
  ('Амангелді ауданы', 'Амангельдинский район'),
  ('Әулиекөл ауданы', 'Аулиекольский район'),
  ('Денисов ауданы', 'Денисовский район'),
  ('Жітіқара ауданы', 'Житикаринский район'),
  ('Қарабалық ауданы', 'Карабалыкский район'),
  ('Қарасу ауданы', 'Карасуский район'),
  ('Қостанай ауданы', 'Костанайский район'),
  ('Меңдіқара ауданы', 'Мендыкаринский район'),
  ('Науырзым ауданы', 'Наурзумский район'),
  ('Сарыкөл ауданы', 'Сарыкольский район'),
  ('Таран ауданы', 'Тарановский район'),
  ('Ұзынкөл ауданы', 'Узункольский район'),
  ('Федоров ауданы', 'Федоровский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Қызылорда облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Арал ауданы', 'Аральский район'),
  ('Жалағаш ауданы', 'Жалагашский район'),
  ('Жаңақорған ауданы', 'Жанакорганский район'),
  ('Қазалы ауданы', 'Казалинский район'),
  ('Қармақшы ауданы', 'Кармакшинский район'),
  ('Сырдария ауданы', 'Сырдарьинский район'),
  ('Шиелі ауданы', 'Шиелийский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Маңғыстау облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Бейнеу ауданы', 'Бейнеуский район'),
  ('Қарақия ауданы', 'Каракиянский район'),
  ('Маңғыстау ауданы', 'Мангистауский район'),
  ('Мұнайлы ауданы', 'Мунайлинский район'),
  ('Түпқараған ауданы', 'Тупкараганский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Павлодар облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Ақтоғай ауданы', 'Актогайский район'),
  ('Баянауыл ауданы', 'Баянаульский район'),
  ('Железинка ауданы', 'Железинский район'),
  ('Ертіс ауданы', 'Иртышский район'),
  ('Қашыр ауданы', 'Качирский район'),
  ('Лебяжі ауданы', 'Лебяжинский район'),
  ('Май ауданы', 'Майский район'),
  ('Павлодар ауданы', 'Павлодарский район'),
  ('Успенка ауданы', 'Успенский район'),
  ('Щербақты ауданы', 'Щербактинский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Солтүстік Қазақстан облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Айыртау ауданы', 'Айыртауский район'),
  ('Аққайың ауданы', 'Аккайынский район'),
  ('Ақжар ауданы', 'Акжарский район'),
  ('Есіл ауданы', 'Есильский район'),
  ('Ғ. Мүсірепов ауданы', 'Габита Мусрепова район'),
  ('Жамбыл ауданы', 'Жамбылский район'),
  ('Қызылжар ауданы', 'Кызылжарский район'),
  ('М. Жұмабаев ауданы', 'Магжана Жумабаева район'),
  ('Мамлют ауданы', 'Мамлютский район'),
  ('Тайынша ауданы', 'Тайыншинский район'),
  ('Тимирязев ауданы', 'Тимирязевский район'),
  ('Уәлиханов ауданы', 'Уалихановский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Түркістан облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Арыс ауданы', 'Арысский район'),
  ('Бәйдібек ауданы', 'Байдибекский район'),
  ('Жетісай ауданы', 'Жетысайский район'),
  ('Қазығұрт ауданы', 'Казыгуртский район'),
  ('Мақтарал ауданы', 'Мактааральский район'),
  ('Ордабасы ауданы', 'Ордабасынский район'),
  ('Отырар ауданы', 'Отырарский район'),
  ('Сайрам ауданы', 'Сайрамский район'),
  ('Сарыағаш ауданы', 'Сарыагашский район'),
  ('Созақ ауданы', 'Созакский район'),
  ('Толеби ауданы', 'Толебийский район'),
  ('Түлкібас ауданы', 'Тюлькубасский район'),
  ('Шардара ауданы', 'Шардаринский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Ұлытау облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Ұлытау ауданы', 'Улытауский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Шығыс Қазақстан облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Алтай ауданы', 'Алтайский район'),
  ('Бородулиха ауданы', 'Бородулихинский район'),
  ('Глубокое ауданы', 'Глубоковский район'),
  ('Зайсан ауданы', 'Зайсанский район'),
  ('Катонқарағай ауданы', 'Катон-Карагайский район'),
  ('Күршім ауданы', 'Курчумский район'),
  ('Тарбағатай ауданы', 'Тарбагатайский район'),
  ('Ұлан ауданы', 'Уланский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;

with region as (select id from regions where name_kk = 'Абай облысы' limit 1)
insert into districts (region_id, name_kk, name_ru)
select region.id, d.name_kk, d.name_ru from region, (values
  ('Абай ауданы', 'Абайский район'),
  ('Ақсуат ауданы', 'Аксуатский район'),
  ('Аякөз ауданы', 'Аягозский район'),
  ('Бесқарағай ауданы', 'Бескарагайский район'),
  ('Жарма ауданы', 'Жарминский район'),
  ('Көкпекті ауданы', 'Кокпектинский район'),
  ('Май ауданы', 'Майский район'),
  ('Үржар ауданы', 'Урджарский район')
) as d(name_kk, name_ru)
on conflict (region_id, name_kk) do nothing;
