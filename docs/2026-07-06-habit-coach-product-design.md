# Habit Coach — produktový design (web + Wear OS + Android)

Datum: 2026-07-06 · Autor: Michal + Claude · Stav: podklad pro implementační vlákno
Pracovní název: **Habit Coach** (název vymyslíme později; repo: `habit-coach`)

## 1. Vize

Osobní systém návyků s AI koučem, kde **zdroj pravdy žije v gitu (markdown)** a klienti (web, hodinky, telefon) jsou tenká rozhraní nad ním. Odlišnost od existujících habit trackerů (Loop, HabitNow, Streaks): žádný z nich nemá (a) data v otevřeném formátu pod kontrolou uživatele, (b) AI kouče, který plány aktivně upravuje podle výsledků, (c) proaktivitu (kouč se ozve sám). Dlouhodobě potenciální produkt pro další uživatele — "git-backed habit system with AI coach".

Uživatel fáze 1: jen Michal (single-user). Multi-user řešit až ve fázi 4+.

## 2. Fázování

| Fáze | Výstup | Odhad |
|---|---|---|
| **W — Web PWA** | Dashboard nad repem `selfimprovement`: dnešní plán, týdenní tabulka, streaky, check-in, news digest. Instalovatelná PWA. | 1–2 večery |
| **1 — Backend + Wear OS** | API vrstva + Wear OS appka: dlaždice s dnešními návyky, odškrtnutí z hodinek, komplikace se streakem. | 2–3 týdny večerů |
| **2 — Android app** | Plnohodnotný klient: plán, deníky, check-in, notifikace, chat s koučem. | +2–3 týdny |
| **3 — Integrace + proaktivní AI** | Health Connect (kroky, tréninky, spánek z OnePlus Watch), proaktivní kouč (push: "3 dny bez čtení, dnes 15 min?"), auto-detekce splnění cvičení z workoutu. | průběžně |
| 4 — Produkt (volitelně) | Multi-user, onboarding, monetizace. | rozhodnout později |

## 3. Architektura

### Rozhodnutí: git zůstává zdrojem pravdy, backend je synchronizační vrstva

Dva klienti nemohou psát přímo do gitu s dobrou UX (latence, konflikty, offline). Proto:

```
[Web PWA]   [Wear OS]   [Android]          [Claude kouč (desktop/routines)]
     \          |          /                        |
      \         |         /                   čte/píše markdown
       └──── Backend API ────┐                      |
             (Supabase)      │   GitHub Action /    |
             Postgres + Edge ├── webhook sync ── [GitHub repo selfimprovement]
             Functions + Auth│   (DB ⇄ markdown)     = zdroj pravdy
             + Realtime      ┘
                  │
             [FCM push]   [Claude API — proaktivní kouč]
```

- **Fáze W nepotřebuje backend**: web čte repo přes GitHub Contents API (raw markdown) a check-in zapisuje commitem přes GitHub API (fine-grained PAT, jen toto repo). Latence ~1 s je pro web OK.
- **Backend (Supabase) přichází ve fázi 1** kvůli hodinkám: offline fronta, okamžitá odezva, push. Sync DB → markdown běží jako Supabase Edge Function / GitHub Action (append check-inů do `log/`, čtení plánů z `plans/`).
- **Pravidlo proti dvojímu zdroji pravdy:** DB drží jen *transakční* data (check-iny, ticky, health eventy) a mirror plánů; *obsah* (plány, kurikula, deníky, review) vzniká v markdownu. Konflikt = markdown vyhrává.

### Datový model (Postgres)

```sql
habits(id, slug, name, emoji, phase, dose_text, frequency_per_week, is_reward, active, created_at)
checkins(id, habit_id, date, status enum('done','skipped','unplanned'), note, source enum('web','wear','android','coach','health'), created_at)
plans(id, week_iso, day_date, items jsonb, generated_by)        -- mirror z plans/*.md
health_events(id, type enum('workout','steps','sleep'), payload jsonb, occurred_at, source)
coach_messages(id, direction enum('to_user','from_user'), body, channel enum('push','chat'), created_at)
```

Streak se počítá odvozeně (view) — nikdy neukládat, ať nejde rozbít.

### API (Edge Functions, REST)

```
GET  /today          → dnešní plán + stav check-inů + streaky
POST /checkin        → {habit_slug, status, note?, source}
GET  /week/{iso}     → týdenní přehled
POST /health-event   → z Health Connect bridge (fáze 3)
POST /coach/nudge    → interní: proaktivní kouč → FCM push
```

Auth fáze 1: Supabase Auth, single user, long-lived session na zařízeních.

## 4. Tech stack

| Vrstva | Volba | Zdůvodnění |
|---|---|---|
| Web PWA | **Vite + React + TS**, Tailwind; GitHub Pages | Michal zná React ekosystém z práce; zero-cost hosting |
| Wear OS | **Kotlin + Compose for Wear OS** + Tiles API + Complications | oficiální cesta; OnePlus Watch 3 = Wear OS 5 |
| Android | **Kotlin + Jetpack Compose**, sdílený modul s Wear (monorepo, Gradle) | sdílení modelu/API klienta mezi wear a phone |
| Backend | **Supabase** (Postgres, Auth, Edge Functions, Realtime, cron) | vibecoding-friendly, free tier na start, škáluje do produktu |
| Push | Firebase Cloud Messaging | standard pro Android/Wear |
| Proaktivní AI | **Claude API** (`claude-sonnet-5` pro nudges — levný a stačí; `claude-fable-5` jen na týdenní hlubší review) volaný ze Supabase cron Edge Function | kouč běží i mimo desktop |
| Health | **Health Connect API** (Android) | OnePlus/OHealth do něj zapisuje; jednotné API na kroky/trénink/spánek |
| CI | GitHub Actions (build, testy — Playwright na web 🙂) | web testy = zároveň Michalův PW trénink |

## 5. Infrastruktura a náklady (může investovat)

| Položka | Cena | Kdy |
|---|---|---|
| GitHub + Pages + Actions | 0 Kč | fáze W |
| Supabase Free tier | 0 Kč (limity bohatě stačí pro single-user) | fáze 1 |
| Supabase Pro (až bude potřeba: zálohy, no-pause) | ~$25/měs ≈ 600 Kč | fáze 3/4 |
| Google Play developer účet (nutný i pro instalaci Wear appky bez kabelu — interní testing track) | $25 jednorázově | fáze 1 |
| Claude API (nudges 4×/den + týdenní review, Sonnet) | odhad $1–3/měs | fáze 3 |
| FCM | 0 Kč | fáze 1 |
| Doména (volitelně, jinak *.github.io / *.supabase.co) | ~300 Kč/rok | kdykoli |

Fáze W a 1 se vejdou do ~600 Kč jednorázově. Průběžné náklady začínají až s fází 3 (~do 100 Kč/měs), Supabase Pro až kdyby free tier nestačil.

## 6. Wear OS appka — detail (fáze 1, klíčová část)

- **Tile (dlaždice)** = hlavní UX: swipe z ciferníku → dnešní 3 návyky s ✅ tlačítky. Jeden tap = check-in (optimistic, offline fronta v Room, sync na API).
- **Komplikace** na ciferník: aktuální streak / kolik zbývá dnes.
- **Appka** (otevřená): týdenní přehled, poznámka hlasem (RecognizerIntent) k check-inu.
- **Notifikace**: bridged z telefonu (fáze 2) nebo přímé FCM; akční tlačítka ✅/⏰ odložit.
- Fáze 3: Health Services — po detekovaném workoutu ≥10 min nabídnout auto-check-in 💪.
- Vývoj: Wear OS emulátor v Android Studiu + reálné testování přes ADB over Wi-Fi na OnePlus Watch 3.

## 7. Proaktivní AI kouč (fáze 3)

- Supabase cron (ráno 7:00, poledne, 17:00, večer 20:30) → Edge Function: stáhne stav dne z DB, zavolá Claude API s kontextem (pravidla z CLAUDE.md: nikdy 2× po sobě, zmenšovat ne rušit, šachy = odměna) → rozhodne, zda poslat push (max 2/den, jinak mlčí).
- Health eventy jako vstup: "dnes 12k kroků a workout 22 min — cvičení počítám, zbývá čtení."
- Eskalace: 2 vynechání po sobě → místo push připraví návrh úpravy dávky do nedělního review.

## 8. Rizika

1. **Meta-práce vytlačí návyky** — stavění appky nesmí nahradit cvičení/čtení. Mitigace: vývoj = ohraničené večerní bloky mimo osobní hodinu návyků; návyky mají přednost.
2. Dva zdroje pravdy — mitigace: pravidlo z §3 (DB jen transakce, markdown vyhrává).
3. Wear OS first-app friction (signing, Play track, baterie u Tiles) — mitigace: začít Tile + jedna akce, nic víc.
4. Health Connect na OnePlus: ověřit, co přesně OHealth do Health Connect zapisuje (fáze 3 spike, 1 večer).
5. Scope creep — každá fáze má definovaný konec (viz §2); nové nápady jdou do BACKLOG.md, ne do sprintu.

## 9. Repo a struktura

Nové repo `habit-coach` (oddělené od `selfimprovement` — kód ≠ data):

```
habit-coach/
├── web/          # Vite+React PWA
├── mobile/       # Gradle monorepo: :app (Android), :wear (Wear OS), :shared (model+API klient)
├── supabase/     # migrace, edge functions, cron
├── docs/         # tento dokument, ADRs
└── .github/workflows/
```

## 10. Pořadí prací pro implementační vlákno

1. **W1:** scaffold `habit-coach`, web PWA čtoucí `selfimprovement` přes GitHub API (read-only dashboard: dnešek, týden, streaky z log/).
2. **W2:** check-in z webu (commit přes fine-grained PAT), PWA manifest, deploy na Pages. → Michal používá z telefonu.
3. **1a:** Supabase projekt, schéma, sync Edge Function (log/ ⇄ checkins), přepnout web na API.
4. **1b:** Wear OS Tile + check-in + offline fronta; Play interní track, instalace na OnePlus Watch 3.
5. **2:** Android app (sdílený modul), notifikace.
6. **3:** Health Connect bridge, proaktivní kouč (Claude API + FCM), auto-check-in cvičení.

## 11. Kickoff prompt pro implementační vlákno

> Buduji produkt Habit Coach podle design dokumentu `docs/plans/2026-07-06-habit-coach-product-design.md` v repu https://github.com/smike4658/selfimprovement — načti ho celý a drž se ho. Začni fází W1 (§10): založ nové repo `habit-coach`, postav web PWA dashboard nad repem `selfimprovement` (GitHub Contents API, read-only: dnešní plán z plans/, streaky z log/). Změny architektury proti dokumentu navrhni nejdřív jako ADR do docs/, neimplementuj je rovnou. Po každém milníku commit + push. Data repo `selfimprovement` needituj — jen čti.
