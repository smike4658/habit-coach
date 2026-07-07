# Habitnaut — brief pro Claude Design

Podklad k vložení do claude.ai/design (prompt / attachment). Stav k 2026-07-07.

## Produkt

Habitnaut — osobní habit tracker s AI koučem. Data žijí v markdownu v git repu uživatele,
web PWA (React + Tailwind v4), single-user, mobile-first (390px), hlavní use case: večerní
2minutový check-in. Backend Supabase (přihlášení e-mailem).

## Brand

- Název: **Habitnaut** (habit + astronaut). Tagline: „Tvoje denní orbita."
- Metafory: den = oblet (orbita) · check-in = zápis do lodního deníku · streak = stabilní
  orbita · vynechání = korekce kurzu, ne havárie. Decentně — žádný kýčovitý vesmír na pozadí.
- Tón: hravý průzkumník, ne korporát. Kouč = řídicí středisko (parťák).

## Obrazovky (informační architektura)

1. **Dnes** — 3 návyky z plánu, stavy ✅ splněno / ❌ vynecháno / ➖ korekce kurzu (skip),
   detail denního plánu, věta dne (jednořádkový deník). Optimalizace na rychlost odškrtnutí.
2. **Historie** — GitHub-style heatmapa (3 měsíce), statistiky (úspěšnost %, aktuální
   a nejdelší streak per návyk), přepínač na měsíční kalendář s detailem dne.
3. **Návyky** — správa: seznam se streaky, přidat/upravit, archiv; odměnové návyky
   (šachy) vizuálně odlišené — „odměna, ne úkol".
4. **Nastavení** (zatím minimální: odhlášení).
Navigace: bottom nav (mobile-first).

## Koučovací filozofie promítnutá do UI (důležité!)

- Kontinuita > výkon. Streak NESMÍ působit jako křehká věc, kterou jedno vynechání zničí.
- Pravidlo „nikdy 2× po sobě" — dva vynechané dny po sobě = viditelné, ale laskavé varování.
- Skip/➖ je legitimní stav (neplánovaný den), ne selhání.

## Constraints

- Vlastní SVG ikony — ŽÁDNÉ generické sety (lucide/heroicons/font-awesome) ani emoji jako ikony.
- Google Fonts (self-hostovatelné), CSS proměnné jako design tokens.
- Světlý i tmavý režim zvážit (večerní použití!).
- Výstup musí být přenositelný do React + Tailwind v4 komponent.

## Co už existuje (7 zavržených/nerozhodnutých směrů k inspiraci)

docs/design/mockups/smer-1..7.html — kolo 1: Palubní deník (papír+inkoust), Řídicí středisko
(dark mission control), Retro mise (NASA 70s); kolo 2: Sklo nad orbitou (Apple Liquid Glass),
Bento paluba (bento grid), Tichá orbita (OLED quiet UI), Schéma letu (anti-grid brutalismus).
Michal: „nevypadají špatně, ale s žádným si nejsem jistý" — hledá se směr, který sedne.
Rešerše trendů: docs/design/trends-2026.md.

## Zadání pro Claude Design

Navrhni design systém a obrazovky Dnes + Historie pro Habitnaut podle tohoto briefu.
Moderní (trendy 2025/26), osobitý, v souladu s brandem a koučovací filozofií.
