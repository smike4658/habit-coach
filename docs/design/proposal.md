# W3.3 — Návrh: informační architektura + vizuální směry

Datum: 2026-07-06 · Krok W3.3 z `docs/plans/2026-07-06-w3-web-redesign-plan.md`
Vstupy: `BRANDING.md` (Habitnaut), `docs/research/2026-07-W3-feature-matrix.md` (P1 + UX vzory),
současný web MVP (`web/src/`), produktový design §1–4.
Stav: **čeká na Michalův výběr směru** — plné design tokens + design-system.md se rozpracují
až pro vítěze (follow-up krok, ne teď).
Aktualizace 2026-07-07: přidáno **kolo 2** (směry 4–7, viz níže) po Michalově zpětné vazbě
na kolo 1: „Nevypadají špatně, ale s žádným si nejsem jistý." — chtěl modernější směry
ukotvené v aktuálních trendech. Rešerše trendů: `docs/design/trends-2026.md`.

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

## 3. Kolo 2 — čtyři moderní směry (2026-07-07)

Mockupy: `docs/design/mockups/smer-4.html` · `smer-5.html` · `smer-6.html` · `smer-7.html`
(stejný formát jako kolo 1: 390 px, Dnes + fragment Historie s heatmapou, bez JS,
vlastní SVG ikony, motion principy v hlavičce souboru).

**Čím se kolo 2 liší od kola 1:** kolo 1 stavělo na *příběhových estetikách* (deník,
přístrojová deska, retro plakát) — každý směr měl silnou tematickou stylizaci. Kolo 2
staví na *aktuálních trendech 2025/26* (rešerše v `trends-2026.md`): žádné retro,
současné vizuální jazyky, které uživatel zná z dnešních kvalitních appek. Habitnaut
metafory (orbita, checkpoint, korekce kurzu, lodní deník) zůstávají, ale nesou je
komponenty, ne kulisa. IA (bod 1) platí beze změny pro všechny směry.

| | **Směr 4 — Sklo nad orbitou** | **Směr 5 — Bento paluba** | **Směr 6 — Tichá orbita** | **Směr 7 — Schéma letu** |
|---|---|---|---|---|
| Trend-základ | Apple Liquid Glass / HIG iOS 26: translucentní vrstvy, plovoucí glass tab bar, velký titulek | bento grid 2026 (výrazné zaoblení, taktilní dlaždice) + calm paleta (Cloud Dancer) | dark-first (OLED čerň) + calm/quiet UI — jen jas, typografie a prázdno | anti-grid brutalismus: raw schematické layouty, „data bez dekorace" |
| Klíčová myšlenka | Habitnaut jako first-party iOS appka — známé, tiché, „patří do telefonu" | den = paluba z modulů; každá dlaždice je přístroj k stisknutí | noční obloha pro večerní check-in; splněné ustupuje do šera, zbývající svítí | letová dokumentace: záznamový arch, číslované sekce, testovací protokol vlastního života |
| Typografie | Figtree (SF-like) | Bricolage Grotesque · Schibsted Grotesk | Marcellus · Hanken Grotesk | Azeret Mono · Archivo |
| Paleta | mlha `#eef0f6`, sklo (bílá .66 + blur), tint `#3d6df6`, sém. zelená/jantar | canvas `#edeae2`, dlaždice `#fbfaf6`, šalvěj/nebe/písek, zeleň `#3e7c4f` | čerň `#000`, text `#ecebe6`, měsíční zlato `#d3b478` | papír `#fafaf6`, čerň `#101010`, signální žluť `#ffd400` |
| Motion | iOS spring, lensing highlight, morph tab pilulky | vyskládání bento, squish press, crossfade stavu | jen jas/průhlednost, rozsvícení hvězdy, žádné bounce | pohyb = informace: hard cut, žlutý přejezd, blikající kurzor |
| Pro | okamžitě působí jako hotový produkt; nulová vizuální únava; PWA na iPhonu splyne se systémem | nejlepší škálování obsahu (statistiky = další dlaždice); hravé ale klidné; skvělé pro widgety | ideální pro hlavní use case (večer, 2 min); nejsilnější atmosféra; OLED baterie | nejosobitější a nejvíc „Michal" (QA protokol); brutálně čitelné; nejlevnější na implementaci (žádné blury/stíny) |
| Proti | nejmíň vlastní identity — „hezký iOS klon"; backdrop-filter má výkonnostní cenu | bento je všude — riziko generičnosti bez disciplíny; hodně dlaždic = drobení pozornosti | light mode by byl druhý projekt; přes den venku hůř čitelné; elegance vyžaduje přesnost v detailu | polarizující — „strohé jako výkaz"; žlutá jako jediná barva unese málo sémantiky; vtip může zevšednět |

## 4. Kolo 3 — tři směry z podstaty návyků (2026-07-11)

Mockupy: `docs/design/mockups/smer-8.html` · `smer-9.html` · `smer-10.html`
(stejný formát: 390 px, Dnes + fragment Historie, bez JS, vlastní SVG, motion v hlavičce).

**Zadání od Michala:** žádný vesmír, žádné QA — metafora má vyrůstat z účelu appky.
Kolo 3 proto staví každý směr na jiném *poctivém mechanismu návyku*: opakování
prošlapává cestu (8), návyk je rytmus a pauza je součást hudby (9), dny se tkají
steh po stehu a jeden vynechaný steh látku netrhá (10). Metafora v každém směru
nese i pravidla kouče (skip nezlomí streak, 2× po sobě = zásah), ne jen dekoraci.

| | **Směr 8 — Stezka** | **Směr 9 — Rytmus** | **Směr 10 — Osnova** |
|---|---|---|---|
| Mechanismus návyku | opakovaný průchod vyšlapává pěšinu; bez chození zarůstá | držet rytmus, ne vyhrávat; pomlka je součást skladby | den = útek provlečený osnovou; jeden volný steh látka unese |
| Vizuální jazyk | české turistické značení: značky bílá-barva-bílá, rozcestníky, vrstevnice; **každý návyk = barva značky** (červená/modrá/zelená, šachy žlutá odbočka) | notace: takt o 7 dobách, noty, pomlka 𝄽 pro skip, metronom, historie = partitura | Anni Albers / Bauhaus tkanina: cívky, tkaný pruh (selvage), historie = kus látky, díra = 2 vynechané stehy |
| Typografie | Zilla Slab · Atkinson Hyperlegible · Chivo Mono | Instrument Serif · Onest · Red Hat Mono | Epilogue · Karla · Sometype Mono |
| Paleta | mapový papír `#f3eedd`, inkoust, značkové červená/modrá/zelená/žlutá | ivory `#f7f4ec`, notová čerň, mosaz `#a97e2c` | len `#efe9dd`, rez `#b6482b`, indigo `#35507c`, okr, mech |
| Skip = | odpočívadlo (přístřešek) — na stezce se odpočívá | pomlka — má vlastní notový znak, skladba nekončí | volný steh — nit položená naplocho, vzor drží |
| Pro | nejosobnější (česká turistika), barva-per-návyk je silný systém, „zarůstání" komunikuje i úpadek | filozoficky nejpřesnější k „kontinuita > výkon"; elegantní, tichý; pomlka je nejlepší UI pro skip | nejhmatatelnější historie („kus látky, cos utkal"); Bauhaus estetika stárne nejpomaleji |
| Proti | ikonografie hodně česká — mimo CZ nečitelná (pro single-user OK); hnědá heatmapa méně „šťavnatá" | notace může být pro nehudebníka cizí; nejméně barevný | tkaní jako téma může působit řemeslně-nostalgicky; selvage pruh chce disciplínu, jinak sklouzne ke kýči |

Pozn. ke jménu: **Habitnaut** unese všechna tři („-naut" = poutník/plavec, nejen kosmo-),
ale u směru 8 by šlo přirozeně přejmenovat později (viz BACKLOG, fáze 4).

## 5. Rozhodnutí (2026-07-11)

**Vítěz: Směr 8 — Stezka.** Michal vybral s tím, že metafora má růstový potenciál:
grafická cestička, avatar postupující o políčko za splněný úkol/streak, místa na trase
(domy, vyhlídky…), ve fázi multi-user potkávání jiných poutníků. Zapsáno v BACKLOG.md
jako budoucí vrstva — mapa v IA se na to připravuje, implementace až po W3.5.

Rozpracování: `docs/design/design-system.md` (tokens, škály, stavy komponent,
stezka-terminologie, dark strategie). Teprve potom přeoblečení UI + e2e (W3.5).

## 6. Kolo 4 — Výprava s maskotem (2026-07-12)

Mockup: `docs/design/mockups/smer-11.html`. Kontext: W3.5 dávky 1–3 (Stezka) už
jsou nasazené, ale Michal po zhlédnutí označil za nejoriginálnější **směr 3** a chtěl
ještě jeden pokus se stejnou odvahou: téma cesty volně, osobitost, cartoon/anime,
maskot ve stylu Kafkanauta (jeho druhá appka — chibi astronaut).

**Směr 11 — „Výprava"**: cel-shade komiks (obrysy 2.5–3 px, ploché barvy, tvrdé
offset stíny, samolepky), maskot **Šlápota** — chibi poutníček s kulichem, batohem
a hůlkou; sourozenec Kafkanauta (stejné proporce a tečkované oči), ale pozemský.
Šlápota mluví za kouče bublinou, check-in = samolepka HOTOVO!, skip = ⛺ TÁBOŘÍME,
odznaky = nášivky, Historie = ilustrovaná cesta s kroky a milníky, po které Šlápota
jde → přímá příprava na Michalův avatar-nápad (BACKLOG). Typografie Baloo 2 + Gantari.

Pro: nejosobitější ze všech 11 (postava = tvář značky, spojení s Kafkanautem do
rodiny appek), avatar-vrstva zdarma, koučovy hlášky dostávají mluvčího.
Proti: nejdražší na implementaci (ilustrace, scény, animace postavy), cartoon může
časem unavit u seriózního nástroje, nejdál od nasazené Stezky (pivot = přepsat
dávky 1–3, cca den práce; alternativa = hybrid: vzít Šlápotu a samolepky do Stezky).

**Čeká na rozhodnutí Michala:** (a) zůstat u Stezky, (b) pivot na Výpravu,
(c) hybrid Stezka + Šlápota (maskot, bublina kouče, samolepky na Stezka podkladu).

### Směr 12 — „Poutník" (dospělá varianta, 2026-07-12)

Mockup: `docs/design/mockups/smer-12.html`. Reakce na zpětnou vazbu ke směru 11:
„vypadá pěkně, ale působí jako aplikace pro děti — udělej pro dospělé."

Stejný koncept (postava, cesta, osobitost), dospělý jazyk: **cestovní deník ×
katalog outdoorové značky × rytina**. Tenká mono-linka 1.5–2.4 px místo komiksového
obrysu, tlumená zemitá paleta (uhel `#26261f`, oliva `#5f6b45`, okr `#b07a3c`,
břidlice, cihlová), literární typografie **Spectral** (+ Albert Sans, Spline Sans
Mono), hodně vzduchu, tenké linky místo karet (ledger s čísly zápisů).

Postava zůstává: **Poutník** — mono-line perokresba s kloboukem, holí a batohem;
ilustrace na okraji stránky (marginálie kouče kurzívou), ne hračka. Check-in =
inkoustové razítko „zapsáno 9.41", skip = „tábor — jde se zítra" (okrové razítko).
**Podpis směru: Historie = výškový profil trasy** (expediční zpráva — křivka 30 dní,
kóty milníků, poutník stojí na dnešku). Odznaky = ražené štočky (ex libris).

Pro: dospělost bez ztráty osobitosti; výškový profil je unikátní vizualizace
(žádný tracker ji nemá); nejblíž „deníkovému" duchu projektu (git/markdown deník).
Proti: postava je decentnější (menší brand-přítomnost než Šlápota); serif +
tenké linky chtějí disciplínu při implementaci; méně hravé mikrointerakce.

Volba se tedy rozšiřuje: (a) Stezka · (b) Výprava (cartoon) · (c) hybrid
Stezka+Šlápota · **(d) Poutník (dospělý)** · (e) hybrid Stezka+Poutník.

## 7. Kolo 5 — tři směry mimo cestu (2026-07-12)

Mockupy: `smer-13.html` · `smer-14.html` · `smer-15.html`. Zadání: „ještě 3 verze,
ať nejsou zaměřeny na poutníka/cestu." Dospělé, odvaha směru 3, každý z jiného
světa — ale všechny nesou pravidla kouče (skip ≠ selhání, jednodenní výpadek
nerozbíjí celek) přímo v mechanice metafory:

| | **Směr 13 — Herbář** | **Směr 14 — Temná komora** | **Směr 15 — Modrotisk** |
|---|---|---|---|
| Mechanismus návyku | návyk se pěstuje — roste každodenní péčí, ne na povel | den se exponuje — film se nestříhá kvůli prázdnému políčku | návyky se stavějí — po vrstvách; dům stojí, i když den nezdíš |
| Vizuální svět | botanická ilustrace 19. stol.: rytina, latinské štítky psacím strojem, číslované desky | analog fotografie: kinofilm s perforací, kontaktní arch, temná komora (nativně dark!) | kyanotypový stavební výkres: pruská modř, kóty, title block, jeřáb |
| Skip = | poupě (rostlina odpočívá, neusychá) | krytka na objektivu (rozhodl ses nefotit) | **technologická přestávka** (beton zraje — pauza je předepsaná) |
| Historie = | herbářová deska s lisovanou rostlinou | kontaktní arch s voskovkovými kroužky | řez stavbou rostoucí zdola (podlaží=týdny, okna=dny) |
| Odznaky = | určovací štítky | zvětšeniny na šňůře s kolíčky | kolaudační razítka |
| Typografie | EB Garamond · Mulish · Courier Prime | Unica One · IBM Plex Sans/Mono | Big Shoulders · Public Sans · Fira Mono |
| Pro | nejorganičtější k „růstu"; krásný, tichý, nadčasový | jediný nativně tmavý = přesně večerní 2min check-in na OLED; nejatmosféričtější | nejlepší metafora pro skip vůbec (tech. přestávka); QA/inženýrské duši blízké bez QA odkazů; „stavím si dům" je silný pocit pokroku |
| Proti | riziko „kytičkové" jemnosti; růst rostliny je pomalý feedback | přes den venku hůř čitelná; tmavá jako jediný režim | modrá monochromatičnost může omrzet; nejtechničtější (nejméně „lidský") |

Stav velkého výběru (kola 1–5, 15 směrů): nasazená je Stezka (W3.5 d.1–3);
kandidáti na pivot/hybrid: Výprava (11), Poutník (12), Herbář (13),
Temná komora (14), Modrotisk (15). Rozhoduje Michal.

## 8. Kolo 6 — dva směry do Michalova vkusu (2026-07-12)

Zpětná vazba po kole 5: „žádná další verze se mi nelíbila; 11/12 super ale pro
děti [11] / pro starší lidi [12]; směr 3 dobrý; směr 4 moderní, ale potřeboval by
opravit." → Vkusový profil: **odvaha a energie (3) + modernost (4)**, žádný cartoon,
žádné heritage/retro rekvizity. Kolo 6 míří přesně do té mezery:

| | **Směr 16 — Forma** | **Směr 17 — Puls** |
|---|---|---|
| Koncept | buduješ formu — moderní athletic brand (Nike Training / Strava) | moderní consumer produkt 2026 (Amie/Family) = „oprava směru 4": modernost s vlastní identitou, žádné sklo/blur |
| Skip = | **recovery den** — v tréninku předepsaný, přetrénování škodí (nejsilnější sportovní mapování pravidla) | klidový den — koule tiše dýchá v jantaru (klid je stav, ne prázdno) |
| Podpis | load-bary; **odznaky = kotouče přibývající na osu činky**; „trenér ladí plán" při 2× | **živá koule dne** (gradient korál→fialová, sytost roste s check-iny); historie = mřížka koulí „měsíc energie" |
| Typografie | Anybody (kondenzovaná italika) · Geist · Geist Mono | Gabarito · Manrope |
| Paleta | grafit #131518 · volt #d8f34f · steel (recovery) · červená | teplý krém · gradient #ff8a5c→#ff5d7e→#8b5cf6 · jantar (klid) |
| Tón | energický, rychlý, „výkonový" vizuál (pozor: metafora loadu se musí hlídat, ať nesklouzne k výkonu nad kontinuitu) | teplý, živý, produktový; nejblíž „reálná appka z App Store 2026" |
| Nativní režim | dark (večerní check-in OK) | light (dark = pozdější varianta) |

Oba směry nesou pravidla kouče (skip ≠ selhání, 2× po sobě = zásah trenéra/kouče)
a žádný nemá maskota, serif ani retro. Ověřeno vizuálně v prohlížeči (opraven
překryv popisků kotoučů v 16 a tvrdá hrana koule v 17).

Užší výběr po 6 kolech (podle Michalových reakcí): **3 · 4→17 · 16** (+ nasazená
Stezka jako současný stav). Rozhoduje Michal.

## 9. Kolo 7 — Expres: z rešerše trendů (2026-07-12)

Mockup: `smer-18.html`. Zadání: „nejdřív zjisti, co je dneska chytlavé/trendy UX,
pak takovou variantu udělej." Rešerše (trends-2026.md + čerstvý web search 7/2026):
nejsilnější živý jazyk je **Material 3 Expressive** (Google 2025/26) — 35 tvarů +
shape-morphing, pružinová fyzika místo časovaných animací, přehnaná typografie,
tonální bloky; podloženo výzkumem („design má vyvolat emoci", expresivní prvky
zrychlují orientaci napříč věkem). Drží i dopamine barvy a kinetické titulky.

**Směr 18 — „Expres"** je vlastní podoba toho jazyka (ne Android klon):
- **Tvar = stav** (podpis): splněno = vroubkovaná sušenka, klid = pilulka,
  vynecháno = kosočtverec, prázdno = tečkovaný kruh. Den se čte podle SILUET,
  ne jen barev → přístupnost zdarma, a check-in je pružinový morph kruh→sušenka.
- **Sušenka dne**: hero tvar se přes den „dopéká" (výseč sytosti roste s check-iny).
- **Kalendář z tvarů**: historie jako mřížka siluet — nejchytlavější prvek.
- Milníky = chips se sušenkou; tonální karty (limetka=done, iris=klid); pill nav.
- Typografie Urbanist 900 (kinetická, těsná) + Lexend; paleta papír/ink/limetka/
  iris/tangerine/červená.

Pro: nejvíc „2026 teď"; jediný směr s výzkumně podloženým jazykem; tvarový systém
je vlastní a obhajitelný (M3E má 35 tvarů, naše mapování stavů je unikátní).
Proti: M3E vlna může za 2–3 roky zestárnout jako každý systémový trend; sušenka
chce kvalitní morph implementaci (flubber/SVG interpolace), jinak ztratí kouzlo.

**Finální kandidáti po 7 kolech (18 směrů): 3 · 16 · 17 · 18** + nasazená Stezka.
