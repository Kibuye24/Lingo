-- Lingo cloud sync — run this once in the Supabase SQL editor.
--
-- Design notes:
--
-- * Everything is keyed by (user_id, profile_id). One account can hold several
--   profiles, so a household signs in once and each person still keeps their
--   own progress — and that progress follows them to every device.
--
-- * profile_id is the client-generated id from localStorage, not a UUID from
--   here. That means a profile created offline keeps its identity when it
--   later syncs, instead of being duplicated.
--
-- * Row Level Security is on for every table with policies scoped to
--   auth.uid(). This is what makes it safe to ship the anon key in the
--   browser bundle: without a valid session it can read and write nothing.

-- ── Profiles ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  profile_id text        not null,
  name       text        not null,
  emoji      text        not null default '🦊',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

-- ── Per-phrase spaced-repetition state ──────────────────────────────────────

create table if not exists public.phrase_progress (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  profile_id   text        not null,
  -- "${lang}:${phraseId}" — matches the local storage key exactly.
  phrase_key   text        not null,
  lang         text        not null,
  phrase_id    text        not null,
  lesson_id    text        not null,
  streak       int         not null default 0,
  best_score   int         not null default 0,
  last_score   int         not null default 0,
  attempts     int         not null default 0,
  due_at       date        not null,
  last_seen_at date        not null,
  -- Drives last-write-wins when the same phrase is practised on two devices.
  updated_at   timestamptz not null default now(),
  primary key (user_id, profile_id, phrase_key)
);

create index if not exists phrase_progress_due_idx
  on public.phrase_progress (user_id, profile_id, lang, due_at);

-- ── Additive sets ───────────────────────────────────────────────────────────
-- Completions and practice days are merged by union, never overwritten: you
-- cannot un-finish a lesson or un-practise a day, so two devices can only ever
-- add to these. That's what stops a streak being lost by syncing.

create table if not exists public.lesson_completions (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  profile_id   text        not null,
  -- "${lang}:${lessonId}"
  lesson_key   text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, profile_id, lesson_key)
);

create table if not exists public.active_days (
  user_id    uuid not null references auth.users (id) on delete cascade,
  profile_id text not null,
  day        date not null,
  primary key (user_id, profile_id, day)
);

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.profiles           enable row level security;
alter table public.phrase_progress    enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.active_days        enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'phrase_progress', 'lesson_completions', 'active_days'
  ] loop
    execute format(
      'drop policy if exists "own rows" on public.%I', t
    );
    execute format(
      'create policy "own rows" on public.%I
         for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id)', t
    );
  end loop;
end $$;
