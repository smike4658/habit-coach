-- Aktivní návyky z system/habits.md (fáze 1, od 2026-07-06)
insert into habits (slug, name, emoji, phase, dose_text, frequency_per_week, is_reward) values
  ('cviceni', 'Cvičení', '💪', 1, '10 min (týden 1) → 20 min (týden 3+)', 3, false),
  ('cteni', 'Čtení', '📖', 1, '15 min → 30 min', 4, false),
  ('qa-ai', 'QA/AI', '🧠', 1, '15 min + TIL zápisek → 20 min + TIL', 5, false),
  ('sachy', 'Šachy', '♟️', 1, 'volné — odměna, ne úkol', null, true)
on conflict (slug) do nothing;
