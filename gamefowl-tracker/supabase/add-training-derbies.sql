-- Training logs, derbies, fight videos and video notes.
-- Paste this into Supabase > SQL Editor > New query and press Run.
-- Safe to run more than once. (It is also included at the bottom of schema.sql.)

create table if not exists training_sessions (
  id               uuid primary key default gen_random_uuid(),
  bird_id          uuid not null references birds(id) on delete cascade,
  date             date not null,
  type             text not null,
  duration_min     integer check (duration_min is null or duration_min >= 0),
  weight_g         numeric(8, 1) check (weight_g is null or weight_g > 0),
  condition_score  integer check (condition_score is null or condition_score between 1 and 5),
  notes            text,
  created_at       timestamptz not null default now()
);
create index if not exists training_bird_idx on training_sessions(bird_id, date);

create table if not exists derbies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  date        date not null,
  venue       text,
  notes       text,
  video_path  text,
  video_url   text,
  created_at  timestamptz not null default now()
);

create table if not exists derby_fights (
  id            uuid primary key default gen_random_uuid(),
  derby_id      uuid not null references derbies(id) on delete cascade,
  bird_id       uuid not null references birds(id) on delete restrict,
  fight_no      text,
  result        text not null check (result in ('win', 'loss', 'draw', 'no_contest')),
  weight_g      numeric(8, 1) check (weight_g is null or weight_g > 0),
  strengths     text,
  improvements  text,
  video_path    text,
  video_url     text,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists fights_bird_idx on derby_fights(bird_id);
create index if not exists fights_derby_idx on derby_fights(derby_id);

create table if not exists video_notes (
  id          uuid primary key default gen_random_uuid(),
  fight_id    uuid references derby_fights(id) on delete cascade,
  derby_id    uuid references derbies(id) on delete cascade,
  at_seconds  integer not null check (at_seconds >= 0),
  kind        text not null default 'improve' check (kind in ('good', 'improve', 'note')),
  note        text not null,
  created_at  timestamptz not null default now(),
  constraint video_notes_owner check ((fight_id is not null)::int + (derby_id is not null)::int = 1)
);
create index if not exists vnotes_fight_idx on video_notes(fight_id, at_seconds);

alter table training_sessions enable row level security;
alter table derbies           enable row level security;
alter table derby_fights      enable row level security;
alter table video_notes       enable row level security;

-- Derby videos are private. The app makes a short-lived link when you watch one.
insert into storage.buckets (id, name, public)
values ('derby-videos', 'derby-videos', false)
on conflict (id) do nothing;
