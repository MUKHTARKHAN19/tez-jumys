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
      'id, description, position:positions(name_kk, name_ru), employer:employers(business_name)'
    )
    .eq('moderation_status', 'pending')
    .lte('created_at', oneMinuteAgo)
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

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

    results.push({ id: vacancy.id, flagged, censored });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
