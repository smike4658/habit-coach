# Backlog

Nápady mimo aktuální fázi (viz design §8 — scope creep jde sem, ne do sprintu).

## Web
- **UX/design iterace** — současný dashboard je funkční MVP, působí genericky. Až po ~týdnu reálného používání sepsat, co drhne (např. rychlost check-inu, hierarchie informací, prázdné stavy), a udělat cílený redesign. (Michal, 2026-07-06)
- ~~Rozlišit chyby „soubor chybí" vs. „token nemá přístup k repu"~~ HOTOVO 2026-07-11 (`repoAccessible` v github.ts).
- ~~Zobrazit v UI čas posledního načtení dat.~~ HOTOVO 2026-07-11 (hlavička).
- **Ověřit/založit cron pro sync-log** — check-iny psané koučem přímo do `log/*.md` se do DB dostanou jen během sync-log; bez cronu je API mód neuvidí (streaky/historie by lhaly stejně jako u bugu 2026-07-11). Dashboard → Integrations → Cron, stejně jako sync-plans. (2026-07-11)
- **Web push připomínky** — večerní „v 20:30 bez záznamu → push" (PWA push + Supabase cron + VAPID klíče). Vědomě odloženo jako samostatný infra blok; vyžaduje HTTPS notifikační permission flow na Michalově telefonu. (2026-07-11)
- **Zrcadlení habits tabulky ↔ system/habits.md** (potřebuje formátové rozhodnutí) — W3.4 dávka B přidala CRUD návyků do UI/DB (Edge Function `habits`), ale zápis se nezrcadlí do `system/habits.md` v data repu. Formát seedu v habits.md (dávky, fáze, poznámky koučem) je bohatší než DB sloupce a pravidlo „markdown vyhrává" (design §3) vyžaduje rozhodnutí, jak to sladit — např. zápis do habits.md při každé CRUD operaci, nebo naopak jen jednosměrný import při startu. Do rozhodnutí je DB pro návyky sekundární (seed pochází z habits.md) a Michal návyky v UI edituje s vědomím, že kouč zůstává zdrojem dávek. (2026-07-06)

## Později / fáze 4
- Konfigurovatelné data-repo (jiný uživatel = vlastní repo) — až s multi-user fází.
- ~~Přejmenovat produkt~~ HOTOVO: **Habitnaut** (W3.2), v UI/manifestu od 2026-07-11. Repo/URL zatím zůstává habit-coach — přesun na nové URL řešit až s fází 4.
