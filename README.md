# Undertale Concert Preparation

Landing page z planem wyjazdu **Legnica → Warszawa** na koncert *Undertale* (GraMuzyka) w Arenie Ursynów, **14.11.2026, 18:30**.

**https://mik-813.github.io/undertale-concert-preparation/**

## Co jest w środku
- Pociąg 10:24 IC 8314 „Matejko” → IC 6126 „Leśmian” (bezpośredni link do połączenia w Koleo), plan B
- Obiad: Bar Mleczny Bambino (Hoża 19) + tańsze alternatywy
- Trasy na Google Maps z dokładnym opisem transportu (pieszo, metro M1)
- Pogoda i ubiór, checklista (zapisywana w localStorage)
- Powrót nocnym IC 16170 „Karkonosze”

## Stack
Vite, vanilla JS/CSS (bez zależności runtime). Deploy: GitHub Actions do GitHub Pages.

## Struktura
- `src/data.js` – jedyne źródło faktów (pociągi, perony, godziny, miejsca, trasy, pogoda). Zmiana planu = edycja tylko tego pliku.
- `src/tpl.js` – generyczne helpery HTML (`badge`, `arrow`, `unwrap`, `section`, `facts`, `table`, linki Google Maps, cyfry rzymskie, czasy przejazdu).
- `src/page.js` – składa sekcje z danych; Vite wstawia je w `index.html` w miejsce `<!-- @nav -->`, `<!-- @main -->`, `<!-- @footer -->` podczas builda (statyczny HTML, zero JS do renderowania).
- `src/css/` – `tokens` (kolory, easing), `base`, `hero`, `components`, `sections`, `motion`; `src/style.css` tylko je importuje.
- `src/js/` – jeden moduł na zachowanie (`anchors`, `reveal`, `typewriter`, `countdown`, `unwrap`, `checklist`, `stars`, `scroll`, `pointer`); `src/main.js` je inicjuje.

```bash
npm install
npm run dev
npm run build
```

Nieoficjalna strona fanowska, niezwiązana z GraMuzyka ani Toby Foxem.
