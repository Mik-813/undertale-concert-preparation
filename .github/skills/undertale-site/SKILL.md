---
name: undertale-site
description: "Working on the undertale-concert-preparation landing page (Vite, vanilla JS/CSS, GitHub Pages). Use for any change to this repo's content, plan, trains, restaurants, routes, checklist, styles or effects, and for verifying and deploying it. Triggers: undertale site, concert plan page, plan/ubiór/wyjazd/obiad/koncert/powrót/checklista section, mik-813.github.io/undertale-concert-preparation."
---

# Undertale concert site

A one-page plan, written in Polish, for the trip from Legnica to Warsaw: UNDERTALE concert, sob. 14.11.2026, 18:30, Arena Ursynów, row 19, seat 31.
Live at https://mik-813.github.io/undertale-concert-preparation/.

## Architecture

| File | Role |
|---|---|
| `src/data.js` | **The single source of truth.** It holds every fact, time, price, place, train, restaurant, checklist item and piece of copy. It also holds the part factories (`walk()`, `metro()`), the restaurant `route(r)` strategy and the `back` itinerary. |
| `src/tpl.js` | Pure string helpers: `cls`, `each`, `join`, `roman`, `clock`/`addMin`/`span`/`dur`, `icon`/`arrow`/`heart`, `train`/`chain`/`peron`, `btn`/`btns`/`extLink`, `maps`, `dl`/`facts`/`list`/`table`, `unwrap`, `section`, `dialog`. |
| `src/page.js` | Composes the sections from data and tpl. It uses a `PART` strategy map (walk or metro renderer) and `variant()`, which sets `data-r` and `hidden` for each restaurant. It exports `blocks = { nav, main, footer }`. |
| `vite.config.js` | At build time it replaces `<!-- @name -->` in `index.html` with `blocks[name]()`, so the deployed HTML is fully static. |
| `src/js/*.js` | Progressive enhancement only, one `initX()` per file, wired in `src/main.js`:<br>- `dom.js` has `$`, `$$`, `store`, `loop` (one rAF loop per caller) and `light`.<br>- `pointer.js` handles the spotlight, the glass glow, tilt and touch.<br>- `stars.js` draws the canvas stars and the pre-rasterised arcs.<br>- `scroll.js` handles progress, the nav visibility and the active link.<br>- The rest cover tabs, unwrap, reveal, typewriter, checklist, countdown and anchors. |
| `src/css/` | `tokens` (colours, fonts, pixel hearts), `base` (layout, nav, `.glass`, `[hidden]`), `components` (unwrap, table, badge, btn, facts, card), `sections` (each section in page order), `hero`, `motion` (reveal, reduced motion). Prettier with print width 120. |

How to make changes:

- **Content changes go in `data.js`.** Never hardcode facts or copy in page.js.
- **New markup** goes in page.js, built from tpl helpers. If a pattern appears twice, make it a helper or a component.
- **Times are derived where possible:** `clock(at, parts)` and `span()`. Keep the plan and the routes consistent with the data.

## User rules (non-negotiable)

**Content and copy**

- The site is in Polish. Use minimal text that suits an ADHD reader: short labels, no puns, nothing obvious or redundant.
- Show data as structured pieces with sensible styles, not colloquial sentences. Write "ul. Hoża 19" with a separate distance and time, not "ul. Hoża 19 · 17 min pieszo od…".
- The user doesn't drink, so never suggest bars for alcohol.
- The footer reads `Autor: Mykyta Mykulskyi`, with no "·" separators and no timetable disclaimer.

**Plan logic**

- A plan point is an **instant**: an important event at a given time.
- A **range** (two dots joined by a line) is used only when the end time matters, currently train transfers. Meals and the concert end are not ranges.
- Split journeys into their stops.
- Plan items link to their sections, with a smooth scroll.

**Visual style**

- No emojis. Use the SVG `arrow()` and never "+", "→" or "›".
- Trains always use the styled IC/KD badges (`train()`), never plain "IC"/"KD" text.
- Write platforms in Roman numerals (`roman()`, `peron()`).
- Numbering is consistent everywhere: Roman numerals.
- Accents are purple (`--violet*`), including hover underlines, lines and title rules. There is no blue.
- Hearts are pixelated SVGs (`--px-heart`). Grey hearts are upside down, like monster souls.
- Title underlines are sized to the title width.
- The header is hidden at the top and over the plan, and appears below it.

**Maps**

- Google Maps links carry the planned departure time, not "Leave now".
- Never use Google Maps for metro parts. Metro is its own subsection with a **vertical** list of stops.

**Interaction and performance**

- Primary buttons hover by fading an `::before` overlay (`overflow: hidden`). Never transition gradients directly.
- Effects must also work on phones, and they must stay smooth in Firefox mobile:
  - No full-viewport rotating SVG; the arcs live in the canvas.
  - No per-frame `backdrop-filter` changes.
  - Pointer work runs in a single rAF loop.

**Code**

- DRY and elegant: one component per concept, and strategy maps instead of conditionals.

## Workflow for every round of feedback

1. Read the request. Take it literally and do all of it.
2. Edit `data.js` first, then `page.js`/`tpl.js`, then the CSS in its matching group.
3. Build with `npx vite build`, then run `npx vite preview --port 4190 --strictPort` as an **async** command.
4. Verify:
   - `node .github/skills/undertale-site/scripts/check.mjs 4190 --shots /tmp/shots` checks the nav, anchors, tabs, alignment, checklist, tilt/spotlight and touch, and reports errors at desktop and phone size.
   - Look at the screenshots for anything visual.
   - For pure refactors, build HEAD into a worktree and run `scripts/styles-diff.mjs <headPort> 4190`. It must report 0 diffs.
     ```sh
     git worktree add /tmp/headwt HEAD && ln -s "$PWD/node_modules" /tmp/headwt/
     (cd /tmp/headwt && npx vite build --outDir /tmp/headdist)
     npx vite preview --port 4191 --strictPort --outDir /tmp/headdist
     ```
5. Stop your preview servers **by PID**, and remove `/tmp/headwt` (`git worktree remove`) and `/tmp/headdist`.
6. Commit with a short imperative message and the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`.
7. Run `.github/skills/undertale-site/scripts/deploy.sh`. It pushes, watches the Pages run and checks that the live asset hashes match `dist/`. If the workflow fails, run `gh run rerun <id>`.

Script setup, once per machine:

```sh
npm i --prefix ~/.cache/undertale-pw playwright-core
```

Chromium is `/usr/bin/chromium`. Override the paths with `PW_DIR` and `CHROMIUM`.

## Safety

- Kill processes only by numeric PID, never with `pkill` or `killall`.
- Don't touch servers you didn't start. Port 5173 is the user's dev server.
- Never modify `/home/mik/Projects/walksee/beta.walksee.pl`.
- Train times, restaurant hours and ZTM prices are facts. Verify them on Koleo, the restaurant's page or Google, or ZTM before changing them, and say what you verified.
