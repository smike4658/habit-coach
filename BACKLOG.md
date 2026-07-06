# Backlog

Nápady mimo aktuální fázi (viz design §8 — scope creep jde sem, ne do sprintu).

## Web
- **UX/design iterace** — současný dashboard je funkční MVP, působí genericky. Až po ~týdnu reálného používání sepsat, co drhne (např. rychlost check-inu, hierarchie informací, prázdné stavy), a udělat cílený redesign. (Michal, 2026-07-06)
- **Rozlišit chyby „soubor chybí" vs. „token nemá přístup k repu"** — GitHub vrací 404 v obou případech; přidat kontrolní dotaz na metadata repa a podle toho zpřesnit hlášku v TokenGate/error stavu. (2026-07-06)
- Zobrazit v UI čas posledního načtení dat.

## Později / fáze 4
- Konfigurovatelné data-repo (jiný uživatel = vlastní repo) — až s multi-user fází.
