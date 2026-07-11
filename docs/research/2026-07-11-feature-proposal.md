# Návrh dalších funkcionalit — backfill, motivace, tipy z trhu (2026-07-11)

Vstup: analýza současného webu (kód v `web/`, Edge Functions v `supabase/functions/`),
feature matrix `2026-07-W3-feature-matrix.md`, market scan `docs/2026-07-06-market-scan.md`.
Zadání od Michala: (1) check-in pro předchozí dny, (2) motivační featury (odznaky…),
(3) další nápady z podobných appek.

## Stav appky dnes (co už umí)

- **Dnes**: check-in ✅/❌/➖ + věta dne, streak karty s varováním „2× po sobě", týdenní tabulka.
- **Historie**: heatmapa (3 měsíce v API módu), statistiky, kalendář s detailem dne (read-only).
- **Návyky**: CRUD + archiv (jen API mód).
- Dva módy: API (Supabase) a PAT (GitHub Contents přímo). Git/markdown = zdroj pravdy.

---

## 1. Zpětný check-in (backfill) — P1, řeší reálnou bolest

**Proč to nejde teď:**
- PAT mód: `checkinService.submitCheckin(token, date, …)` datum **už podporuje** — jen UI
  natvrdo posílá `new Date()` (App.tsx `onCheckin`).
- API mód: Edge Function `checkin` používá `pragueToday()` natvrdo — datum v body nebere.

**Návrh:**
1. **Edge Function `checkin`**: přidat volitelný `date` (ISO `YYYY-MM-DD`). Validace: ne budoucnost,
   max ~31 dní zpět (log soubor po měsících → starší backfill by měnil starý soubor, povolit,
   ale commit message označit `(backfill)`). Zápis do správného `log/YYYY-MM.md` přes existující
   `logFileName(date)`/`dayLabelFor(date)` — obě funkce datum už berou.
2. **UI vstupní bod = kalendář** (vzor HabitKit „tap-to-edit"): detail dne v `CalendarView`
   už zobrazuje záznamy návyků — přidat tam stejné ✅/❌/➖ přepínače jako v TodayCard
   (pro minulé dny, ne budoucí). Žádná nová obrazovka.
3. **Rychlá zkratka „Včera"** na tabu Dnes: nejčastější případ je „večer jsem nezapsal" —
   malý řádek pod TodayCard „Doplnit včerejšek" jen když včera chybí záznam.
4. DB: `checkins` tabulka dostane `checkin_date` z parametru místo `today` (ověřit unique constraint
   habit+datum — upsert).

Odhad: menší dávka (Edge Function + 2 UI úpravy + testy), nezávislé na redesignu W3.3/W3.5.

## 2. Motivační vrstva — odznaky „po našem"

Pozor na kontext: feature matrix W3.1 badges/body **vědomě vyřadila** (koučovací filozofie
„kontinuita > výkon", varovný příklad Habitica). Michal je teď explicitně chce → kompromis:
**milníky kontinuity v jazyce Habitnautu (orbity/mise), ne XP/body/levely.**

**2a. Odznaky = „záznamy v lodním deníku" (milníky kontinuity)**
- Odměňovat kontinuitu a návrat, ne perfektnost:
  - 🛰️ „První orbita" — 7 dní v kuse se záznamem (jakýmkoli, i ❌ — cení se zápis).
  - 🌍 „Stabilní orbita" — 4 týdny bez „2× po sobě" u návyku.
  - 🚀 „Comeback" — po ❌ hned další den ✅ (odměna za návrat je u nás důležitější než streak!).
  - 🌕 „Měsíc" — 30 dní návyku, „Deep space" — 100 dní.
- Výpočet čistě klientsky z logDays (žádná DB migrace), zobrazit v Historie + toast při zisku.
- NEdělat: body, levely, avatary, penalizace (Habitica lekce).

**2b. Mikro-oslava dne** — po odkliknutí posledního návyku dne krátká animace/konfety
(HabitBee vzor „barevná reakce"). Levné, vysoký dopad, žádná data.

**2c. Explicitní „skip" jako 4. stav** (P1 č. 2 z feature matrix, dosud neimplementováno) —
➖ dnes znamená „neplánováno", chybí „omluveno" (nemoc/dovolená), které nezlomí streak
a nespustí pravidlo 2×. Vzor Way of Life (first-class tlačítko) + Everyday (2× práh).
Motivačně klíčové: streak nesmí být rozbitný nemocí. Vyžaduje: nový stav v markdown
formátu (např. 🏖️ nebo ⏭️), streaks.ts, obě API cesty — koordinovat s koučem (formát logu).

## 3. Další tipy z podobných appek (priorizovaně)

| Nápad | Vzor | Poznámka |
|---|---|---|
| **Večerní připomínka** (web push) | všechny top appky | Největší dopad na plnění; PWA push + Supabase cron („v 20:30 bez záznamu → push"). Netriviální infra — fáze po redesignu; levná mezivarianta: badge na ikoně PWA. |
| **Roční heatmapa „Year in Pixels"** | Habitify, HabitBee | Historie dnes táhne 3 měsíce; rozšířit endpoint /history na 12 měsíců a heatmapu na rok — „mapa cesty" jako emocionální kotva. |
| **Týdenní review v appce** | — (unikátní: kouč) | Neděle: kouč generuje review do repa — appka ho umí jen zobrazit (sekce „Review týdne" z plans/). Zero-cost propojení s koučem. |
| **Deník vět dne** | Everyday (journal) | Timeline všech „vět dne" pod Historie — Michal si pamatuje psaním, tohle je jeho paměťová stopa pohromadě. |
| **Dark mode** | standard | Quick win, ale patří do W3.5 přeoblečení (neřešit 2×). |
| **PWA shortcuts** („Check-in dneška" z ikony) | Streaks widgety | Manifest shortcuts — pár řádků, rychlý dojem „reálné appky". |
| Export CSV | Loop, Way of Life | Skip — git už je export. |
| Kvantitativní návyky, timer | Habitify | Skip — žádný aktuální návyk to nepotřebuje (pravidlo z W3.1). |

## Doporučené pořadí

1. **Backfill** (kap. 1) — hned, malá dávka, řeší denní frustraci, nezávislé na redesignu.
2. **Skip stav** (2c) — druhá dávka, chce rozhodnutí o formátu logu s koučem.
3. **W3.3/W3.5 redesign** — Michal pořád nevybral vizuální směr (blokuje ostatní polish).
4. **Odznaky + mikro-oslavy** (2a, 2b) — až na novém vizuálu, ať se nedělá 2×.
5. **Roční heatmapa, deník vět, review v appce** — postupně po redesignu.
6. **Web push připomínky** — samostatný infra blok nakonec.
