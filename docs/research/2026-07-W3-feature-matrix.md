# W3.1 — Feature matrix: klasické habit trackery (2026-07-06)

Vstup: `docs/plans/2026-07-06-w3-web-redesign-plan.md` (krok W3.1), `docs/2026-07-06-market-scan.md`
(AI koučové už zmapováni tam — tady jde o zavedené KLASICKÉ trackery + jeden čistý UX benchmark).

Appky: Habitify, Loop Habit Tracker, HabitNow, Streaks (iOS), Way of Life, Everyday, HabitKit,
Habitica — plus **HabitBee** jako čistě UX benchmark ("vypadá jako reálná appka", ne feature zdroj).

Metodika: web search + oficiální weby + store listingy + recenze (žádná appka nebyla nainstalována
naživo — vycházím z veřejně dostupné dokumentace a recenzí, u sporných detailů je to označeno).

---

## 1. Tabulka featur × appka

✓ = ano/plně, ~ = částečně/nejasné/limitované, ✗ = ne/nenalezeno

| Feature | Habitify | Loop | HabitNow | Streaks | Way of Life | Everyday | HabitKit | Habitica | HabitBee |
|---|---|---|---|---|---|---|---|---|---|
| Binary tracking | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (Dailies) | ✓ |
| Quantity/měřitelné | ✓ | ~ (skip pro měřitelné) | ✓ | ✗ | ✗ | ✓ | ~ (multi-log/den) | ✗ | ~ |
| Time-based (timer) | ✓ | ✗ | ✓ | ✓ (timed tasks) | ✗ | ✗ | ✗ | ✗ | ✗ |
| Frekvence: X×/týden, custom | ✓ | ✓ | ✓ | ✓ | ~ (jen daily) | ✓ | ✓ | ~ (jen Dailies) | ✓ |
| Skip / vynechání bez zlomení streaku | ~ (nejasné) | ✓ (strength algoritmus, ne binární zlom) | ✗ (nedoloženo) | ✗ (binární, zlomí se) | ✓ (neomezené skipy, first-class) | ~ (1 skip OK, 2× za sebou = zlom) | ~ (nejasné) | ✗ (penalizace, žádný skip) | ~ |
| Pauza/archiv návyku | ✗ (nedoloženo) | ✗ | ✗ | ✗ | ~ (Premium archiv) | ✗ | ✓ (archiv) | ✗ | ✗ |
| Statistiky (% úspěšnost, nejdelší streak) | ✓ | ✓ (habit strength skóre) | ✓ | ✓ | ✓ | ✓ | ✓ (streak-centric) | ~ (XP/level, ne % úspěšnost) | ✓ (Goal Hit Rate donut) |
| Heatmapa/grid (GitHub-style) | ✓ (roční calendar heatmap) | ~ (History widget, formát nejasný) | ~ (calendar grid, ne potvrzeno GitHub-style) | ~ ("dots" display) | ✓ (barevný grid: červená/zelená/žlutá) | ✓ (barevný gradient board) | ✓ (dlaždicový grid, klíčová featura) | ✗ | ✓ (weekday heatmapa + Year in Pixels) |
| Kalendářní pohled | ✓ | ~ | ✓ | ~ | ✓ | ✓ (habity×dny grid) | ✓ (tap-to-edit) | ✗ (nedoloženo) | ✓ (monthly dot grid) |
| Připomínky/notifikace | ~ (Plus/Pro tier) | ✓ (per-habit + snooze) | ✓ (vysoce nastavitelné) | ✓ (+ Watch haptika) | ✓ (custom zprávy) | ✓ | ✓ | ✗ (nedoloženo) | ✓ |
| Widgety | ✓ (nedávno zhoršené v recenzích) | ✓ (5 typů) | ✓ (premium) | ✓ (bohatá sada + Watch komplikace) | ✓ (iOS 17+) | ✓ (více velikostí + Watch) | ✓ ("krásné", marketingový pilíř) | ✗ | ✓ |
| Dark mode | ✓ | ✓ (pure black) | ✓ (premium) | ✓ | ✓ (+ více témat) | ~ (premium) | ✓ | ✗ (nedoloženo) | ✓ |
| Export dat (CSV/JSON/SQLite) | ✗ (jen integrace: Health, Zapier, API) | ✓ (CSV + SQLite) | ~ (zmíněno, formát nejasný) | ✗ (jen iCloud sync) | ✓ (CSV + Excel) | ✓ (CSV) | ~ (import/export souborů, formát nejasný) | ~ (open-source, formát nepotvrzen) | ✗ |
| Gamifikace | ~ (výzvy, žebříčky, "circles") | ✗ (jen strength skóre) | ✗ | ✗ (jen streaky) | ~ (chains, red/green) | ~ (barevná progrese) | ~ (streak-centric, minimální) | ✓✓ (plné RPG: avatar, quest, pety, guildy) | ✓ (bee avatar, barevné reakce, žebříčky) |
| Cena | Free (3 návyky) / $29.99–49.99 ročně / lifetime | Zdarma, open-source | Free (7 návyků) / $5.99 jednorázově | $5.99 jednorázově (univerzální) | Freemium + IAP | Free (3 návyky) / $7.49 měsíčně / $29.99 ročně / lifetime $49–99 | Freemium (cena nepotvrzena) | Freemium (cosmetics) | Free (3 návyky) / Pro předplatné |
| Cross-device sync | ✓ (iOS/Android/web/Watch) | ✗ (Android-only, žádný cloud) | ~ (Android/iOS, web nejasně) | ✓ (jen Apple ekosystém) | ~ (nedoloženo) | ✓ (web/iOS/macOS/Android/Watch) | ✓ (volitelný cloud) | ✓ (open-source backend) | ✓ (real-time Firestore) |

---

## 2. Appky jednotlivě — shrnutí a co si vzít

**Habitify** — Prémiový cross-platform tracker (iOS/Android/web/Watch) s hlubokou analytikou
(roční heatmapa, time-of-day analýza) a integracemi (Health, Zapier, API). Sociální vrstva
(výzvy, "circles") a nedávný redesign kritizovaný za osekání widgetů. **Vzít si:** roční heatmapa
+ time-of-day rozklad je silný analytický vzor; API/integrace ukazují, jak otevřít appku ven,
i když u nás export = git.

**Loop Habit Tracker** — Open-source, offline-first Android. Klíčový koncept: **"habit strength"
algoritmus místo binárního streaku** — vynechání pár dní po dlouhém streaku appku "neresetuje",
jen oslabí skóre. Přesně náš požadavek na nerozbitelný streak. Bohatý CSV/SQLite export,
5 typů widgetů. **Vzít si:** strength/momentum model místo tvrdého streak-zlomu — je to
nejbližší existující implementace naší koučovací filozofie "kontinuita > výkon".

**HabitNow** — Kombinace habit tracker + routine + to-do. Flexibilní tracking (binary/quantity/
timer), kalendář + stats dashboard. Skip/pauza nedoložena, spíš tradiční model. **Vzít si:**
kombinace habit + denní plán v jedné obrazovce (u nás relevantní pro "Dnes" view).

**Streaks (iOS)** — Apple Design Award, ekosystémová hloubka (Health auto-completion, Watch
komplikace, iCloud sync). Čistě binární, streak se zlomí vynecháním — **přesně to, co u nás
NECHCEME**. Bohatá widget sada, vysoké hodnocení (4.8, #1 kategorie). **Vzít si:** kvalitu
widgetů a "auto-completion od zdroje pravdy" (u nás obdoba: sync ze zdrojů, ne ruční zápis
všude) — ale ne streak-fragilitu.

**Way of Life** — Skip je **first-class tlačítko**, neomezené, appka to nepenalizuje —
nejblíž naší filozofii spolu s Loop. Barevný grid (červená/zelená/žlutá) čitelný na první
pohled, CSV+Excel export, malý indie tým s "osobním" feelingem komunikace. **Vzít si:**
tlačítko Skip jako rovnocenná třetí volba vedle ✓/✗ (ne jen absence záznamu), a red/green/yellow
kódování namísto čistě binárního.

**Everyday** — Barevný gradient board (GitHub-style), ale skip pravidlo je **"2× za sebou = zlom"**
— tedy formalizuje přesně naše pravidlo "nikdy 2× po sobě". Cross-platform, ale přísný free tier
(3 návyky). **Vzít si:** přímou inspiraci pro logiku — dvě vynechání v řadě je práh, který
appka sama vizuálně/logicky rozpozná (u nás: kouč aktivně zasáhne).

**HabitKit** — Minimalistická estetika, dlaždicový/GitHub-style heatmapa grid je hlavní vizuální
prvek, "krásné" widgety jako marketingový pilíř, archivace návyků bez smazání. Cena nepotvrzena,
ale vysoké hodnocení (4.8/4.5). **Vzít si:** heatmapa jako centrální vizuální prvek dashboardu +
archiv (soft-delete) návyku jako UI vzor.

**Habitica** — Plné RPG (avatar, XP, quest, pety, guildy, penalizace za nesplnění Daily).
Recenze 2026 ale kritizují stagnaci vývoje, bugy, pomalost, "spíš dřina než zábava" — komplexita
odrazuje. **Vzít si:** varovný příklad — gamifikace může appku zatížit a odvést pozornost od
jádra (návyku) k meta-hře. **Nevzít si:** RPG vrstvu vůbec (viz priorizace níže).

**HabitBee (čistě UX benchmark)** — Proč působí jako "reálný produkt": mood-based barevné karty
plynule přecházející červená→zelená, bee maskot reagující barvou na progres, plynulé
mikroanimace (typewriter efekt u AI chatu, smooth přechody), guest mode pro vyzkoušení appky
bez registrace, AI chat jako průvodce onboardingem místo statického tutoriálu, konzistentní
"honey" barevná paleta místo generického flat designu. **Vzít si:** právě tohle je jádro pro
krok W3.3 (design) — viz sekce UX vzory níže.

---

## 3. Priorizace featur pro nás

Kontext: osobní tracker nad markdown v gitu, web PWA, Supabase backend, single-user (3 návyky
+ šachy jako odměna), pravidlo "streak nesmí být rozbitelný jedním vynecháním" a "nikdy 2× po
sobě".

### P1 — do W3.4 (další implementační fáze)

1. **Heatmapa historie (GitHub-grid style)** — potvrzeno jako standard napříč Habitify/Way of
   Life/Everyday/HabitKit/HabitBee. Nejsilnější "vypadá jako reálná appka" signál a přímo čitelný
   přehled kontinuity.
2. **Explicitní skip/pauza jako 3. stav (ne jen ✓/✗)** — inspirace Way of Life (neomezený skip)
   + Everyday (2× za sebou = práh). U nás: den označený "skip" (nemoc, dovolená) se nepočítá jako
   selhání a nesmí zlomit streak; teprve 2. den bez skipu v řadě spustí koučovací zásah. Toto je
   přímo naše stávající pravidlo "nikdy 2× po sobě" — appky nám ukazují UI vzor, jak ho zobrazit.
3. **Statistiky: % úspěšnost + aktuální/nejdelší streak** — univerzální napříč všemi klasickými
   trackery, základ pro týdenní review.
4. **Správa návyků v UI (CRUD)** — teď jen v `habits.md`/seed; HabitKit ukazuje archiv (soft-delete)
   jako bezpečný vzor místo tvrdého mazání.
5. **Kalendářní pohled** — doplněk k heatmapě pro přesné datum-level review (relevantní pro
   týdenní/měsíční review krok kouče).

### P2 — později (ne blokující W3.4)

- **Dark mode** — univerzální standard, ale je to "polish" krok (patří spíš do W3.4 dávky 4,
  ne do jádra P1 funkcí).
- **Widgety (PWA/home screen)** — silný "reálná appka" signál (HabitKit, Streaks), ale
  technicky návazné na PWA vylepšení mimo základní web redesign; odložit až bude appka stabilní.
- **Export dat** — u nás nižší priorita, protože **git je už export** (markdown = zdroj pravdy,
  design doc §3). Případně později jako "stáhni si CSV report" pro čitelnost mimo git.
- **Reminders/notifikace (web push)** — užitečné, ale závislé na PWA push infrastruktuře;
  netriviální bez appky v popředí. Later.
- **Time-based/timer tracking** — Habitify/HabitNow/Streaks to mají, ale žádný z Michalových
  3 návyků + šachy timer nepotřebuje; přidat jen pokud vznikne konkrétní návyk, který to
  vyžaduje (pravidlo "nepřidávat novou featuru bez konkrétní potřeby").
- **Cross-device / native widgety mimo web** — čeká na fázi 1b/2 (Wear OS, Android), která je
  podle plánu pozastavená.

### VYNECHAT (s důvodem)

- **Plná RPG gamifikace (Habitica-styl: avatar, XP, quest, pety, guildy)** — protiřečí naší
  koučovací filozofii "kontinuita > výkon"; Habitica recenze navíc ukazují, že tahle vrstva
  appku zpomaluje a odvádí pozornost od jádra. Odměna u nás je šachy (mimo appku), ne herní
  mechanika uvnitř.
- **Sociální vrstva (leaderboardy, sdílení, party/guildy, "circles")** — appka je single-user
  po designu (Michal); žádný smysl budovat multiplayer vrstvu.
- **Bodový/level systém, badges** — stejný důvod jako RPG výše; číselné body nejsou náš
  koučovací jazyk (ten je textový, v `log/` a `journal/`).
- **Time-based timer tracking** — viz P2 zdůvodnění, řešit jen na vyžádání.
- **Quantity/měřitelné počítadlo jako obecná featura** — zatím žádný z aktivních návyků
  není měřitelný numericky (spíš binary + poznámka); nepřidávat dřív, než vznikne konkrétní
  potřeba (pravidlo "nikdy nepřidávej nový návyk/featuru bez potřeby").
- **Habit strength "skóre"** (Loop) jako viditelné číslo — filozoficky zajímavé (nerozbitelnost
  streaku), ale číselné skóre je gamifikační cizí prvek pro nás; **princip** (vynechání
  neresetuje vše) si bereme, **vizualizaci jako skóre** ne — u nás to bude řešit kouč textově
  + heatmapa/kalendář, ne další číslo.

---

## 4. UX vzory — pro krok W3.3 (design)

Konkrétní vzory z appek (hlavně HabitBee coby benchmark + doplňky odjinud), které dělají
z appky "reálný produkt" místo generického MVP:

1. **Plynulý barevný přechod stavu (červená → zelená)** — HabitBee/Way of Life: karta/dlaždice
   dne mění barvu podle plnění, ne binární přepínač. Dává vizuální "dech" i při špatném dni
   (žlutá/oranžová pro skip, ne rovnou červená pro selhání).
2. **Guest/no-signup zkušební režim před závazkem** — HabitBee: appku lze zkusit naplno bez
   registrace. U nás sice single-user, ale princip "nejdřív ukázat hodnotu, pak požádat o krok"
   platí i pro onboarding do nového designu.
3. **AI/konverzační průvodce místo statického tutoriálu** — HabitBee používá chat jako
   onboarding vodítko. U nás to sedí přirozeně (kouč existuje) — onboarding může být dialog,
   ne wizard s šipkami.
4. **Mikroanimace na klíčových interakcích** (typewriter efekt, smooth transitions, žádné
   trhavé přepnutí stavu) — signál "někdo se staral o detail", ne jen funkční CSS.
5. **Konzistentní vlastní barevná/tematická identita** ("honey" paleta u HabitBee) místo
   generických Tailwind defaultů — přímo navazuje na W3.2 (branding) a požadavek "vlastní
   vizuální identita, ne generický lucide/heroicons vzhled".
6. **Prázdné stavy (empty states) jako pozvánka, ne díra v UI** — všechny appky s vyšším
   hodnocením (Streaks, HabitKit, HabitBee) mají obrázek/text/CTA místo prázdné bílé plochy
   při první návštěvě nebo dni bez záznamů.
7. **Heatmapa jako emocionální kotva dashboardu** — nejkonzistentnější vzor napříč všemi
   appkami (5+ z 9). Funguje jako "roční mapa cesty", ne jen tabulka dat — měla by být
   první věc, na kterou padne oko po přihlášení.
8. **Explicitní "3. tlačítko" pro skip/pauzu vedle ✓/✗** — Way of Life, Everyday: skip má
   vlastní vizuální stav a barvu, není to jen "nevyplněno". U nás kriticky důležité pro
   pravidlo nerozbitelného streaku — musí být na Dnes obrazovce stejně dostupné jako splnění.

---

## Poznámka k metodice

Zdroje: oficiální weby (habitify.me, wayoflifeapp.com, habitkit.app, habitica.com aj.),
App Store / Google Play listingy, agregátory (Zapier, Productivity Directory, AppBrain,
Reclaim.ai) a recenze. Žádná appka nebyla nainstalována a ověřena naživo — u sporných/nejasných
detailů (označeno "~" nebo "nedoloženo") doporučuji při reálné potřebě ověřit přímo v appce,
zejména Habitica dokumentace byla částečně nedostupná a HabitKit ceník nepotvrzen.
