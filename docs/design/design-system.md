# Habitnaut — Design System: „Stezka"

Vítězný směr z W3.3 (viz `proposal.md` §5). Zdrojový mockup: `mockups/smer-8.html`.
Tento dokument je závazný podklad pro přeoblečení UI (W3.5) — plné tokeny, typografie,
stavy komponent, mapování na stávající React komponenty a migrace z dnešního `index.css`.

Datum: 2026-07-11 · Stav: **ke schválení, pak start W3.5**

---

## 1. Koncept a slovník

**Metafora:** návyk = prošlapaná cesta. Opakovaný průchod pěšinu vyšlape, bez chození
zarůstá. Vizuální jazyk českého turistického značení. Metafora nese i pravidla kouče —
skip = odpočívadlo (na stezce se odpočívá, jde se dál), 2× vynecháno = pěšina zarůstá.

**Slovník (používat konzistentně v UI i copy):**

| Doména | Stezka termín | Kde |
|---|---|---|
| dnešek | **etapa** / dnešní úsek | Dnes |
| návyk | **úsek stezky** (má vlastní barvu značky) | Dnes, Návyky |
| check-in splněno | **Projito** (razítko s časem) | Dnes |
| skip / omluveno (⏭️ excused) | **Odpočívadlo** (přístřešek) | Dnes |
| neplánováno (➖ unplanned) | **Mimo trasu** | Dnes |
| vynecháno (❌ missed) | **Sešel jsem z cesty** | Dnes |
| streak | **dní na stezce** / bez přetrhu | Dnes, Historie |
| heatmapa | **mapa prošlapání** (vrstevnice, tmavší = vyšlapanější) | Historie |
| věta dne | **vrcholová kniha** | Dnes |
| odměna (šachy) | **odbočka k vyhlídce** (žlutá značka) | Dnes |
| domovská obrazovka | **Základna** | nav |

**Terminologii nesázet do datového modelu** — log/markdown zůstává v ✅/❌/⏭️/➖
(zdroj pravdy, design §3). Stezka slovník je jen prezentační vrstva.

---

## 2. Barevné tokeny

### 2.1 Základ (light — „mapa za denního světla")

```css
--map:      #f3eedd;  /* pozadí — mapový papír */
--card:     #fbf8ec;  /* karta úseku */
--white:    #fdfcf6;  /* rozcestník, značka, tlačítka */
--contour:  #ddd3b4;  /* vrstevnice, jemné linky */
--line:     #d8cdad;  /* okraje karet */
--ink:      #2a2416;  /* text, obrysy značek */
--ink-2:    #6a5f48;  /* sekundární text */
--ink-3:    #a2967b;  /* terciární / neaktivní */
```

### 2.2 Dva barevné kanály — KRITICKÉ PRAVIDLO

Stezka má **dvě nezávislé barevné soustavy**, které se nesmí míchat:

**A) Barva značky = identita úseku** (která pěšina to je). Bílá–barva–bílá pruh,
vždy vlevo na kartě. Nikdy nemění barvu podle stavu.

```css
--red:    #c8371f;  /* značka: Cvičení */
--blue:   #2e6b9f;  /* značka: Čtení */
--green:  #3a7a44;  /* značka: QA/AI */
--yellow: #d9a417;  /* značka: Šachy (odbočka/odměna) */
```

**B) Barva stavu = zda jsem úsek prošel** (done/rest/miss). Vždy vpravo, na
check-in tlačítkách a razítku „Projito".

```css
--st-done:      #3a7a44;  --st-done-soft:  #e4eede;   /* Projito ✓ */
--st-rest:      #d9a417;  --st-rest-soft:  #f6ecce;   /* Odpočívadlo (excused) */
--st-rest-ink:  #8a6a12;  /* čitelný text na rest-soft */
--st-miss:      #c8371f;  --st-miss-soft:  #f3ded8;   /* Sešel z cesty ✗ */
--st-idle:      #a2967b;  /* Mimo trasu (unplanned) — jen šedá */
```

**Proč to funguje i při kolizi barev** (cvičení má červenou značku a `--st-miss`
je taky červená): kanály jsou oddělené **prostorem a tvarem**, ne barvou. Značka =
vodorovný pruh vlevo; stav = tlačítko se symbolem vpravo + razítko. Uživatel čte
„která pěšina" a „prošel jsem ji" ze dvou různých míst a dvou různých tvarů.
**Pravidlo: stav nikdy neobarvuje značku a značka nikdy nevstupuje do stavového
kanálu.** Při návrhu nových komponent tohle držet.

### 2.3 Přiřazení barvy značky návyku

- 4 fixní barvy dané turistickým značením (červená/modrá/zelená/žlutá) — **paleta
  je konečná**, to je součást charakteru, ne omezení k obcházení.
- Aktuální 3 návyky + šachy: Cvičení→red, Čtení→blue, QA/AI→green, Šachy→yellow (odměna).
- Nový návyk: přiřadit první volnou barvu z palety; při >4 aktivních návycích barvy
  cyklí (dva úseky můžou sdílet barvu — na reálné stezce taky). Kolize se rozliší
  názvem + ikonou.
- **Datový model:** přidat volitelný `marker_color` na habit (enum `red|blue|green|yellow`).
  Do `system/habits.md` jako pole u dávky; DB sloupec `marker_color text`. Když chybí,
  odvodit deterministicky z pořadí (index → paleta), ať staré návyky mají stabilní barvu.
  Šachy (is_reward) = vždy yellow. **Neblokující pro W3.5** — dokud sloupec není,
  odvozovat z pořadí klientsky.

---

## 3. Typografie

```css
--font-display: 'Zilla Slab', Georgia, serif;         /* nadpisy, názvy úseků, wordmark */
--font-body:    'Atkinson Hyperlegible', system-ui, sans-serif;  /* tělo */
--font-mono:    'Chivo Mono', ui-monospace, monospace; /* vzdálenosti, časy, meta */
```

- **Zilla Slab** — slabserif s „atlasovým" charakterem (mapové/průvodcovské edice).
  Váhy 600 (názvy úseků) a 700 (nadpisy, rozcestník, wordmark).
- **Atkinson Hyperlegible** — navrženo pro maximální čitelnost (Braille Institute);
  sedí k turistickému značení = funkční čitelnost v terénu. Váhy 400/700.
- **Chivo Mono** — čísla na rozcestníku (vzdálenosti, časy, %, „TÝDEN 28").

**Škála (mobil 390px):**

| Token | px / lh | Užití |
|---|---|---|
| display-xl | 40 / 1.0 | intro nadpis (jen doc/marketing) |
| display-l | 24 / 1.05 | nadpis obrazovky Historie |
| dest | 22 / 1.1 | datum na rozcestníku (Dnes) |
| title | 15.5 / 1.2 | název úseku (návyku) |
| body | 14 / 1.5 | běžný text, plán dne |
| small | 12.5 / 1.45 | poznámky, popisky |
| mono | 10–10.5 / 1.3 | dávka, čas, meta (uppercase, letter-spacing .1–.14em) |
| micro | 8.5–9 / 1.2 | razítko, legenda, nav popisky |

---

## 4. Prostorové tokeny

```css
--r-sm: 6px;    /* razítko, drobné prvky */
--r-md: 12px;   /* karty úseků, tlačítka triády (9px) */
--r-lg: 14–16px;/* mapové panely, vrcholová kniha */
--r-signpost: 6px 26px 26px 6px;  /* rozcestník — plochý vlevo, oblý vpravo (směr chůze) */

--shadow-card:    0 2px 0 rgba(42,36,22,.07);   /* jemné usazení karty */
--shadow-signpost:3px 3px 0 rgba(42,36,22,.18); /* tvrdý offset — „cedule visí" */
--shadow-phone:   0 30px 70px -30px rgba(42,36,22,.45);

--gap: 10px;    /* mezi kartami úseků */
--screen-pad: 22px 18px 96px;  /* padding obrazovky (bottom = nad nav) */
```

**Textura pozadí — vrstevnice (podpis značky):** koncentrické elipsy jako na
topografické mapě. Decentní (opacity .08–.12), NE plný vesmír/les na pozadí.

```css
background-image:
  repeating-radial-gradient(ellipse 700px 500px at -10% -20%, transparent 0 42px, rgba(160,140,90,.12) 42px 43px),
  repeating-radial-gradient(ellipse 800px 600px at 120% 120%, transparent 0 50px, rgba(160,140,90,.09) 50px 51px);
```

Volitelný pomalý drift `background-position` 60s lineárně (respektuje reduced-motion).

---

## 5. Komponentní inventář

Mapování na stávající React komponenty (`web/src/components/`). „→" = přejmenování/přestylování,
ne nová architektura. Datový tok a props zůstávají.

| Stezka komponenta | Stávající | Změna |
|---|---|---|
| `AppShell` + `TrailNav` (bottom nav, dřevěné směrovky) | App.tsx `TabNav` (top tabs) | **top→bottom nav**, 5 položek s vlastními SVG (Dnes/Týden/Mapa/Návyky/Základna); palcová dostupnost |
| `Signpost` (rozcestník s datem) | App.tsx header | tvar cedule s hrotem vpravo, `--font-display` |
| `TrailLeg` (karta úseku) | `TodayCard` řádek | značka vlevo, info, `StatusTriad` vpravo, razítko „Projito HH:MM" při done |
| `TrailMark` (bílá-barva-bílá) | *nová* | 30×22, 3 pruhy, barva dle `marker_color` |
| `StatusTriad` (✓/odpočívadlo/mimo/✗) | `checkinStatus.ts` STATUS_BUTTONS | **4 tlačítka**, stezka ikony (viz §6) |
| `Stamp` „Projito" | *nová* | zelené razítko s časem, rotace -2° |
| `SummitLog` (věta dne) | `TodayCard` věta | podnadpis „Vrcholová kniha", linka |
| `RewardShelter` (šachy) | `TodayCard` reward hint | žlutá čárkovaná značka, „odbočka k vyhlídce" |
| `KmStrip` (streak karty) | `StreakCards` | 3 buňky: dní na stezce / etapa týdne / varování „zarůstá" |
| `WearMap` (mapa prošlapání) | `HeatmapGrid` | vrstevnicová paleta w1–w4 (okr→hnědá), dnešek červený outline |
| `SegmentedControl` (Mapa/Kalendář/Kniha) | `HistoryView` přepínač | 3 pozice, stezka styling |
| `DistanceRow` (statistika úseku) | `HistoryStats` | rozcestníková cedulka: název + „12/14 · 86 % · nejdelší 9" |
| `CalendarView` | `CalendarView` | zachovat tap-to-edit backfill, přestylovat na stezku |
| `SummitTimeline` (deník vět) | `SentencesTimeline` (v HistoryView) | „Vrcholová kniha" styling |
| `AchievementsRow` (odznaky) | `AchievementsRow` | **milníky = razítka do vrcholové knihy** / cedulky na trase (viz §9) |

### 5.1 Stavy `StatusTriad` (4 stavy)

Sjednotné pro Dnes i backfill v kalendáři. Symbol nese význam i bez barvy:

| Stav (data) | Stezka | Ikona | Neaktivní | Aktivní |
|---|---|---|---|---|
| done | Projito | ✓ (fajfka) | outline, ink-3 | `--st-done` bg soft + inset ring, razítko |
| excused | Odpočívadlo | přístřešek (dům/stříška) | outline | `--st-rest` bg soft, ink `--st-rest-ink` |
| unplanned | Mimo trasu | — (pomlčka) | outline | `--st-idle` jemné |
| missed | Sešel z cesty | ✗ | outline | `--st-miss` bg soft + inset ring |

Pořadí tlačítek zleva: **Projito · Odpočívadlo · Mimo · Sešel** (nejčastější→nejméně,
a „selhání" až vpravo — neakcentovat ho). Titulky (`title`) plným copy: „Odpočívadlo
(nemoc/dovolená) — nezlomí stezku".

---

## 6. Ikonografie

Vlastní SVG sada (žádné lucide/heroicons). Stroke 1.8–2, `stroke-linecap: round`.

| Ikona | Motiv |
|---|---|
| nav: Dnes | orbita→pěšina: klikatá čára s bodem (poutník na cestě) |
| nav: Týden | rozcestníková šipka |
| nav: Mapa | mapový rám s vrstevnicí |
| nav: Návyky | seznam s cedulkou |
| nav: Základna | kompasová růžice |
| stav: Projito | fajfka |
| stav: Odpočívadlo | přístřešek (dům se stříškou) — **stejný motiv i pro excused v logu** |
| stav: Mimo trasu | pomlčka |
| stav: Sešel z cesty | křížek |
| úsek: Cvičení/Čtení/QA | vlastní glyf per návyk (činka/kniha/jiskra) — v `--ink`, ne v barvě značky |

**Skip = přístřešek, nikdy ne varovná/červená ikona** — jazyk značky říká, že to není
selhání (shodné s pravidlem z proposal §2 a s excused sémantikou, kterou už máme v kódu).

---

## 7. Motion

Z hlavičky mockupu, závazné principy:

- **Nástup značek:** barevný pruh roste zleva 240ms ease-out, stagger 70ms — „tah štětcem".
- **Check-in Projito:** razítko dopadne (scale 1.1→1 + fade, 200ms), rozcestníková šipka
  se lehce zhoupne (transform-origin vlevo, 6°).
- **Odpočívadlo:** stříška se usadí (translateY -4→0, 200ms).
- **Mapa prošlapání:** políčka tmavnou postupně po týdnech (stagger po sloupcích) —
  pěšina se vyšlapává před očima.
- **Vrstevnice:** volitelný drift 60s lineárně.
- **Mikro-oslava dne** (už máme `Celebration.tsx`): přeladit z konfet na stezku —
  „razítko do vrcholové knihy" + krátký text „Etapa dojita!".
- **`prefers-reduced-motion`:** vše statické, jen okamžitý stav. Povinný fallback.

---

## 8. Dark mode (P2 — „noční pochod / mapa při čelovce")

Skica, ne teď (feature matrix P2). Stezka má přirozený tmavý protějšek:

```css
--map:   #1c1a12;  --card: #262115;  --white: #2e2818;
--contour:#3a3320; --line: #3a3320;
--ink:   #ece3cc;  --ink-2:#b3a888;  --ink-3: #7c745c;
/* značkové barvy zesvětlit ~12% pro kontrast na tmavé */
--red:#e0553b; --blue:#5a97c9; --green:#5a9e63; --yellow:#e6bb4a;
```

Vrstevnice světlejší tahy na tmavém. Přepínač v „Základna". Implementovat až po W3.5 jádru.

---

## 9. Napojení na budoucí vrstvu „Cestička s avatarem"

Michalův nápad (BACKLOG, 2026-07-11): grafická mapa, avatar poutníka se posouvá o
políčko za splněný den/streak, na trase milníky (chata, vyhlídka, studánka), ve fázi 4
potkávání jiných poutníků. Design system to připravuje:

- **Nav „Mapa"** je už teď kandidát na hostitele plné cestičky (dnes = mapa prošlapání;
  později = i lineární trasa s avatarem). Nezavírat IA slot.
- **Odznaky = milníky na trase** — `AchievementsRow` renderovat jako cedulky/razítka;
  později tytéž milníky umístit na grafickou cestičku (jeden zdroj dat `computeAchievements`).
- **Guardrail (důležité):** posun avatara = **prostorový** progres (sedí k „prošlapávání"),
  **NE body/XP/level.** Jeden splněný den = jeden krok; milník = razítko, ne skóre.
  Držet lekci z Habitica (feature matrix „vynechat"). Odměna zůstává mimo appku (šachy).
- Avatar/cestička je samostatná feature až po W3.5 — sem jen neblokovat.

---

## 10. Migrace z dnešního `index.css`

Stezka je **evoluce**, ne rewrite — dnešní appka už je warm paper/ink/green/red.
Konkrétní změny tokenů:

| Dnešní token | Stezka | Akce |
|---|---|---|
| `--color-paper #f6f1e7` | `--map #f3eedd` | posun teploty |
| `--color-paper-warm` | `--card #fbf8ec` / `--white #fdfcf6` | rozdělit |
| `--color-ink #211a11` | `--ink #2a2416` | ~stejné |
| `--color-line #ddd2bd` | `--line #d8cdad` + `--contour #ddd3b4` | rozdělit |
| `--color-done #2f6b4f` | `--st-done #3a7a44` | sladit se značkovou zelenou |
| `--color-miss #b3452e` | `--st-miss #c8371f` | sladit se značkovou červenou |
| `--color-marker #f0c94c` | `--st-rest #d9a417` | žlutá = odpočívadlo |
| — | `--blue #2e6b9f` | **nový** (značka Čtení) |
| `Fraunces` | `Zilla Slab` | swap `--font-display` |
| `Instrument Sans` | `Atkinson Hyperlegible` | swap `--font-body` |
| `Fragment Mono` | `Chivo Mono` | swap `--font-mono` |

Fonty: aktualizovat `<link>` v `index.html` + `--font-*` v `index.css` (Tailwind v4
`@theme`). PWA manifest `theme_color`/`background_color` → `--map #f3eedd`.

**Pořadí W3.5:** (1) tokeny + fonty v `index.css`/`index.html`, (2) `TrailMark` +
`StatusTriad` 4 stavy + `Signpost`, (3) bottom nav, (4) `WearMap` paleta, (5) přeladit
`Celebration` + `AchievementsRow` na razítka, (6) e2e smoke (Playwright) na 390px.

---

## 11. Přístupnost

- Barva značky **není jediný nosič** identity — vždy doprovází název + glyf úseku.
- Stavový kanál čitelný tvarem (✓/přístřešek/—/✗), ne jen barvou (WCAG 1.4.1).
- Atkinson Hyperlegible = vysoká čitelnost; kontrast ink na map ≥ 7:1 (AAA text).
- Cílové plochy tlačítek ≥ 34px (triáda) — palcová obsluha.
- `prefers-reduced-motion` fallback povinný (§7).
- Razítko „Projito HH:MM" nese info i pro barvoslepé (text, ne jen zelená).
