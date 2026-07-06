# Fáze W3 — pořádná web aplikace (UX redesign + feature parity)

Stav: schváleno Michalem 2026-07-06 · Předchází fázím 1b (Wear OS) a 2 (Android) — ty jsou POZASTAVENÉ.
Motivace: současný web je funkční MVP, ale působí jako "AI-generated page" (srovnání: HabitBee
vypadá jako reálný produkt). Cíl: vlastní vizuální identita, lepší název, feature parity se
zavedenými trackery.

## Pravidla pro celou fázi

- **Každý krok = samostatné kontextové okno** (nová Claude Code session v repu habit-coach,
  nebo subagent). Kickoff prompt je u každého kroku. Výstupy se commitují — další krok na nich staví.
- **Modely šetřit:** Fable/Opus jen na design direction a architekturu; výzkum a mechanická
  implementace = Sonnet; hromadné čtení/scraping = Haiku subagenti.
- **Nástroje:** context7 MCP (docs knihoven — už nainstalováno), Playwright MCP (ověřování UI
  v prohlížeči), magic MCP / 21st.dev (inspirace komponent), skill `frontend-design` (design
  quality), skill `superpowers` (TDD, plány). Před krokem 3 ověřit, že jsou v session dostupné.
- Datová vrstva a API (Supabase, fáze 1a) se NEMĚNÍ — redesign je čistě klientský; nové featury
  smí přidat Edge Functions/migrace, ale git zůstává zdrojem pravdy (design §3).
- Testy: parsery/adaptery vitest (TDD), UI flow Playwright e2e (zároveň Michalův PW trénink, §4).

## Krok W3.1 — Výzkum konkurence a feature matrix

- **Okno/model:** samostatná session, Sonnet; scraping store listingů přes Haiku subagenty.
- **Vstup:** docs/2026-07-06-market-scan.md (AI koučové už zmapovaní — teď jde o KLASICKÉ trackery).
- **Úkol:** rozebrat zavedené appky: Habitify, Loop Habit Tracker, HabitNow, Streaks (iOS),
  Way of Life, Everyday, HabitKit, Habitica (+ HabitBee jako UX benchmark). Z každé: seznam
  featur, screenshoty/UX vzory, co dělá dojem "reálné appky".
- **Výstup:** `docs/research/2026-07-W3-feature-matrix.md` — tabulka featur × appky + priorizace
  pro nás (P1/P2/vynechat + proč). Kandidáti P1 k ověření: heatmapa historie (GitHub grid),
  statistiky (úspěšnost %, nejdelší streak), správa návyků v UI (CRUD — teď jen v habits.md/seed),
  kalendářní pohled, skip/pauza (dovolená), archiv, dark mode, reorder, poznámky ke dni.
- **Kickoff prompt:**
  > V repu habit-coach přečti docs/plans/2026-07-06-w3-web-redesign-plan.md (krok W3.1)
  > a docs/2026-07-06-market-scan.md. Proveď teardown konkurenčních habit trackerů podle zadání
  > a vytvoř docs/research/2026-07-W3-feature-matrix.md s priorizací. Commit + push.

## Krok W3.2 — Název a značka (s Michalem, levné)

- **Okno/model:** krátká interaktivní session, Sonnet stačí.
- **Úkol:** brainstorm názvů ve stylu "Kafkanaut" (hravé, česko-anglické, zapamatovatelné),
  ověřit kolize (existující appky, domény, GitHub). Vybírá Michal. Poznámka: "Habit Coach"
  koliduje s habitcoach.ai (viz market scan).
- **Výstup:** rozhodnutý název → zápis do BRANDING.md (název, tagline, tón). Přejmenování repa
  až po fázi ověření, ne hned. Maskot/ikona: Michal vygeneruje přes nano banana (low prio,
  neblokuje); do té doby platí stávající ✓ ikona.
- **Kickoff prompt:**
  > V repu habit-coach: krok W3.2 z docs/plans/2026-07-06-w3-web-redesign-plan.md. Navrhni
  > 10 názvů ve stylu "Kafkanaut" (např. Zvykonaut), ověř kolize webovým hledáním, dej mi
  > vybrat, výsledek zapiš do BRANDING.md. Commit + push.

## Krok W3.3 — Design systém a informační architektura

- **Okno/model:** samostatná session, **silný model (Fable/Opus)** — tady se rozhoduje vzhled.
  Skill `frontend-design` povinně; magic MCP na inspiraci; NEPOUŽÍVAT generické ikon sety
  (lucide/heroicons/font-awesome) — vlastní SVG ikony v duchu značky.
- **Vstup:** feature matrix (W3.1), název (W3.2), stávající "ink on paper" směr (může se zahodit
  i rozvinout — rozhodne Michal na 2–3 předložených směrech).
- **Úkol:** (a) informační architektura: obrazovky Dnes / Týden / Historie+Statistiky / Návyky /
  Nastavení, navigace (mobile-first bottom nav?); (b) design tokens (barvy, typografie, spacing,
  motion); (c) komponentní inventář; (d) klikatelný HTML mockup 2–3 vizuálních směrů pro výběr.
- **Výstup:** `docs/design/design-system.md` + `docs/design/mockups/*.html` + rozhodnutý směr.
- **Kickoff prompt:**
  > V repu habit-coach: krok W3.3 z docs/plans/2026-07-06-w3-web-redesign-plan.md. Načti
  > feature matrix a BRANDING.md, použij skill frontend-design. Navrhni IA + design tokens
  > + 3 vizuální směry jako HTML mockupy, předlož Michalovi k výběru, vítězný směr rozpracuj
  > do docs/design/design-system.md. Commit + push po každém milníku.

## Krok W3.4 — Implementace (po dávkách, Sonnet)

- **Okno/model:** 2–4 sessions po dávkách, Sonnet; TDD (superpowers); Playwright MCP na
  vizuální ověření každé dávky; context7 na docs (React, Tailwind v4, supabase-js).
- **Dávky (každá = commit + push + ověření v prohlížeči):**
  1. Design systém do kódu: tokens v index.css, základní komponenty, nová navigace, redesign
     stávajících obrazovek (Dnes, Týden, Login).
  2. P1 featury z matrice — nejspíš: Historie/heatmapa + statistiky (nový endpoint /history
     nebo rozšíření /week), kalendářní pohled.
  3. P1 pokračování: správa návyků v UI (CRUD → habits tabulka + zrcadlení do system/habits.md
     přes sync — pozor na pravidlo "markdown vyhrává"), skip/pauza, archiv.
  4. Polish: dark mode, animace, empty/loading stavy, offline UX, PWA ikony v novém brandu.
- **Kickoff prompt (šablona):**
  > V repu habit-coach: krok W3.4 dávka N z docs/plans/2026-07-06-w3-web-redesign-plan.md.
  > Načti docs/design/design-system.md a feature matrix. Implementuj dávku N s TDD,
  > ověř v prohlížeči (Playwright MCP), commit + push.

## Krok W3.5 — E2E testy + release

- **Okno/model:** Sonnet.
- **Úkol:** Playwright e2e suite (login, check-in flow, týden, historie) v CI (deploy.yml už
  testy spouští — přidat e2e job); finální deploy; týden reálného používání → poznámky do
  BACKLOG.md; teprve pak rozhodnutí o návratu k fázi 1b.
- **Kickoff prompt:**
  > V repu habit-coach: krok W3.5 z docs/plans/2026-07-06-w3-web-redesign-plan.md.
  > Napiš Playwright e2e testy hlavních flow, zapoj do GitHub Actions, ověř zelený deploy.

## Co se NEDĚLÁ v W3

Wear OS, Android, Health Connect, proaktivní kouč (fáze 1b–3 čekají). Multi-user/monetizace (fáze 4).
Přejmenování GitHub repa a Supabase projektu (až se název ověří používáním).
