-- Habit Coach — initial schema (design doc §3)
-- Pravidlo: DB drží jen transakční data + mirror plánů; obsah vzniká v markdownu,
-- při konfliktu vyhrává markdown.

create type checkin_status as enum ('done', 'skipped', 'unplanned');
create type checkin_source as enum ('web', 'wear', 'android', 'coach', 'health');
create type health_event_type as enum ('workout', 'steps', 'sleep');
create type coach_direction as enum ('to_user', 'from_user');
create type coach_channel as enum ('push', 'chat');

create table habits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text not null,
  phase int not null default 1,
  dose_text text,
  frequency_per_week int,
  is_reward boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits (id),
  date date not null,
  status checkin_status not null,
  note text,
  source checkin_source not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- mirror z plans/*.md (sync-plans function)
create table plans (
  id uuid primary key default gen_random_uuid(),
  week_iso text not null,
  day_date date not null,
  items jsonb not null,
  generated_by text,
  unique (week_iso, day_date)
);

create table health_events (
  id uuid primary key default gen_random_uuid(),
  type health_event_type not null,
  payload jsonb not null default '{}',
  occurred_at timestamptz not null,
  source text
);

create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  direction coach_direction not null,
  body text not null,
  channel coach_channel not null,
  created_at timestamptz not null default now()
);

-- Streak se počítá odvozeně — nikdy neukládat, ať nejde rozbít (§3).
-- current_streak: souvislá řada 'done' od nejnovějšího záznamu zpět
-- (unplanned se nepočítá vůbec — nepřerušuje řadu).
-- missed_twice: dva nejnovější plánované záznamy jsou oba 'skipped'
-- (koučovací pravidlo "nikdy 2× po sobě").
create view habit_streaks as
with relevant as (
  select
    habit_id,
    status,
    row_number() over (partition by habit_id order by date desc) as rn
  from checkins
  where status in ('done', 'skipped')
)
select
  h.id as habit_id,
  h.slug,
  h.emoji,
  h.name,
  h.is_reward,
  coalesce(
    (
      select count(*)
      from relevant r
      where r.habit_id = h.id
        and r.rn < coalesce(
          (select min(s.rn) from relevant s where s.habit_id = h.id and s.status = 'skipped'),
          9223372036854775807
        )
    ),
    0
  ) as current_streak,
  coalesce(
    (
      select bool_and(r.status = 'skipped')
      from relevant r
      where r.habit_id = h.id and r.rn <= 2
        and 2 <= (select count(*) from relevant c where c.habit_id = h.id)
    ),
    false
  ) as missed_twice
from habits h
where h.active;

-- RLS: single-user projekt — data smí číst/psát jen přihlášený uživatel.
-- Edge Functions používají service role (RLS obcházejí).
alter table habits enable row level security;
alter table checkins enable row level security;
alter table plans enable row level security;
alter table health_events enable row level security;
alter table coach_messages enable row level security;

create policy authenticated_all_habits on habits
  for all to authenticated using (true) with check (true);
create policy authenticated_all_checkins on checkins
  for all to authenticated using (true) with check (true);
create policy authenticated_all_plans on plans
  for all to authenticated using (true) with check (true);
create policy authenticated_all_health_events on health_events
  for all to authenticated using (true) with check (true);
create policy authenticated_all_coach_messages on coach_messages
  for all to authenticated using (true) with check (true);

-- Přístup: Edge Functions používají service_role; přihlášený uživatel smí číst
-- (přes PostgREST, kdyby web někdy četl přímo) — zápisy jdou jen přes funkce.
grant usage on schema public to authenticated, service_role;
grant all on all tables in schema public to service_role;
grant select on all tables in schema public to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant select on tables to authenticated;
