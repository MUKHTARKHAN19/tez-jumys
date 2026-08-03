# tez-jumys

Қазақстандағы жұмыс іздеу/жариялау мобильді қосымшасы. Expo (React Native) + TypeScript +
Expo Router негізінде құрылған, backend ретінде [Supabase](https://supabase.com) қолданылады.

Бұл нұсқада тек UI каркасы дайын (мәзірлер, экрандар, компоненттер), деректер әзірге
Supabase-тен алынбайды — тек құрылым (типтер, клиент) дайындалған.

## Технологиялар

- [Expo](https://expo.dev) SDK 57 + TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) — файлдық навигация, 4 tab
- [Supabase](https://supabase.com) — `@supabase/supabase-js` + `@react-native-async-storage/async-storage`

## Жобаны іске қосу

1. Тәуелділіктерді орнатыңыз:

   ```bash
   npm install
   ```

2. `.env` файлын жасаңыз (`.env.example` үлгісі бойынша):

   ```bash
   cp .env.example .env
   ```

   Supabase жобаңыздың мәндерін `.env` файлына жазыңыз (Supabase Dashboard →
   Project Settings → API бетінен көшіріп алыңыз):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   `.env` файлы `.gitignore`-де көрсетілген, сондықтан ол GitHub-қа жүктелмейді.

3. Қосымшаны іске қосыңыз:

   ```bash
   npx expo start
   ```

   Одан кейін терминалдағы QR-кодты Expo Go қосымшасымен сканерлеңіз немесе
   `a` (Android эмулятор), `i` (iOS симулятор), `w` (веб) пернелерін басыңыз.

## Жоба құрылымы

```
app/                    Expo Router беттері (файлдық навигация)
  (tabs)/                4 негізгі tab: Вакансиялар, Жариялау, Менікі, Профиль
  vacancy/[id].tsx        Вакансия толық ақпарат беті
  business-profile.tsx    Бизнес профилін бір рет толтыру
  filter.tsx               Жалақы слайдерімен сүзгі
  location-filter.tsx      Облыс → аудан → ауыл фильтрі
  empty-state.tsx           Бос нәтиже күйінің көрінісі
components/              Қайта қолданылатын UI компоненттері (Chip, Card, PillButton, т.б.)
constants/theme.ts       Түстер, өлшемдер (қараңғы тема, акцент #7C6FE8)
lib/supabase.ts          Supabase клиенті
lib/mockData.ts           UI-ды көрсету үшін уақытша плейсхолдер деректер
types/database.ts         Supabase кестелеріне сай TypeScript типтері
```

## Supabase кестелері (жоспар)

`types/database.ts` файлында сипатталған құрылым келесі Supabase кестелеріне сай:

- `regions` — облыстар
- `districts` — аудандар
- `settlements` — елді мекендер
- `positions` — лауазымдар/санаттар
- `employers` — жұмыс берушілер (бизнес профилі)
- `vacancies` — вакансиялар

Бұл кестелер Supabase жобасында әлі жасалмаған — экрандар деректерсіз, тек UI ретінде дайын.
