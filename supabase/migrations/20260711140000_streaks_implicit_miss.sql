-- Oprava streaku (bug 2026-07-11): nezaznamenaný PLÁNOVANÝ den v minulosti se počítá
-- jako implicitní vynechání — streak měří plnění plánu, nezapsané vynechání ho nesmí
-- přeskočit. Dnešek a budoucí dny zůstávají neutrální (den ještě neskončil).
-- Excused (⏭️): nepočítá se do streaku, nezlomí ho, ale přerušuje pár „2× po sobě"
-- (sjednoceno s webovou computeStreaks logikou).
create or replace view habit_streaks as
with planned as (
  select distinct h.id as habit_id, p.day_date
  from plans p
  cross join lateral jsonb_array_elements(p.items->'items') as it(item)
  join habits h on h.slug = it.item->>'slug'
  where it.item->>'text' is not null
),
effective as (
  select
    coalesce(c.habit_id, pl.habit_id) as habit_id,
    coalesce(c.date, pl.day_date) as date,
    coalesce(
      c.status::text,
      case
        when pl.day_date < (now() at time zone 'Europe/Prague')::date then 'missed_implicit'
      end
    ) as status
  from checkins c
  full outer join planned pl on pl.habit_id = c.habit_id and pl.day_date = c.date
),
relevant as (
  select
    habit_id,
    status,
    row_number() over (partition by habit_id order by date desc) as rn
  from effective
  where status in ('done', 'skipped', 'excused', 'missed_implicit')
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
        and r.status = 'done'
        and r.rn < coalesce(
          (
            select min(s.rn)
            from relevant s
            where s.habit_id = h.id and s.status in ('skipped', 'missed_implicit')
          ),
          9223372036854775807
        )
    ),
    0
  ) as current_streak,
  coalesce(
    (
      select bool_and(r.status in ('skipped', 'missed_implicit'))
      from relevant r
      where r.habit_id = h.id and r.rn <= 2
        and 2 <= (select count(*) from relevant c2 where c2.habit_id = h.id)
    ),
    false
  ) as missed_twice
from habits h
where h.active;
