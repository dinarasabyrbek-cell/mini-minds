-- child_profiles
create table if not exists child_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  avatar      text not null check (avatar in ('rabbit', 'cat', 'penguin')),
  created_at  timestamptz default now()
);

alter table child_profiles enable row level security;
create policy "anon_all" on child_profiles for all to anon using (true) with check (true);

-- letter_progress
create table if not exists letter_progress (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references child_profiles(id) on delete cascade,
  letter       text not null,
  completed    boolean default false,
  completed_at timestamptz,
  unique (child_id, letter)
);

alter table letter_progress enable row level security;
create policy "anon_all" on letter_progress for all to anon using (true) with check (true);

-- game_sessions
create table if not exists game_sessions (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references child_profiles(id) on delete cascade,
  game_type        text not null,
  score            integer,
  duration_seconds integer,
  played_at        timestamptz default now()
);

alter table game_sessions enable row level security;
create policy "anon_all" on game_sessions for all to anon using (true) with check (true);
