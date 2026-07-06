# Market scan — existuje už „git-backed habit tracker s AI koučem"? (2026-07-06)

Otázka: ověřit odlišnost z design doc §1 — (a) data v otevřeném formátu v gitu uživatele,
(b) AI kouč aktivně upravující plány, (c) proaktivita.

## Nálezy

**AI kouč + proaktivita — UŽ EXISTUJE (trh je živý):**
- [Habit Coach AI](https://www.habitcoach.ai/) — proaktivní AI kouč (chat, telefonáty, denní check-iny),
  6 person, $9–149/měs. **Pozor: kolize jména s naším pracovním názvem.** Data: proprietární cloud.
- [Habit AI (iOS)](https://apps.apple.com/us/app/habit-ai-daily-tracker/id6736968637) — analýza vzorců,
  adaptivní připomínky, návrhy optimalizací. Blízko „kouč upravuje plán", ale uzavřená data, jen iOS.
- [HabitBee AI](https://play.google.com/store/apps/details?id=app.habitbee.ai.powered.daily.habit.tracker),
  [Rocky.ai](https://www.rocky.ai/habit-tracker), Productify — AI chat kouč / nudges v různé míře.

**Otevřená data / git / markdown — existuje jen jako geek nástroje bez AI a bez hodinek:**
- [harsh](https://github.com/wakatara/harsh) (CLI), [habit_tracker skript](https://github.com/opethef10/habit_tracker),
  Obsidian pluginy ([přehled](https://www.obsidianstats.com/tags/habit-tracking)) — markdown, ale žádný kouč.
- [Loop](https://github.com/iSoron/uhabits) / [Habo](https://habo.space/) — open-source, export CSV/SQLite,
  ale data vlastní appka a AI nemají.
- Obsibrain — AI insights nad Obsidian daty; není proaktivní kouč, neupravuje dávky, bez hodinek.

**Hodinky:** Habitica má Wear OS check-in (Tiles „plánované"); AI koučové hodinky neřeší.

## Verdikt

Jednotlivé prvky existují odděleně, **kombinace (a)+(b)+(c) + watch-first check-in nalezena nebyla**
— odlišnost z §1 platí, ale zúžila se: „AI habit coach" je v 2026 přeplněná kategorie, unikátní je
jen **git/markdown jako zdroj pravdy pod kontrolou uživatele + kouč s plným kontextem + hodinky**.
Cílovka fáze 4 tím pádem: vývojáři/geeci, ne masový trh.

## Akce

1. **Přejmenovat produkt před fází 4** — „Habit Coach" koliduje s habitcoach.ai (zapsáno v BACKLOG.md;
   design doc s přejmenováním počítal: „název vymyslíme později").
2. Diferenciaci v marketingu stavět na datech v gitu a hloubce kouče, ne na „AI coach" obecně.
