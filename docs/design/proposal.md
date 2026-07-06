# W3.3 — Návrh: informační architektura + 3 vizuální směry

Datum: 2026-07-06 · Krok W3.3 z `docs/plans/2026-07-06-w3-web-redesign-plan.md`
Vstupy: `BRANDING.md` (Habitnaut), `docs/research/2026-07-W3-feature-matrix.md` (P1 + UX vzory),
současný web MVP (`web/src/`), produktový design §1–4.
Stav: **čeká na Michalův výběr směru** — plné design tokens + design-system.md se rozpracují
až pro vítěze (follow-up krok, ne teď).

---

## 1. Informační architektura

Jeden uživatel (Michal), primárně telefon (PWA). Hlavní use case: **večerní 2minutový
check-in** — vše je optimalizované na rychlost odškrtnutí.

### Navigace: bottom nav, 5 položek

Palec dosáhne, jeden tap kamkoli, aktivní stav vždy viditelný. Vlastní SVG ikony
(orbit/checkpointy/souhvězdí/orbitální seznam/palubní ovladač — žádné generické sety).

| # | Obrazovka | Účel | Co na ní žije |
|---|---|---|---|
| 1 | **Dnes** (start) | 2min check-in | denní orbita (progress ring s checkpointy), karty návyků s trojicí stavů ✓ / korekce (skip) / ✗, věta dne, streak chip, šachy jako odměna (nikdy jako úkol) |
| 2 | **Týden** | kontext týdenního plánu | tabulka dní × návyků z `plans/`, poznámky/detaily plánu, stav vůči plánu |
| 3 | **Historie** | reflexe + statistiky | heatmapa („hvězdná mapa", emocionální kotva nahoře), přepínač heatmapa ⇄ **kalendář** (tap na den = detail/oprava zpětně), statistiky (% úspěšnost, aktuální/nejdelší streak), poslední zápisy z lodního deníku |
| 4 | **Návyky** | CRUD | seznam aktivních návyků (název, dávka, frekvence), přidat/upravit/pozastavit (**pauza** = delší dovolená/nemoc), **archiv** (soft-delete, sekce dole) — zrcadlí se do `system/habits.md` |
| 5 | **Nastavení** | vzácné akce | účet/odhlášení, dark mode (P2), info o sync (git = zdroj pravdy), verze |

### Umístění P1 featur z matice

- **Heatmapa (GitHub grid)** → Historie, první prvek na obrazovce („hvězdná mapa letu").
- **Skip/pauza — třetí stav** → dvě úrovně: *denní skip* („korekce kurzu") je rovnocenné
  tlačítko vedle ✓/✗ přímo na kartě v Dnes (vzor Way of Life); *pauza návyku* (dovolená,
  nemoc na týden) je akce v detailu návyku na obrazovce Návyky. Skip nikdy nerozbíjí streak;
  2× vynecháno bez skipu = práh pro zásah kouče (vzor Everyday = naše pravidlo).
- **Statistiky (% úspěšnost, nejdelší streak)** → Historie pod heatmapou; malý streak chip
  i na Dnes (bez čísel navíc — žádné skóre/gamifikace, viz feature matrix „vynechat").
- **Kalendářní pohled** → Historie jako druhý tab segmentového přepínače (heatmapa je default).
- **Archiv** → Návyky (archivované návyky pod aktivními, obnovitelné).

### Optimalizace 2min check-inu

1. PWA se otevírá rovnou na Dnes; žádný mezikrok.
2. Jeden tap = hotovo (optimistic update); trojice stavů je viditelná bez rozbalování.
3. Věta dne je jedno pole hned pod kartami — napsat a odeslat, žádný dialog.
4. Vše nad ohybem: 3 návyky + věta dne se vejdou na výšku 390×760 bez scrollu.

---

## 2. Tři vizuální směry

Mockupy: `docs/design/mockups/smer-1.html` · `smer-2.html` · `smer-3.html`
(statické HTML, mobilní viewport 390 px, každý zobrazuje Dnes + fragment Historie
s heatmapou; motion principy popsané v komentáři v hlavičce každého souboru).
Všechny tři nesou brand Habitnaut (orbity, checkpointy, lodní deník, korekce kurzu,
hvězdná mapa) — decentně, žádný kýčovitý vesmír na pozadí.

| | **Směr 1 — Palubní deník** | **Směr 2 — Řídicí středisko** | **Směr 3 — Retro mise** |
|---|---|---|---|
| Klíčová myšlenka | deník průzkumníka: check-in = razítko, historie = hvězdná mapa zakreslená perem do papíru; evoluce stávajícího „ink on paper" | noční pult řídicího střediska: tmavá paluba, jantarové přístroje, tyrkysová telemetrie, HUD panely | plakáty NASA 70. let: tlusté obrysy, sluneční oblouky, mission-stripe pruhy, odznaky mise; vesmír za denního světla |
| Typografie | Fraunces · Instrument Sans · Fragment Mono | Rajdhani · Chivo · Martian Mono | Unbounded · Familjen Grotesk |
| Paleta | papír `#f5efe2`, inkoust `#262013`, zlatá `#c88f2d`, modř `#31506e`, zeleň `#2f6b4f` | void `#070b14`, jantar `#ffb454`, tyrkys `#5ec8ff`, zeleň `#41d99b` | krém `#f6efdd`, navy `#1e2a52`, oranž `#e4572e`, zlatá `#efa93d`, teal `#2d936c` |
| Motion | usazení na papír, razítko, pomalé věčné orbity | naběhnutí systémů, radarový blip, dýchající hvězdy | pružné pop-in samolepek, otisk odznaku, vysunutí pruhů |
| Pro | kontinuita s MVP (nejlevnější migrace); teplý, klidný, „věc co máš rád v ruce"; sedí ke koučovacímu tónu deníku | večerní check-in ve tmě šetří oči (dark mode zdarma v jádru); nejsilnější „mission control" příběh značky; data vypadají přesně | nejvýraznější vlastní identita, na první pohled „reálný produkt"; energický a optimistický; heatmapa jako plakát |
| Proti | nejmenší skok od „AI-generated MVP" dojmu; papírová textura může na OLED působit mdle | tmavá jako jediný režim může být přes den méně čitelná (light mode by byl druhý projekt); riziko „terminálové" chladnosti | tlusté obrysy a pruhy snesou nejmíň obsahu na obrazovku; hravost může časem unavit; nejdál od současného kódu |

### Design tokens + komponentní inventář (stručně, plné rozpracování až po výběru)

Společný inventář komponent (všechny směry, liší se jen stylem):
`AppShell + BottomNav` · `OrbitRing` (denní progress s checkpointy) · `HabitCard`
(ikona, název, dávka, stavová trojice) · `StatusTriad` (✓ / korekce / ✗) · `SentenceInput`
(věta dne) · `Heatmap` + `Legend` · `SegmentedControl` (mapa ⇄ kalendář) · `StatCard` ·
`LogEntry` · `RewardHint` (šachy) · `EmptyState` · `Toast/optimistic stav` ·
`HabitForm` (CRUD) · `ArchiveList`.

**Směr 1 — Palubní deník**
- Tokens: `--paper #f5efe2 · --card #fbf7ec · --ink #262013 · --ink-soft #5c5244 ·
  --line #d8ccb2 · --gold #c88f2d · --navy #31506e · --done #2f6b4f · --miss #a8402b`;
  radius 14; stín `3px 3px 0 var(--line)` (tvrdý offset); tečkovaná papírová textura.
- Specifika komponent: razítko „Zapsáno HH:MM", čárkované orbity (SVG dash), heatmapa
  jako inkoustové tečky rostoucí velikostí, zlatá hvězda = plný den.

**Směr 2 — Řídicí středisko**
- Tokens: `--void #070b14 · --panel #0f1728 · --line #1e2c45 · --text #e8eef8 ·
  --dim #8b99b0 · --amber #ffb454 · --cyan #5ec8ff · --done #41d99b · --miss #ff6d5c`;
  radius 10; HUD rožky (amber) na panelech; glow jen na aktivních stavech.
- Specifika: telemetrie v Martian Mono (oblet, spojení), orbit gauge s dokreslovaným
  obloukem, heatmapa jako svítící hvězdná mapa (level 3 dýchá), status řádky ■/◈.

**Směr 3 — Retro mise**
- Tokens: `--cream #f6efdd · --card #fdf9ee · --navy #1e2a52 · --orange #e4572e ·
  --gold #efa93d · --teal #2d936c`; radius 18; obrysy 2 px navy; stín `4px 4px 0 navy`;
  mission-stripe pruh (oranž/zlatá/teal/navy) jako podpis značky.
- Specifika: odznak „Oblet 187" (badge s rotací), sluneční oblouk s checkpointy místo
  ringu, samolepka „Odbaveno", heatmapa jako plakátové dlaždice, stat karty v plných barvách.

### Společné pro všechny směry (nezávislé na výběru)

- Zákaz generických ikon setů — vlastní SVG sada (orbit, checkpoint-arc, souhvězdí,
  orbitální seznam, palubní ovladač, korekce kurzu, činky, kniha, jiskra, vlajka odměny).
- Skip = „korekce kurzu": vždy vizuálně přátelský (čárkovaný obrys, zlatá/jantar),
  nikdy červený — jazyk značky říká, že to není selhání.
- `prefers-reduced-motion`: všechny animace mají statický fallback.
- Šachy se nikdy nerenderují jako checkbox — jen jako textový „reward hint".

---

## 3. Další krok

Michal vybere směr (orchestrátor předloží mockupy). Follow-up subagent pak rozpracuje
vítěze do `docs/design/design-system.md` (plné tokens, typografická škála, spacing,
všechny stavy komponent, dark-mode strategie) — teprve potom startuje W3.4 dávka 1.
