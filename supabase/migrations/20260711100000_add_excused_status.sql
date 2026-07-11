-- Skip stav: ⏭️ omluveno (nemoc, dovolená) — nezlomí streak, nespustí pravidlo 2× po sobě.
-- habit_streaks view počítá jen z ('done','skipped'), 'excused' je tedy automaticky neutrální.
alter type checkin_status add value if not exists 'excused';
