// tez-jumys: пайдаланушы өз аккаунтын толық өшіру үшін шақыратын Edge Function.
// Deploy: Supabase Dashboard -> Edge Functions -> "delete-account" -> осы файлды жапсырып, Deploy басыңыз.
// Бұл функцияда "Verify JWT with legacy secret" ҚОСУЛЫ қалуы керек (әдепкі/Recommended
// күй) — өйткені оны әдеттегі пайдаланушы сессиясының JWT-і шақырады, cron емес.
//
// Керек secret-тер: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — Supabase бұларды
// автоматты береді, қолмен қосудың қажеті жоқ.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BUCKET = 'tez-jumys';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jwt = authHeader.replace(/^Bearer\s+/i, '');

  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }
  const userId = userData.user.id;

  // Storage-тағы суреттерді тазалаймыз (employers/{userId}/..., vacancies/{userId}/...).
  // Кестелер FK "on delete cascade" арқылы auth.admin.deleteUser() кезінде өздігінен тазаланады.
  for (const prefix of [`employers/${userId}`, `vacancies/${userId}`]) {
    const { data: files } = await admin.storage.from(BUCKET).list(prefix);
    if (files && files.length > 0) {
      await admin.storage.from(BUCKET).remove(files.map((f) => `${prefix}/${f.name}`));
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
