# Habit Coach

Osobní systém návyků s AI koučem. Zdroj pravdy žije v gitu (markdown, repo [`selfimprovement`](https://github.com/smike4658/selfimprovement)); klienti (web, Wear OS, Android) jsou tenká rozhraní nad ním.

Design: [docs/2026-07-06-habit-coach-product-design.md](docs/2026-07-06-habit-coach-product-design.md)

## Struktura

```
habit-coach/
├── web/          # Vite + React + TS PWA dashboard
├── mobile/       # (fáze 1b+) Gradle monorepo: :app, :wear, :shared
├── supabase/     # migrace, edge functions (today/checkin/week/sync-*), testy
└── docs/         # design dokument, ADRs, deploy návody
```

## Backend (fáze 1a)

Supabase: Postgres (schéma dle design §3, streak jako view), Edge Functions
`today`, `checkin` (zapisuje DB + zrcadlí commit do `log/`), `week`, `sync-plans`,
`sync-log`. Git zůstává zdrojem pravdy. Nasazení: [docs/deploy-supabase.md](docs/deploy-supabase.md).
Web běží v API módu, když jsou při buildu nastavené `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`;
jinak padá zpět na GitHub PAT mód (fáze W).

## Web dashboard (fáze W)

Dashboard nad repem `selfimprovement` přes GitHub Contents API: dnešní plán z `plans/`, týdenní tabulka, streaky z `log/`. Check-in (✅/❌/➖ + věta dne) zapisuje commitem do `log/YYYY-MM.md`.

```bash
cd web
npm install
npm run dev
```

**Token:** repo `selfimprovement` je private, takže čtení i check-in vyžadují fine-grained PAT (GitHub → Settings → Developer settings → Fine-grained tokens; scope: jen repo `selfimprovement`, permission *Contents: Read and write*). Token se zadává na úvodní obrazovce aplikace a ukládá do `localStorage` v prohlížeči.
