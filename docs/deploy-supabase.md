# Nasazení fáze 1a — Supabase

Jednorázový postup (≈15 minut). Lokální vývoj viz konec souboru.

## 1. Projekt

1. https://supabase.com → New project (org zdarma, region `eu-central-1`), silné DB heslo ulož.
2. V repu: `supabase link --project-ref <ref>` (ref je v URL projektu).

## 2. Schéma + funkce

```bash
supabase db push                 # aplikuje migrations/
supabase secrets set GITHUB_SYNC_TOKEN=github_pat_…   # fine-grained PAT: repo selfimprovement, Contents R/W
supabase secrets set DATA_REPO=smike4658/selfimprovement
supabase functions deploy today checkin week sync-plans sync-log
```

## 3. Uživatel (single-user)

Dashboard → Authentication → Users → Add user (e-mail + heslo). Registrace nech vypnuté
(Authentication → Sign In / Up → Disable new user signups), ať se nikdo cizí nezaregistruje.

## 4. Úvodní data

Jednorázově zavolej `sync-log` a `sync-plans` (import historie z gitu do DB) — nejjednodušeji
z Dashboardu (Edge Functions → invoke) s JWT přihlášeného uživatele, nebo curl:

```bash
curl -X POST https://<ref>.supabase.co/functions/v1/sync-log -H "Authorization: Bearer <user_jwt>"
curl -X POST https://<ref>.supabase.co/functions/v1/sync-plans -H "Authorization: Bearer <user_jwt>"
```

## 5. Cron (mirror plánů)

Dashboard → Integrations → Cron (pg_cron): každý den v 6:00 zavolat funkci `sync-plans`,
v neděli večer navíc `sync-log` (kdyby kouč zapsal check-iny mimo API).
Návod: https://supabase.com/docs/guides/functions/schedule-functions

## 6. Web na API mód

GitHub repo habit-coach → Settings → Secrets and variables → Actions → Variables:

- `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = anon key (Dashboard → Settings → API)

a v `.github/workflows/deploy.yml` přidat do build kroku `env` obě proměnné
(`VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}`, …). Web pak místo PAT obrazovky
ukáže přihlášení e-mailem. Bez proměnných web dál jede v GitHub (PAT) módu — fallback.

## Lokální vývoj

```bash
supabase start            # lokální stack (Docker)
supabase db reset         # migrace + seed
supabase functions serve  # edge functions na :54321
cd web && npm run dev     # web/.env.local s VITE_SUPABASE_URL=http://127.0.0.1:54321 a lokálním anon key
deno test supabase/functions/_shared/          # testy sdílených modulů
psql "$DB_URL" -f supabase/tests/streaks_test.sql   # testy streak view
```
