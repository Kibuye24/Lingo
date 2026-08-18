-- Module tests passed, per user.
--
-- The gate between modules: passing a module's consolidation test unlocks the
-- next one. Stored so the unlock state follows the account across devices,
-- scoped by Row Level Security like everything else.

create table if not exists public.unit_tests (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  profile_id text        not null,
  test_key   text        not null,
  passed_at  timestamptz not null default now(),
  primary key (user_id, profile_id, test_key)
);

alter table public.unit_tests enable row level security;

drop policy if exists "own rows" on public.unit_tests;
create policy "own rows" on public.unit_tests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
