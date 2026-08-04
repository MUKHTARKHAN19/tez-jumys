// tez-jumys: белгілі бір пайдаланушыға push-хабарландыру жіберетін жалпы Edge Function.
// Оны басқа Edge Function/cron (мыс. moderate-vacancies) немесе кейінгі кезеңдердегі
// жаңа триггерлер (өтініш, сақталған іздеу) шақыра алады.
// Deploy: Supabase Dashboard -> Edge Functions -> "send-push" -> осы файлды жапсырып,
// Deploy басыңыз. Бұл функцияда "Verify JWT with legacy secret" ӨШІРУЛІ болуы керек —
// оны service_role кілтімен басқа сервистер шақырады, әдеттегі пайдаланушы емес.
//
// Керек secret-тер: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — Supabase бұларды
// автоматты береді, қолмен қосудың қажеті жоқ.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  const { user_id, title, body } = await req.json();

  if (!user_id || !title || !body) {
    return new Response(JSON.stringify({ error: 'user_id, title, body міндетті' }), {
      status: 400,
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: tokens } = await supabase.from('push_tokens').select('token').eq('user_id', user_id);
  const rows = (tokens ?? []) as { token: string }[];

  if (rows.length > 0) {
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

  return new Response(JSON.stringify({ success: true, sent: rows.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
