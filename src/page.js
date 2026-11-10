// Page composition: turns src/data.js into markup using src/tpl.js helpers.
import { event, sections, places, trains, schedule, meal, legs, ztm, weather, wear, footer } from './data.js';
import {
  join, span, addMin, dur, icon, arrow, heart, badge, train, chain, peron, extLink, btn, btns, maps,
  facts, list, table, unwrap, section, dialog,
} from './tpl.js';

const S = Object.fromEntries(sections.map((s) => [s.id, s]));
const seat = (sep) => `Rząd ${event.row}${sep}${event.seat}`;
const [outA, , outC] = trains.out.stops;

/* ---------- nav / hero / marquee ---------- */

export const nav = () => `
  <header class="nav is-hidden" id="nav">
    <a href="#top" class="nav__logo" aria-label="Na górę">${heart()}<b>Undertale</b></a>
    <nav class="nav__links" aria-label="Sekcje">${sections.filter((s) => s.nav).map((s) => `<a href="#${s.id}">${s.nav}</a>`).join('')}</nav>
    <a class="nav__cta" href="#bilet">${seat(' · ')}</a>
  </header>`;

const countdown = [['d', 'dni'], ['h', 'godz.'], ['m', 'min'], ['s', 'sek']];

const hero = () => `
  <section class="hero">
    <p class="eyebrow reveal">${join([event.org, event.kind])}</p>
    <h1 class="hero__title" aria-label="Undertale"><span class="line"><span class="split accent">${event.name}</span></span></h1>
    <p class="hero__sub reveal">${event.from} ${arrow()} <b>${event.venue}</b> · ${event.day} <b>${event.date}</b> · <b>${event.start}</b></p>
    <div class="countdown reveal" id="countdown" aria-live="polite">${countdown.map(([k, l]) => `<div><b data-cd="${k}">--</b><span>${l}</span></div>`).join('')}</div>
    ${dialog(event.motto, { cls: 'reveal' })}
    <a href="#plan" class="scroll-hint" aria-label="Przewiń do planu"><span></span></a>
  </section>`;

const marqueeItems = [`LEGNICA ${outA.dep}`, `CENTRALNA ${outC.arr}`, 'METRO M1', `ARENA ${event.start}`, `RZĄD ${event.row} · MIEJSCE ${event.seat}`];
const marquee = () => {
  const run = marqueeItems.map((t) => `<span>${t}</span>${heart('', 'i')}`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${run}${run}</div></div>`;
};

/* ---------- plan ---------- */

const tl = ({ times, href, title, lines = [], hot }) => {
  const range = times.length > 1;
  const cls = join(['timeline__item', range && 'timeline__item--range', hot && 'timeline__item--hot', 'reveal'], ' ');
  const t = times.map((x) => `<time>${x}</time>`).join('');
  return `<li class="${cls}">${range ? `<span class="timeline__times">${t}</span>` : t}<a class="glass" href="#${href}"><h3>${title}</h3>${lines.map((l) => `<p>${l}</p>`).join('')}</a></li>`;
};

// A train becomes points (departure, arrival) and ranges (transfers: the window before the next train leaves).
const ride = ({ stops, legs: ls }, href) => stops.map((st, i) => {
  if (i === 0) return { times: [st.dep], href, title: `${st.name} odjazd`, lines: [`${train(ls[0])}, ${peron(st.platform)}`] };
  if (i === stops.length - 1) return { times: [st.arr], href, title: `${st.name} przyjazd`, lines: [peron(st.platform)] };
  return { times: [st.arr, st.dep], href, title: `Przesiadka ${st.loc}`, lines: [`${train(ls[i])}, ${peron(st.platform, st.arrPlatform)}`] };
});

const timeline = [
  ...ride(trains.out, 'wyjazd'),
  { times: [schedule.meal], href: 'jedzenie', title: `Obiad · ${meal.place.name}`, lines: [meal.addr] },
  { times: [schedule.leave], href: legs.arena.id, title: `Metro M1 ${arrow()} Imielin`, lines: ['ze stacji Centrum'] },
  { times: [schedule.arena], href: legs.arena.id, title: places.arena.name },
  { times: [event.start], href: 'bilet', title: 'Koncert', lines: [`Rząd ${event.row}, miejsce ${event.seat}`], hot: true },
  ...ride(trains.back, 'powrot'),
];

const plan = () => section(S.plan, `
  <ol class="timeline">${timeline.map(tl).join('')}</ol>
  ${unwrap('Dlaczego taki rozkład?', list([
    'Liczone od końca: na arenie <b>~30 min</b> przed startem, dojazd z centrum <b>~40 min</b>, obiad <b>~1 h</b>.',
    `Czyli w Warszawie trzeba być ok. <b>16:00</b>. Pociąg o ${outA.dep} przyjeżdża ${outC.arr}.`,
    'Bez wolnego czasu i bez porannej pobudki.',
  ]))}`);

/* ---------- trains ---------- */

const trainCard = (t) => {
  const stops = t.stops.map((s, i) => {
    const stop = `<div><time>${s.arr ?? s.dep}</time><b>${s.name}</b><small>${peron(s.platform, s.arrPlatform)}</small></div>`;
    if (!i) return stop;
    const prev = t.stops[i - 1];
    return `<div class="train__line"><span>${dur(span(prev.dep, s.arr))}</span></div>${stop}`;
  }).join('');
  const total = dur(span(t.stops[0].dep, t.stops.at(-1).arr));
  return `
  <article class="glass card tilt train__card reveal">
    <div class="train__brand">${chain(t.legs, { sm: false, named: true })}</div>
    <div class="train__route train__route--${t.stops.length}">${stops}</div>
    ${facts([['Cena', t.price], ['Czas', total]])}
    ${btns(btn(t.koleo, 'Otwórz w Koleo', true), btn(t.all, 'Wszystkie połączenia'))}
  </article>`;
};

const wyjazd = () => section(S.wyjazd, `
  ${trainCard(trains.out)}
  ${unwrap('Plan B', table(['Odjazd', 'Połączenie', 'Przyjazd'], [[trains.planB.dep, chain(trains.planB.legs, { named: true }), trains.planB.arr]])
    + '<p>Obiad skraca się do ~40 min, ale wciąż zdążysz.</p>')}`);

/* ---------- food ---------- */

const jedzenie = () => section(S.jedzenie, `
  <article class="glass card tilt food reveal">
    <div class="food__main">
      <span class="chip">Wybór</span>
      <h3>${meal.place.name}</h3>
      <p class="food__addr">${join([meal.addr, meal.walk])}</p>
      <p>${meal.about}</p>
      ${facts([['Budżet', meal.budget], meal.hours])}
      ${btns(btn(maps.search(meal.place.q), 'Google Maps', true))}
    </div>
    <div class="food__menu"><h4>Co zamówić</h4>${list(meal.menu.map((m) => join(m)))}</div>
  </article>
  ${unwrap('Alternatywy', list(meal.alternatives.map((a) => join([extLink(maps.search(a.q), `<b>${a.name}</b>`), ...a.info]))))}`);

/* ---------- routes ---------- */

const part = (pt, at) => {
  const metro = pt.type === 'metro';
  const mode = metro ? 'transit' : 'walking';
  const ends = (n, i, a) => (i === 0 || i === a.length - 1 ? ' class="on"' : '');
  const info = metro
    ? `<b>${pt.line} kierunek <u>${pt.dir}</u></b><p>${join([`${pt.min} min`, `co ${pt.every} min`, `${pt.stations.length - 1} przyst.`])}</p>
       <ol class="metro-line" aria-label="Przystanki ${pt.line}">${pt.stations.map((n, i, a) => `<li${ends(n, i, a)}>${n}</li>`).join('')}</ol>`
    : `<b>${pt.from.short} ${arrow()} ${pt.to.short}</b><p>${join(['Pieszo', pt.dist, `${pt.min} min`])}</p>${pt.note ? `<p>${pt.note}</p>` : ''}`;
  return `
    <li class="part">
      <div class="map glass">
        <iframe title="Mapa: ${pt.from.name} do ${pt.to.gen ?? pt.to.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${maps.embed(pt.from.q, pt.to.q, mode)}"></iframe>
        ${extLink(maps.dir(pt.from.q, pt.to.q, mode, event.iso.slice(0, 10), at), `Otwórz ${icon('ext')}`, 'map__open')}
      </div>
      <div class="step step--${pt.type}"><span class="step__icon">${metro ? 'M' : icon('walk')}</span><div><time>${at}</time>${info}</div></div>
    </li>`;
};

const leg = (l, tag) => {
  let at = l.at;
  const parts = l.parts.map((pt) => { const html = part(pt, at); at = addMin(at, pt.min); return html; }).join('');
  const total = l.parts.reduce((m, pt) => m + pt.min, 0);
  return `
  <div class="leg reveal"${l.id ? ` id="${l.id}"` : ''}>
    <div class="leg__head"><span class="leg__tag">${tag}</span><h3>${l.from.short} ${arrow()} ${l.to.short}</h3><span class="leg__time">${total} min</span></div>
    <ol class="parts">${parts}</ol>
  </div>`;
};

const dojazd = () => section(S.dojazd, `
  ${leg(legs.meal, 'A')}
  ${leg(legs.arena, 'B')}
  ${unwrap('Bilet ZTM', table(['Bilet', 'Cena'], ztm.map(([k, v, best]) => (best ? [`<b>${k}</b> ${icon('check', 'ic--ok')}`, `<b>${v}</b>`] : [k, v])))
    + '<p>Weź 2× 75-min: tam i z powrotem. Jakdojade, mobilet lub biletomat. Student −50%.</p>')}
  ${unwrap('Dlaczego metro?', list(['Bez korków, co 5 min.', 'Taksówka: 40–60 zł. Metro: w cenie biletu.']))}`);

/* ---------- wear + ticket ---------- */

const ticket = () => `
  <div class="ticket tilt reveal">
    <div class="ticket__main">
      <p class="eyebrow">${event.org}</p>
      <h3>${event.name}</h3>
      <p>${join([event.venue, event.address])}</p>
      <dl>${[['Data', event.date], ['Start', event.start], ['Rząd', event.row], ['Miejsce', event.seat]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </div>
    <div class="ticket__stub"><span>RZĄD</span><b>${event.row}</b><span>MIEJSCE</span><b>${event.seat}</b>${heart('ticket__heart')}</div>
  </div>`;

const ubior = () => section(S.ubior, `
  <div class="glass card tilt wear reveal">
    <div class="weather">${weather.map(([k, v, mod]) => `<div${mod ? ` class="weather__${mod}"` : ''}><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    ${list(wear.map(([ic, t]) => `${icon(ic)} ${t}`), 'wear__list')}
    <p class="note">Prognoza Open-Meteo dla Ursynowa. Sprawdź dzień wcześniej.</p>
  </div>`);

const bilet = () => section(S.bilet, ticket());

/* ---------- return ---------- */

const powrot = () => section(S.powrot, `${leg(legs.back, 'C')}${trainCard(trains.back)}
  ${unwrap('Po koncercie', list([
    `Koniec ok. <b>20:30</b>, pociąg o <b>${trains.back.stops[0].dep}</b>.`,
    `Kolacja: <b>${meal.alternatives[2].name}</b>, ${meal.alternatives[2].info[0]}, do 23:00.`,
    'Hala Centralnej jest ogrzewana i otwarta całą noc.',
  ]))}`);

/* ---------- checklist ---------- */

const checklist = [
  ['ticket', 'Bilet na koncert'],
  ['id', 'Dowód / legitymacja'],
  ['train1', `Bilet ${chain(trains.out.legs)}`],
  ['train2', `Bilet ${chain(trains.back.legs)}`],
  ['power', 'Powerbank'],
  ['charger', 'Ładowarka'],
  ['umbrella', 'Ciepłe ubrania'],
  ['snack', 'Woda i przekąska'],
];

const checklista = () => section(S.checklista, `
  <ul class="checklist glass reveal" id="checklist">${checklist.map(([k, t]) => `<li><label><input type="checkbox" data-key="${k}" /><span>${t}</span></label></li>`).join('')}</ul>
  ${dialog(event.done, { id: 'endDialog', cls: 'dialog--end', role: 'status' })}`);

/* ---------- page ---------- */

export const main = () => `
  <main id="top">
    ${hero()}${marquee()}${plan()}${wyjazd()}${jedzenie()}${dojazd()}${ubior()}${bilet()}${powrot()}${checklista()}
  </main>`;

export const foot = () => `
  <footer class="footer">
    <p>${footer.note}</p>
    <p class="footer__author">Autor: <b>${footer.author}</b></p>
  </footer>`;

export const blocks = { nav, main, footer: foot };
