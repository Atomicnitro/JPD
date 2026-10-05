-- Lets a whole derby have its own video and timed notes (fights keep theirs).
-- Run this AFTER add-training-derbies.sql. Safe to run more than once.

alter table derbies add column if not exists video_path text;
alter table derbies add column if not exists video_url text;

alter table video_notes add column if not exists derby_id uuid references derbies(id) on delete cascade;
alter table video_notes alter column fight_id drop not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'video_notes_owner') then
    alter table video_notes add constraint video_notes_owner
      check ((fight_id is not null)::int + (derby_id is not null)::int = 1);
  end if;
end $$;

create index if not exists vnotes_derby_idx on video_notes(derby_id, at_seconds);

notify pgrst, 'reload schema';
