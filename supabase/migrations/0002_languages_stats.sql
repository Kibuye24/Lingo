-- Language choices and explicit progress counters.
--
-- 0001 stored the raw practice data (per-phrase state, completions, active
-- days). This adds two things on top:
--
--   * which languages a learner has chosen — so the Meer switcher shows their
--     languages, on every device, rather than all of them; and
--   * a denormalised streak/progress row per profile, so the home screen can
--     read a number instead of recomputing from the whole history, and so
--     those counters survive independently of the raw events.

-- ── Chosen languages ────────────────────────────────────────────────────────

create table if not exists public.user_languages (
  user_id   uuid        not null references auth.users (id) on delete cascade,
  lang_code text        not null,
  added_at  timestamptz not null default now(),
  primary key (user_id, lang_code)
);

-- ── Per-profile counters ────────────────────────────────────────────────────

create table if not exists public.profile_stats (
  user_id           uuid        not null references auth.users (id) on delete cascade,
  profile_id        text        not null,
  current_streak    int         not null default 0,
  longest_streak    int         not null default 0,
  lessons_completed int         not null default 0,
  phrases_practised int         not null default 0,
  updated_at        timestamptz not null default now(),
  primary key (user_id, profile_id)
);

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.user_languages enable row level security;
alter table public.profile_stats  enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['user_languages', 'profile_stats'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I
         for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id)', t
    );
  end loop;
end $$;
