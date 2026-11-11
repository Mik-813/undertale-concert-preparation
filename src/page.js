// Page composition: turns src/data.js into markup using src/tpl.js helpers.
import { event, sections, places, trains, restaurants, route, dinner, evening, back, ztm, stationPhotos, weather, wear, footer, copy, checklist } from './data.js';
import {
  cls, join, each, span, dur, clock, icon, arrow, heart, train, chain, peron, extLink, btn, btns, maps, jakdojade,
  dl, facts, list, table, unwrap, section, dialog,
} from './tpl.js';

const S = Object.fromEntries(sections.map((s) => [s.id, s]));
const seat = (sep) => `Rząd ${event.row}${sep}${event.seat}`;
const date = event.iso.slice(0, 10);
const routes = Object.fromEntries(restaurants.map((r) => [r.key, route(r)]));
const [first] = restaurants;
const sub = (main, small) => `${main}${small ? `<small>${small}</small>` : ''}`;
const ps = (lines) => each(lines, (l) => `<p>${l}</p>`);

// Restaurant-dependent markup: one variant per restaurant, only the selected one is shown (see js/tabs.js).
const variant = (r, html) => html.replace(/^(\s*<[a-z]+)/, `$1 data-r="${r.key}"${r === first ? '' : ' hidden'}`);
// perR(fn, tag = 'div', cls = '') → <tag class="swap cls"> with one variant per restaurant as direct children,
// stacked in one grid cell so js/tabs.js can slide them in and out. fn(r, route) returns the variant's HTML.
const perR = (fn, tag = 'div', cls = '') =>
  `<${tag} class="${cls ? `swap ${cls}` : 'swap'}">${restaurants.map((r) => variant(r, fn(r, routes[r.key]))).join('')}</${tag}>`;

/* ---------- nav / hero / marquee ---------- */

export const nav = () => `
  <header class="nav is-hidden" id="nav">
    <a href="#top" class="nav__logo" aria-label="Na górę">${heart()}<b>Undertale</b></a>
    <nav class="nav__links" aria-label="Sekcje">${each(sections, (s) => `<a href="#${s.id}">${s.nav}</a>`)}</nav>
    <a class="nav__cta" href="#koncert">${seat(' · ')}</a>
  </header>`;

const hero = () => `
  <section class="hero">
    <p class="eyebrow reveal">${join([event.org, event.kind])}</p>
    <h1 class="hero__title" aria-label="Undertale"><span class="line"><span class="split accent">${event.name}</span></span></h1>
    <p class="hero__sub reveal">${event.from} ${arrow()} <b>${event.venue}</b> · ${event.day} <b>${event.date}</b> · <b>${event.start}</b></p>
    <div class="countdown reveal" id="countdown" aria-live="polite">${each(copy.countdown, ([k, l]) => `<div><b data-cd="${k}">--</b><span>${l}</span></div>`)}</div>
    ${dialog(event.motto, { mod: 'reveal' })}
    <a href="#plan" class="scroll-hint" aria-label="Przewiń do planu"><span></span></a>
  </section>`;

const marquee = () => {
  const run = each(copy.marquee, (t) => `<span>${t}</span>${heart('', 'i')}`).repeat(2);
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${run}${run}</div></div>`;
};

/* ---------- plan ---------- */

// Naming rule for every plan point: eyebrow = the action (one fixed word), title = the place, lines = structured data.
const ACT = { dep: 'Odjazd', arr: 'Przyjazd', change: 'Przesiadka', meal: 'Obiad', metro: 'Metro', enter: 'Wejście', show: 'Koncert', dinner: 'Kolacja' };

// Chip with the target section's name; the arrow slides out on hover/focus.
const chip = ({ nav: label }) =>
  `<span class="chip" aria-hidden="true">${label}<span class="chip__more"><span>${arrow()}</span></span></span>`;

// A plan point is an instant (one time) or a range (two times: a transfer window). `sec` owns it; `href` defaults to it.
const planBody = ({ times, act, place, lines = [], sec, href = sec, hot }) => {
  const range = times.length > 1;
  const t = each(times, (x) => `<time>${x}</time>`);
  return `<div class="${join(['timeline__row', range && 'timeline__row--range', hot && 'timeline__row--hot'], ' ')}">${
    range ? `<span class="timeline__times">${t}</span>` : t}<a class="glass" href="#${href}">${chip(S[sec])}<span class="timeline__act">${ACT[act]}</span><h3>${place}</h3>${
    lines.length ? `<p>${each(lines, (l) => `<span>${l}</span>`)}</p>` : ''}</a></div>`;
};
const ITEM = 'timeline__item reveal';
const planItem = (p) => `<li class="${ITEM}">${planBody(p)}</li>`;

// Train stop strategy by position: first departs, last arrives, the rest are transfers.
const STOP = {
  dep: (st, leg) => ({ times: [st.dep], lines: [train(leg), peron(st.platform)] }),
  change: (st, leg) => ({ times: [st.arr, st.dep], lines: [train(leg), peron(st.platform, st.arrPlatform)] }),
  arr: (st) => ({ times: [st.arr] }),
};
const trainPoints = ({ stops, legs }, sec) => stops.map((st, i) => {
  const act = i === 0 ? 'dep' : i === stops.length - 1 ? 'arr' : 'change';
  return { act, sec, place: st.name, ...STOP[act](st, legs[i]) };
});

const cityPoints = (r, { meal, arena }) => {
  const [, metro, , arrive] = clock(arena.at, arena.parts);
  const m1 = arena.parts.find((p) => p.type === 'metro');
  return [
    { times: [clock(meal.at, meal.parts).at(-1)], act: 'meal', sec: 'jedzenie', place: r.place.name, lines: [`ul. ${r.street}`] },
    { times: [metro], act: 'metro', sec: 'koncert', href: arena.id, place: m1.from.name, lines: [`${m1.line} kierunek ${m1.dir}`] },
    { times: [arrive], act: 'enter', sec: 'koncert', href: arena.id, place: places.arena.name },
  ];
};

// Restaurant-dependent points: one <li>, one variant per restaurant inside (see perR).
const cityItems = [0, 1, 2].map((i) => perR((r, rt) => planBody(cityPoints(r, rt)[i]), 'li', ITEM));
const concert = { times: [event.start], act: 'show', sec: 'koncert', place: event.venue, lines: [`Rząd ${event.row}, miejsce ${event.seat}`], hot: true };
const supper = { times: [clock(evening.at, evening.parts).at(-1)], act: 'dinner', sec: 'kolacja', place: dinner.place.name, lines: [`ul. ${dinner.street}`] };

const timeline = () => [
  ...trainPoints(trains.out, 'wyjazd').map(planItem),
  ...cityItems,
  planItem(concert),
  planItem(supper),
  ...trainPoints(trains.back, 'powrot').map(planItem),
].join('');

const plan = () => section(S.plan, `
  <ol class="timeline">${timeline()}</ol>
  ${unwrap('Dlaczego taki rozkład?', list(copy.planWhy))}`);

/* ---------- trains ---------- */

const trainCard = (t) => {
  const stops = t.stops.map((s, i) => {
    const stop = `<div><time>${s.arr ?? s.dep}</time><b>${s.name}</b><small>${peron(s.platform, s.arrPlatform)}</small></div>`;
    return i ? `<div class="train__line"><span>${dur(span(t.stops[i - 1].dep, s.arr))}</span></div>${stop}` : stop;
  }).join('');
  return `
  <article class="glass card tilt train__card reveal">
    <div class="train__brand">${chain(t.legs, { sm: false, named: true })}</div>
    <div class="train__route train__route--${t.stops.length}">${stops}</div>
    ${facts([['Cena', t.price], ['Czas', dur(span(t.stops[0].dep, t.stops.at(-1).arr))]])}
    ${btns(btn(t.koleo, 'Otwórz w Koleo', true), btn(t.all, 'Wszystkie połączenia'))}
  </article>`;
};

const { planB } = trains;
const wyjazd = () => section(S.wyjazd, `
  ${trainCard(trains.out)}
  ${unwrap('Plan B', table(['Odjazd', 'Połączenie', 'Przyjazd'], [[planB.dep, chain(planB.legs, { named: true }), planB.arr]]) + ps([copy.planB]))}`);

/* ---------- food ---------- */

// One card for any meal: name, facts, Google Maps, menu. `access` = the walks that matter for that meal.
const way = (label, { min, dist, station }) => [label, sub(`${min} min`, join([station?.name, dist]))];
const foodCard = (r, access, attrs = '') => `
  <article class="glass card tilt food${r.menu ? '' : ' food--solo'} reveal"${attrs}>
    <div class="food__main">
      <h3>${r.place.name}</h3>
      ${facts([['Adres', `ul. ${r.street}`], ['Sobota', r.hours], ...access])}
      ${btns(btn(maps.search(r.place.q), 'Google Maps', true))}
    </div>
    ${r.menu ? `<div class="food__menu"><h4>Menu</h4>${list(r.menu.map(([d, c]) => `<span>${d}</span><b>${c}</b>`))}</div>` : ''}
  </article>`;

const restaurant = (r) =>
  foodCard(r, [way('Z dworca', r.walk), way('Do metra', r.metro)], ` role="tabpanel" id="food-${r.key}" aria-labelledby="tab-${r.key}"`);

const tab = (r) => {
  const on = r === first;
  return `<button type="button" role="tab" id="tab-${r.key}" aria-controls="food-${r.key}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-key="${r.key}">${r.place.name}</button>`;
};

const tabs = () => `
  <div class="tabs glass reveal" role="tablist" aria-label="Restauracja" data-tabs>
    ${each(restaurants, tab)}
    <i class="tabs__ink" aria-hidden="true"></i>
  </div>`;

const jedzenie = () => section(S.jedzenie, `${tabs()}${perR(restaurant)}${perR((r, rt) => leg(rt.meal))}`);

/* ---------- routes ---------- */

const map = (p, at) => {
  const { from, to } = p;
  return `
      <div class="map">
        <iframe title="Mapa: ${from.name} do ${to.gen ?? to.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${maps.embed(from.q, to.q, 'walking')}"></iframe>
        ${extLink(maps.dir(from.q, to.q, 'walking', date, at), `Otwórz ${icon('ext')}`, 'map__open')}
      </div>`;
};

// A metro stop: the name opens its photos (Wikimedia Commons).
const commons = (f) => `https://commons.wikimedia.org/wiki/${f}`;
const shot = (n, { label, file, by, lic }) => `
  <figure>
    <a href="${commons(`File:${encodeURIComponent(file)}`)}" target="_blank" rel="noopener"><img loading="lazy" decoding="async" src="${commons(`Special:FilePath/${encodeURIComponent(file)}?width=480`)}" alt="${n}: ${label.toLowerCase()}"></a>
    <figcaption><b>${label}</b><small>${join([by, lic])}</small></figcaption>
  </figure>`;
const stop = (n, c) => {
  const photos = stationPhotos[n];
  if (!photos) return `<li${cls(c)}>${n}</li>`;
  return `<li${cls(c)}><button class="stop" type="button" aria-expanded="false">${n}</button>
    <div class="stop__photos"><div>${each(photos, (ph) => shot(n, ph))}</div></div></li>`;
};

// The metro ticket: a link to the ride on Jakdojade at its planned time; details unfold on hover.
const zt = (p, at) => `
      ${extLink(jakdojade(p.from, p.to, date, at), `
        <span class="zt__head"><span class="zt__badge">ZTM</span><b>Bilet ${ztm.fare}</b><span class="zt__price">${ztm.price}</span><span class="zt__go"><span>Kup</span> ${icon('ext')}</span></span>
        <span class="zt__more"><span class="zt__body">
          <span class="zt__ride"><time>${event.day} ${event.date.slice(0, 5)} ${at}</time>${p.from.stop} ${arrow()} ${p.to.stop}<small>${ztm.zone}</small></span>
        </span></span>`, 'zt')}`;

// Part strategy: how each kind of part is drawn.
// Long tails collapse to: next station, gap, terminal.
const tail = (l) => (l.length > 2 ? [l[0], null, l.at(-1)] : l);
const PART = {
  walk: {
    badge: () => icon('walk'),
    media: map,
    info: (p) => `<b>${p.from.name} ${arrow()} ${p.to.name}</b><p>${join(['Pieszo', p.dist])}</p>${p.note ? `<p>${p.note}</p>` : ''}`,
  },
  metro: {
    badge: () => 'M',
    media: (p, at) => {
      const last = p.stations.length - 1;
      const stops = each(p.stations, (n, i) => stop(n, i === 0 || i === last ? 'on' : ''))
        + each(tail(p.beyond ?? []), (n) => (n ? stop(n, 'off') : '<li class="off gap" aria-hidden="true"></li>'));
      return `<ol class="metro-line" aria-label="Przystanki ${p.line}">${stops}</ol>`;
    },
    aside: zt,
    info: (p) => `<b>${p.line} kierunek <u>${p.dir}</u></b><p>${join([`co ${p.every} min`, `${p.stations.length - 1} przyst.`])}</p>`,
  },
};

// A part of the timeline: media | time with the duration rail | label. The last part also carries the arrival.
const label = (type, badge, info) => `<div class="stage__label step step--${type}"><span class="step__icon">${badge}</span><div>${info}</div></div>`;
const when = (at, min) => `<span class="stage__time${min ? '' : ' stage__time--end'}"><time>${at}</time>${min ? `<span class="stage__run">${dur(min)}</span>` : ''}</span>`;
const stage = (p, at, end) => {
  const s = PART[p.type];
  return `
      <li class="stage stage--${p.type}${end ? ' stage--last' : ''}">
        <div class="stage__media">${s.media(p, at)}</div>
        ${when(at, p.min)}
        ${label(p.type, s.badge(), s.info(p))}${s.aside?.(p, at) ?? ''}${end}
      </li>`;
};

const leg = (l) => {
  const at = clock(l.at, l.parts);
  const end = `${when(at.at(-1))}${label('end', heart(), `<b>${l.to.name}</b>`)}`;
  return `
  <div class="leg glass reveal"${l.id ? ` id="${l.id}"` : ''}>
    <ol class="route">${l.parts.map((p, i) => stage(p, at[i], i === l.parts.length - 1 ? end : '')).join('')}
    </ol>
  </div>`;
};

/* ---------- wear / concert / return ---------- */

const ubior = () => section(S.ubior, `
  <div class="glass card tilt wear reveal">
    <div class="weather">${each(weather, ([k, v, mod]) => `<div${mod ? ` class="weather__${mod}"` : ''}><span>${k}</span><b>${v}</b></div>`)}</div>
    ${list(wear.map(([ic, t]) => `${icon(ic)} ${t}`), 'wear__list')}
    <p class="note">${copy.weather}</p>
  </div>`);

const koncert = () => section(S.koncert, `
  ${perR((r, rt) => leg(rt.arena))}
  <div class="ticket tilt reveal">
    <div class="ticket__main">
      <p class="eyebrow">${event.org}</p>
      <h3>${event.name}</h3>
      <p>${join([event.venue, event.address])}</p>
      ${dl([['Data', event.date], ['Start', event.start], ['Rząd', event.row], ['Miejsce', event.seat]])}
    </div>
    <div class="ticket__stub"><span>RZĄD</span><b>${event.row}</b><span>MIEJSCE</span><b>${event.seat}</b>${heart('ticket__heart')}</div>
  </div>`);

const kolacja = () => section(S.kolacja, `${foodCard(dinner, [way('Z metra', dinner.walk), way('Do dworca', dinner.back)])}${leg(evening)}`);

const powrot = () => section(S.powrot, `${leg(back)}${trainCard(trains.back)}`);

/* ---------- checklist ---------- */

const check = ([key, item]) =>
  `<li><label><input type="checkbox" data-key="${key}" /><span>${typeof item === 'string' ? item : `Bilet ${chain(item.legs)}`}</span></label></li>`;

const checklista = () => section(S.checklista, `
  <ul class="checklist glass reveal" id="checklist">${each(checklist, check)}</ul>
  ${dialog(event.done, { id: 'endDialog', mod: 'dialog--end', role: 'status' })}`);

/* ---------- page ---------- */

export const main = () => `
  <main id="top">
    ${[hero, marquee, plan, ubior, wyjazd, jedzenie, koncert, kolacja, powrot, checklista].map((f) => f()).join('')}
  </main>`;

export const foot = () => `
  <footer class="footer">
    <p>${footer.note}</p>
    <p class="footer__author">Autor: <b>${footer.author}</b></p>
  </footer>`;

export const blocks = { nav, main, footer: foot };
