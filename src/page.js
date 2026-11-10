// Page composition: turns src/data.js into markup using src/tpl.js helpers.
import { event, sections, places, trains, restaurants, route, back, ztm, weather, wear, footer, copy, checklist } from './data.js';
import {
  join, sum, each, span, dur, clock, icon, arrow, heart, train, chain, peron, extLink, btn, btns, maps,
  dl, facts, list, table, unwrap, section, dialog,
} from './tpl.js';

const S = Object.fromEntries(sections.map((s) => [s.id, s]));
const seat = (sep) => `Rząd ${event.row}${sep}${event.seat}`;
const date = event.iso.slice(0, 10);
const routes = Object.fromEntries(restaurants.map((r) => [r.key, route(r)]));
const [first] = restaurants;
const total = (l) => sum(l.parts.map((p) => p.min));
const sub = (main, small) => `${main}${small ? `<small>${small}</small>` : ''}`;
const ps = (lines) => each(lines, (l) => `<p>${l}</p>`);

// Restaurant-dependent markup: one variant per restaurant, only the selected one is shown (see js/tabs.js).
const variant = (r, html) => html.replace(/^(\s*<[a-z]+)/, `$1 data-r="${r.key}"${r === first ? '' : ' hidden'}`);
const perR = (fn) => restaurants.map((r) => variant(r, fn(r, routes[r.key]))).join('');

/* ---------- nav / hero / marquee ---------- */

export const nav = () => `
  <header class="nav is-hidden" id="nav">
    <a href="#top" class="nav__logo" aria-label="Na górę">${heart()}<b>Undertale</b></a>
    <nav class="nav__links" aria-label="Sekcje">${each(sections, (s) => `<a href="#${s.id}">${s.nav}</a>`)}</nav>
    <a class="nav__cta" href="#bilet">${seat(' · ')}</a>
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
  const run = each(copy.marquee, (t) => `<span>${t}</span>${heart('', 'i')}`);
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${run}${run}</div></div>`;
};

/* ---------- plan ---------- */

// A plan item is an instant (one time) or a range (two times: a transfer window).
const planItem = ({ times, href, title, lines = [], hot }) => {
  const range = times.length > 1;
  const t = each(times, (x) => `<time>${x}</time>`);
  return `<li class="${join(['timeline__item', range && 'timeline__item--range', hot && 'timeline__item--hot', 'reveal'], ' ')}">${
    range ? `<span class="timeline__times">${t}</span>` : t}<a class="glass" href="#${href}"><h3>${title}</h3>${ps(lines)}</a></li>`;
};

const trainPoints = ({ stops, legs }, href) => stops.map((st, i) => {
  if (i === 0) return { times: [st.dep], href, title: `${st.name} odjazd`, lines: [`${train(legs[0])}, ${peron(st.platform)}`] };
  if (i === stops.length - 1) return { times: [st.arr], href, title: `${st.name} przyjazd`, lines: [peron(st.platform)] };
  return { times: [st.arr, st.dep], href, title: `Przesiadka ${st.loc}`, lines: [`${train(legs[i])}, ${peron(st.platform, st.arrPlatform)}`] };
});

const cityPoints = (r, { meal, arena }) => {
  const [leave, metro, , arrive] = clock(arena.at, arena.parts);
  return [
    { times: [clock(meal.at, meal.parts).at(-1)], href: 'jedzenie', title: `Obiad · ${r.place.name}`, lines: [`ul. ${r.street}`] },
    { times: [metro], href: arena.id, title: `Metro M1 ${arrow()} Imielin`, lines: [r.metro.station.name] },
    { times: [arrive], href: arena.id, title: places.arena.name },
  ];
};

const timeline = () => [
  ...trainPoints(trains.out, 'wyjazd').map(planItem),
  ...[0, 1, 2].map((i) => perR((r, rt) => planItem(cityPoints(r, rt)[i]))),
  planItem({ times: [event.start], href: 'bilet', title: 'Koncert', lines: [`Rząd ${event.row}, miejsce ${event.seat}`], hot: true }),
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

const restaurant = (r) => `
  <article class="glass card tilt food${r.menu ? '' : ' food--solo'} reveal" role="tabpanel" id="food-${r.key}" aria-labelledby="tab-${r.key}">
    <div class="food__main">
      <h3>${r.place.name}</h3>
      ${facts([
        ['Adres', `ul. ${r.street}`],
        ['Sobota', r.hours],
        ['Cena', r.price],
        ['Z dworca', sub(`${r.walk.min} min`, r.walk.dist)],
        ['Do metra', sub(`${r.metro.min} min`, join([r.metro.station.short, r.metro.dist]))],
      ])}
      ${btns(btn(maps.search(r.place.q), 'Google Maps', true))}
    </div>
    ${r.menu ? `<div class="food__menu"><h4>Menu</h4>${list(r.menu.map(([d, c]) => `<span>${d}</span><b>${c}</b>`))}</div>` : ''}
  </article>`;

const tab = (r) => {
  const on = r === first;
  return `<button type="button" role="tab" id="tab-${r.key}" aria-controls="food-${r.key}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-key="${r.key}">${r.place.short}</button>`;
};

const tabs = () => `
  <div class="tabs glass reveal" role="tablist" aria-label="Restauracja" data-tabs>
    ${each(restaurants, tab)}
    <i class="tabs__ink" aria-hidden="true"></i>
  </div>`;

const jedzenie = () => section(S.jedzenie, `${tabs()}${perR(restaurant)}`);

/* ---------- routes ---------- */

const map = (p, at) => {
  const { from, to } = p;
  return `
      <div class="map">
        <iframe title="Mapa: ${from.name} do ${to.gen ?? to.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${maps.embed(from.q, to.q, 'walking')}"></iframe>
        ${extLink(maps.dir(from.q, to.q, 'walking', date, at), `Otwórz ${icon('ext')}`, 'map__open')}
      </div>`;
};

// Part strategy: how each kind of part is drawn.
const PART = {
  walk: {
    badge: () => icon('walk'),
    map,
    info: (p) => `<b>${p.from.short} ${arrow()} ${p.to.short}</b><p>${join(['Pieszo', p.dist, `${p.min} min`])}</p>${p.note ? `<p>${p.note}</p>` : ''}`,
  },
  metro: {
    badge: () => 'M',
    map: () => '',
    info: (p) => {
      const last = p.stations.length - 1;
      const stops = each(p.stations, (n, i) => `<li${i === 0 || i === last ? ' class="on"' : ''}>${n}</li>`);
      return `<b>${p.line} kierunek <u>${p.dir}</u></b><p>${join([`${p.min} min`, `co ${p.every} min`, `${last} przyst.`])}</p>
       <ol class="metro-line" aria-label="Przystanki ${p.line}">${stops}</ol>`;
    },
  },
};

const part = (p, at) => {
  const s = PART[p.type];
  return `
    <li class="part part--${p.type} glass">${s.map(p, at)}
      <div class="step step--${p.type}"><span class="step__icon">${s.badge()}</span><div><time>${at}</time>${s.info(p)}</div></div>
    </li>`;
};

const leg = (l, tag) => {
  const at = clock(l.at, l.parts);
  return `
  <div class="leg reveal"${l.id ? ` id="${l.id}"` : ''}>
    <div class="leg__head"><span class="leg__tag">${tag}</span><h3>${l.from.short} ${arrow()} ${l.to.short}</h3><span class="leg__time">${total(l)} min</span></div>
    <ol class="parts">${l.parts.map((p, i) => part(p, at[i])).join('')}</ol>
  </div>`;
};

const ztmRow = ([k, v, best]) => (best ? [`<b>${k}</b> ${icon('check', 'ic--ok')}`, `<b>${v}</b>`] : [k, v]);

const dojazd = () => section(S.dojazd, `
  ${perR((r, rt) => `<div>${leg(rt.meal, 'A')}${leg(rt.arena, 'B')}</div>`)}
  ${unwrap('Bilet ZTM', table(['Bilet', 'Cena'], ztm.map(ztmRow)) + ps([copy.ztm]))}
  ${unwrap('Dlaczego metro?', list(copy.metroWhy))}`);

/* ---------- wear / ticket / return ---------- */

const ubior = () => section(S.ubior, `
  <div class="glass card tilt wear reveal">
    <div class="weather">${each(weather, ([k, v, mod]) => `<div${mod ? ` class="weather__${mod}"` : ''}><span>${k}</span><b>${v}</b></div>`)}</div>
    ${list(wear.map(([ic, t]) => `${icon(ic)} ${t}`), 'wear__list')}
    <p class="note">${copy.weather}</p>
  </div>`);

const bilet = () => section(S.bilet, `
  <div class="ticket tilt reveal">
    <div class="ticket__main">
      <p class="eyebrow">${event.org}</p>
      <h3>${event.name}</h3>
      <p>${join([event.venue, event.address])}</p>
      ${dl([['Data', event.date], ['Start', event.start], ['Rząd', event.row], ['Miejsce', event.seat]])}
    </div>
    <div class="ticket__stub"><span>RZĄD</span><b>${event.row}</b><span>MIEJSCE</span><b>${event.seat}</b>${heart('ticket__heart')}</div>
  </div>`);

const powrot = () => section(S.powrot, `${leg(back, 'C')}${trainCard(trains.back)}
  ${unwrap('Po koncercie', list(copy.after))}`);

/* ---------- checklist ---------- */

const check = ([key, item]) =>
  `<li><label><input type="checkbox" data-key="${key}" /><span>${typeof item === 'string' ? item : `Bilet ${chain(item.legs)}`}</span></label></li>`;

const checklista = () => section(S.checklista, `
  <ul class="checklist glass reveal" id="checklist">${each(checklist, check)}</ul>
  ${dialog(event.done, { id: 'endDialog', mod: 'dialog--end', role: 'status' })}`);

/* ---------- page ---------- */

export const main = () => `
  <main id="top">
    ${[hero, marquee, plan, wyjazd, jedzenie, dojazd, ubior, bilet, powrot, checklista].map((f) => f()).join('')}
  </main>`;

export const foot = () => `
  <footer class="footer">
    <p>${footer.note}</p>
    <p class="footer__author">Autor: <b>${footer.author}</b></p>
  </footer>`;

export const blocks = { nav, main, footer: foot };
