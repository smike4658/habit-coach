-- Testy habit_streaks view — spouštět proti čisté lokální DB (supabase db reset):
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/streaks_test.sql
-- Každý assert vyhodí výjimku, když neplatí. Běží v transakci s rollbackem.

begin;

-- cviceni: done, done, done → streak 3
insert into checkins (habit_id, date, status, source)
select id, d, 'done', 'web' from habits, unnest(array['2026-07-01','2026-07-02','2026-07-03']::date[]) d
where slug = 'cviceni';

-- cteni: done, unplanned, done → streak 2 (unplanned nepřerušuje)
insert into checkins (habit_id, date, status, source)
select id, '2026-07-01', 'done', 'web' from habits where slug = 'cteni';
insert into checkins (habit_id, date, status, source)
select id, '2026-07-02', 'unplanned', 'web' from habits where slug = 'cteni';
insert into checkins (habit_id, date, status, source)
select id, '2026-07-03', 'done', 'web' from habits where slug = 'cteni';

-- qa-ai: skipped, skipped → streak 0 + missed_twice
insert into checkins (habit_id, date, status, source)
select id, d, 'skipped', 'web' from habits, unnest(array['2026-07-02','2026-07-03']::date[]) d
where slug = 'qa-ai';

do $$
declare v record;
begin
  select current_streak, missed_twice into v from habit_streaks where slug = 'cviceni';
  assert v.current_streak = 3, format('cviceni streak: expected 3, got %s', v.current_streak);
  assert v.missed_twice = false, 'cviceni missed_twice: expected false';

  select current_streak, missed_twice into v from habit_streaks where slug = 'cteni';
  assert v.current_streak = 2, format('cteni streak: expected 2, got %s', v.current_streak);

  select current_streak, missed_twice into v from habit_streaks where slug = 'qa-ai';
  assert v.current_streak = 0, format('qa-ai streak: expected 0, got %s', v.current_streak);
  assert v.missed_twice = true, 'qa-ai missed_twice: expected true';

  -- sachy: žádné záznamy → streak 0, missed_twice false
  select current_streak, missed_twice into v from habit_streaks where slug = 'sachy';
  assert v.current_streak = 0, 'sachy streak: expected 0';
  assert v.missed_twice = false, 'sachy missed_twice: expected false';

  raise notice 'ALL STREAK TESTS PASSED';
end $$;

-- done po skipped → streak 1, missed_twice false
do $$
declare v record;
begin
  insert into checkins (habit_id, date, status, source)
  select id, '2026-07-04', 'done', 'web' from habits where slug = 'qa-ai';

  select current_streak, missed_twice into v from habit_streaks where slug = 'qa-ai';
  assert v.current_streak = 1, format('qa-ai streak po done: expected 1, got %s', v.current_streak);
  assert v.missed_twice = false, 'qa-ai missed_twice po done: expected false';

  raise notice 'RECOVERY TEST PASSED';
end $$;

rollback;
