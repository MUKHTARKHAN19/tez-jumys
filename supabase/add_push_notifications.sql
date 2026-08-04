-- tez-jumys: 2-кезең — push-хабарландырулар үшін токен кестесі.
-- Supabase Dashboard -> SQL Editor ішіне көшіріп, "Run" басыңыз.

create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_tokens_user_id_idx on push_tokens (user_id);

alter table push_tokens enable row level security;
drop policy if exists "user manages own push tokens" on push_tokens;
create policy "user manages own push tokens" on push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
