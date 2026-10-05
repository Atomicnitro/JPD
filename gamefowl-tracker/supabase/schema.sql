-- Gamefowl Tracker database
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- It is safe to run more than once.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- Users (logins live in Supabase Auth; this table stores the role)
-- ---------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'staff' check (role in ('admin', 'staff')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Incubators
-- ---------------------------------------------------------------
create table if not exists incubators (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  capacity    integer not null default 96 check (capacity > 0),
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Birds (tandang, inahin, sisiw)
-- ---------------------------------------------------------------
create table if not exists birds (
  id            uuid primary key default gen_random_uuid(),
  band_id       text not null unique,
  name          text,
  sex           text not null check (sex in ('tandang', 'inahin', 'sisiw')),
  color         text,
  bloodline     text,
  hatch_date    date,
  status        text not null default 'active' check (status in ('active', 'sold', 'deceased', 'culled')),
  sire_id       uuid references birds(id) on delete restrict,
  dam_id        uuid references birds(id) on delete restrict,
  batch_id      uuid,
  photo_url     text,
  wingband_no   text,
  wingband_date date,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists birds_sire_idx on birds(sire_id);
create index if not exists birds_dam_idx on birds(dam_id);

-- ---------------------------------------------------------------
-- Breeding pairs (PAIR-001, PAIR-002, ...)
-- ---------------------------------------------------------------
create table if not exists pairs (
  id            uuid primary key default gen_random_uuid(),
  pair_no       integer generated always as identity unique,
  tandang_id    uuid not null references birds(id) on delete restrict,
  inahin_id     uuid not null references birds(id) on delete restrict,
  date_started  date,
  status        text not null default 'active' check (status in ('active', 'inactive', 'retired')),
  notes         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Egg batches: eggs set in the incubator + the hatch result
-- ---------------------------------------------------------------
create table if not exists batches (
  id             uuid primary key default gen_random_uuid(),
  batch_no       integer generated always as identity unique,
  pair_id        uuid not null references pairs(id) on delete restrict,
  incubator_id   uuid references incubators(id) on delete set null,
  eggs_set       integer not null check (eggs_set > 0),
  date_set       date not null,
  expected_hatch date,
  eggs_hatched   integer check (eggs_hatched >= 0),
  hatched_on     date,
  status         text not null default 'incubating' check (status in ('incubating', 'hatched')),
  notes          text,
  created_at     timestamptz not null default now(),
  constraint hatched_not_more_than_set check (eggs_hatched is null or eggs_hatched <= eggs_set)
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'birds_batch_fk') then
    alter table birds add constraint birds_batch_fk foreign key (batch_id) references batches(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------
create table if not exists sales (
  id          uuid primary key default gen_random_uuid(),
  bird_id     uuid not null unique references birds(id) on delete restrict,
  buyer       text,
  price       numeric(12, 2) not null check (price >= 0),
  date_sold   date not null,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------
create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,
  amount       numeric(12, 2) not null check (amount >= 0),
  date         date not null,
  description  text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------
create table if not exists settings (
  key    text primary key,
  value  text
);
insert into settings (key, value) values
  ('farm_name', ''),
  ('incubation_days', '21'),
  ('bloodlines', 'National')
on conflict (key) do nothing;

-- ---------------------------------------------------------------
-- Automatic: a sale marks the bird SOLD. Deleting the sale puts it back.
-- ---------------------------------------------------------------
create or replace function mark_bird_sold() returns trigger
language plpgsql as $$
begin
  update birds set status = 'sold' where id = new.bird_id;
  return new;
end $$;

create or replace function unmark_bird_sold() returns trigger
language plpgsql as $$
begin
  update birds set status = 'active' where id = old.bird_id and status = 'sold';
  return old;
end $$;

drop trigger if exists sales_mark_sold on sales;
create trigger sales_mark_sold after insert on sales
  for each row execute function mark_bird_sold();

drop trigger if exists sales_unmark_sold on sales;
create trigger sales_unmark_sold after delete on sales
  for each row execute function unmark_bird_sold();

-- ---------------------------------------------------------------
-- Security: only the app server (service key) can touch these tables.
-- Nobody can read them directly from the browser.
-- ---------------------------------------------------------------
alter table profiles   enable row level security;
alter table incubators enable row level security;
alter table birds      enable row level security;
alter table pairs      enable row level security;
alter table batches    enable row level security;
alter table sales      enable row level security;
alter table expenses   enable row level security;
alter table settings   enable row level security;

-- ---------------------------------------------------------------
-- Photo storage
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('bird-photos', 'bird-photos', true)
on conflict (id) do nothing;

-- ===============================================================
-- Training, derbies and fight videos
-- ===============================================================

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
  fight_id    uuid not null references derby_fights(id) on delete cascade,
  at_seconds  integer not null check (at_seconds >= 0),
  kind        text not null default 'improve' check (kind in ('good', 'improve', 'note')),
  note        text not null,
  created_at  timestamptz not null default now()
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
