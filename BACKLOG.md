# Backlog

Nápady mimo aktuální fázi (viz design §8 — scope creep jde sem, ne do sprintu).

## Web
- **UX/design iterace** — současný dashboard je funkční MVP, působí genericky. Až po ~týdnu reálného používání sepsat, co drhne (např. rychlost check-inu, hierarchie informací, prázdné stavy), a udělat cílený redesign. (Michal, 2026-07-06)
- **Rozlišit chyby „soubor chybí" vs. „token nemá přístup k repu"** — GitHub vrací 404 v obou případech; přidat kontrolní dotaz na metadata repa a podle toho zpřesnit hlášku v TokenGate/error stavu. (2026-07-06)
- Zobrazit v UI čas posledního načtení dat.
- **Zrcadlení habits tabulky ↔ system/habits.md** (potřebuje formátové rozhodnutí) — W3.4 dávka B přidala CRUD návyků do UI/DB (Edge Function `habits`), ale zápis se nezrcadlí do `system/habits.md` v data repu. Formát seedu v habits.md (dávky, fáze, poznámky koučem) je bohatší než DB sloupce a pravidlo „markdown vyhrává" (design §3) vyžaduje rozhodnutí, jak to sladit — např. zápis do habits.md při každé CRUD operaci, nebo naopak jen jednosměrný import při startu. Do rozhodnutí je DB pro návyky sekundární (seed pochází z habits.md) a Michal návyky v UI edituje s vědomím, že kouč zůstává zdrojem dávek. (2026-07-06)

## Později / fáze 4
- Konfigurovatelné data-repo (jiný uživatel = vlastní repo) — až s multi-user fází.
- **Přejmenovat produkt** — „Habit Coach" koliduje s existujícím habitcoach.ai ($9–149/měs, proaktivní AI kouč). Viz docs/2026-07-06-market-scan.md. (2026-07-06)
