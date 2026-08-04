// tez-jumys: жаңа вакансияларды автоматты тексеретін Edge Function.
// Cron job әр 2 минут сайын осы функцияны шақырады (supabase/add_moderation.sql қараңыз).
// Deploy: Supabase Dashboard -> Edge Functions -> "moderate-vacancies" -> осы файлды жапсырып, Deploy басыңыз.
//
// Керек secret-тер (Edge Functions -> Secrets бетінде қосыңыз):
//   OPENAI_API_KEY — OpenAI аккаунтыңыздан алынған кілт (platform.openai.com/api-keys).
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — Supabase бұларды автоматты береді, қолмен қосудың қажеті жоқ.
//
// Логика:
//   - OpenAI ауыр санатты (зорлық-зомбылық, жеккөрушілік, т.б.) байқаса -> толық "rejected".
//   - Лауазым/компания атауында тыйым салынған сөз табылса -> толық "rejected"
//     (бұл өрістерді біз білдірмей өзгертпейміз).
//   - Тек сипаттамада (description) тыйым салынған сөз табылса -> сол сөз ***-пен
//     жасырылып, вакансия "approved" болып жарияланады (толық бас тартылмайды).
//
// Тыйым салынған сөздер тізімі "banned_words" кестесінде сақталады — оны Super Admin
// панелінен (қосымша ішінен) кодты өзгертпей-ақ толықтыруға/қысқартуға болады.
//
// Ескерту: көп адам қазақ пернетақтасы жоқ болғандықтан қ/ғ/ә/і/ң/ұ/ү/ө/һ орнына
// әдеттегі орыс әрпін (к/г/а/и/н/у/о/х) жазады. Сондықтан тізімдегі әр сөз осы
// әріптердің барлық ықтимал нұсқасын қамтитын икемді (flexible) үлгіге айналады.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// banned_words кестесі бос немесе қолжетімсіз болған жағдайда қолданылатын
// сақтық тізім (fallback).
const FALLBACK_BANNED_WORDS = [
  'сука',
  'сучк',
  'блядь',
  'бля',
  'хуй',
  'хуе',
  'хуё',
  'пизд',
  'ебан',
  'ебат',
  'ёбан',
  'мудак',
  'мудил',
  'долбоеб',
  'долбаеб',
  'гандон',
  'пидор',
  'пидар',
  'шлюх',
  'залуп',
  'мраз',
  'сволоч',
  'сіктір',
  'қотақ',
  'сігіл',
  'боқмұрын',
  'есек құл',
  'ешек құл',
];

// Қазақ-спецификалық әріптің орнына жиі жазылатын ауыстырулар. Мысалы "қ" әрпінің
// орнына "к" немесе "г" жазылуы мүмкін (пернетақтада қ жоқ болғанда).
const LETTER_ALTERNATIVES: Record<string, string> = {
  а: 'aа',
  ә: 'aәа',
  к: 'кқkг',
  қ: 'кқkг',
  г: 'гғg',
  ғ: 'гғg',
  и: 'иіi',
  і: 'иіi',
  н: 'нңn',
  ң: 'нңn',
  у: 'уұүu',
  ұ: 'уұүu',
  ү: 'уұүu',
  о: 'оөo',
  ө: 'оөo',
  х: 'хһh',
  һ: 'хһh',
};

function buildFlexiblePattern(word: string): string {
  return [...word.toLowerCase()]
    .map((ch) => {
      if (ch === ' ') return '\\s+';
      const alts = LETTER_ALTERNATIVES[ch];
      if (alts) {
        const uniq = Array.from(new Set(alts.split(''))).join('');
        return `[${uniq}]`;
      }
      if (/[.*+?^${}()|[\]\\]/.test(ch)) return `\\${ch}`;
      return ch;
    })
    .join('');
}

function buildBannedWordRegexes(words: string[]) {
  return words
    .filter((word) => word.trim())
    .map((word) => ({ word, regex: new RegExp(buildFlexiblePattern(word), 'gi') }));
}

// deno-lint-ignore no-explicit-any
async function sendPushToUser(supabase: any, userId: string, title: string, body: string) {
  const { data: tokens } = await supabase.from('push_tokens').select('token').eq('user_id', userId);
  const rows = (tokens ?? []) as { token: string }[];
  if (rows.length === 0) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(rows.map((row) => ({ to: row.token, title, body }))),
  });
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: bannedWordRows } = await supabase.from('banned_words').select('word');
  const bannedWordList =
    bannedWordRows && bannedWordRows.length > 0
      ? bannedWordRows.map((row) => row.word as string)
      : FALLBACK_BANNED_WORDS;
  const bannedWordRegexes = buildBannedWordRegexes(bannedWordList);

  function containsBannedWord(text: string) {
    return bannedWordRegexes.some(({ regex }) => {
      regex.lastIndex = 0;
      return regex.test(text);
    });
  }

  function censorBannedWords(text: string): { censored: string; matched: boolean } {
    let matched = false;
    let result = text;
    for (const { regex } of bannedWordRegexes) {
      regex.lastIndex = 0;
      if (regex.test(result)) {
        matched = true;
        result = result.replace(regex, (match) => '*'.repeat(match.length));
      }
    }
    return { censored: result, matched };
  }

  // Жарияланғаннан кейін кемінде 1 минут күтеміз (кездейсоқ дереу жіберілген
  // сұранысты тоқтатпас үшін), содан кейін ғана тексереміз.
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

  const { data: pending, error } = await supabase
    .from('vacancies')
    .select(
      'id, description, position_id, region_id, district_id, settlement_id, position:positions(name_kk, name_ru), employer:employers(business_name, user_id)'
    )
    .eq('moderation_status', 'pending')
    .lte('created_at', oneMinuteAgo)
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Сақталған іздеулерді (job alert) бір рет алып қоямыз — әр мақұлданған
  // вакансия сайын соларға сәйкес келетінін тексереміз.
  const { data: savedSearches } = await supabase.from('saved_searches').select('*');

  const results: { id: string; flagged: boolean; censored: boolean }[] = [];

  for (const vacancy of pending ?? []) {
    const titleText = [vacancy.position?.name_kk, vacancy.position?.name_ru, vacancy.employer?.business_name]
      .filter(Boolean)
      .join('\n');
    const description = vacancy.description ?? '';
    const combinedText = [titleText, description].filter(Boolean).join('\n');

    let flagged = false;
    let note: string | null = null;

    if (OPENAI_API_KEY && combinedText.trim()) {
      try {
        const response = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({ input: combinedText }),
        });
        const json = await response.json();
        const result = json.results?.[0];
        flagged = !!result?.flagged;
        if (flagged) {
          note = Object.entries(result.categories ?? {})
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(', ');
        }
      } catch (err) {
        console.error('OpenAI moderation call failed:', err);
      }
    }

    // Лауазым/компания атауындағы жаман сөз — бұл өрістерді үнсіз өзгерте
    // алмаймыз, сондықтан толық бас тартамыз.
    if (!flagged && containsBannedWord(titleText)) {
      flagged = true;
      note = 'banned-word-in-title';
    }

    const updates: Record<string, unknown> = {
      moderation_status: flagged ? 'rejected' : 'approved',
      moderation_note: note,
    };

    let censored = false;
    if (!flagged) {
      const result = censorBannedWords(description);
      if (result.matched) {
        censored = true;
        updates.description = result.censored;
        updates.moderation_note = 'censored';
      }
    }

    await supabase.from('vacancies').update(updates).eq('id', vacancy.id);

    const employerUserId = vacancy.employer?.user_id;
    if (employerUserId) {
      if (flagged) {
        await sendPushToUser(
          supabase,
          employerUserId,
          'Вакансия қабылданбады ❌ / Вакансия отклонена ❌',
          'Себебі: қауымдастық ережелерін бұзу. / Причина: нарушение правил сообщества.'
        );
      } else {
        await sendPushToUser(
          supabase,
          employerUserId,
          'Вакансия мақұлданды ✅ / Вакансия одобрена ✅',
          'Сіздің вакансияңыз жарияланды. / Ваша вакансия опубликована.'
        );
      }
    }

    // Мақұлданған вакансияға сәйкес сақталған іздеуі бар пайдаланушыларға push.
    if (!flagged) {
      const matches = (savedSearches ?? []).filter((s) => {
        if (s.position_id && s.position_id !== vacancy.position_id) return false;
        if (s.settlement_id && s.settlement_id !== vacancy.settlement_id) return false;
        if (s.district_id && s.district_id !== vacancy.district_id) return false;
        if (s.region_id && s.region_id !== vacancy.region_id) return false;
        return true;
      });
      for (const match of matches) {
        if (match.user_id === employerUserId) continue;
        await sendPushToUser(
          supabase,
          match.user_id,
          'Жаңа вакансия! / Новая вакансия!',
          'Сіз сақтаған іздеу бойынша жаңа вакансия шықты. / По сохранённому поиску появилась новая вакансия.'
        );
      }
    }

    results.push({ id: vacancy.id, flagged, censored });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
