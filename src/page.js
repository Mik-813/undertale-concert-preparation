// Page composition: turns src/data.js into markup using src/tpl.js helpers.
import { event, sections, places, trains, schedule, meal, legs, ztm, weather, wear, footer } from './data.js';
import {
  join, span, dur, icon, arrow, heart, badge, train, chain, peron, extLink, btn, btns, maps,
  facts, list, table, unwrap, section, dialog,
} from './tpl.js';

const S = Object.fromEntries(sections.map((s) => [s.id, s]));
const seat = (sep) => `Rząd ${event.row}${sep}${event.seat}`;
const [outA, outB, outC] = trains.out.stops;
const [backA, backB, backC] = trains.back.stops;

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

const timeline = [
  { times: [outA.dep], href: 'wyjazd', title: `${outA.name} odjazd`, lines: [`${train(trains.out.legs[0])}, ${peron(outA.platform)}`] },
  { times: [outB.arr, outB.dep], href: 'wyjazd', title: 'Przesiadka we Wrocławiu', lines: [`${train(trains.out.legs[1])}, ${peron(outB.platform)}`] },
  { times: [outC.arr], href: 'wyjazd', title: places.centralna.name },
  { times: [schedule.meal], href: 'jedzenie', title: `Obiad · ${meal.place.name}`, lines: [meal.addr] },
  { times: [schedule.leave], href: legs.arena.id, title: `Metro M1 ${arrow()} Imielin`, lines: ['ze stacji Centrum'] },
  { times: [schedule.arena], href: legs.arena.id, title: places.arena.name },
  { times: [event.start], href: 'bilet', title: 'Koncert', lines: [`Rząd ${event.row}, miejsce ${event.seat}`], hot: true },
  {
    times: [backA.dep, backC.arr], href: 'powrot', title: 'Pociąg powrotny',
    lines: [`${chain(trains.back.legs)}, ${peron(backA.platform)}`, `Przesiadka we Wrocławiu ${backB.arr}–${backB.dep}`],
  },
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
    const stop = `<div><time>${s.arr ?? s.dep}</time><b>${s.name}</b><small>${peron(s.platform)}</small></div>`;
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
  ${unwrap('Bilet', list([
    'Kup w Koleo: <b>jeden bilet</b> na oba pociągi.',
    'Student do 26 lat: −51%, ok. 38 zł.',
    'Nie wysiadaj na W-wie Zachodniej.',
  ]))}
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

const step = (s) => {
  if (s.type === 'walk') {
    const title = s.to ? `Pieszo ${join([s.to, s.dist, `${s.min} min`])}` : join(['Pieszo', s.dist, `${s.min} min`]);
    return `<li class="step step--walk"><span class="step__icon">${icon('walk')}</span><div><b>${title}</b>${s.note ? `<p>${s.note}</p>` : ''}</div></li>`;
  }
  const from = s.stations?.[0] ?? s.from;
  const to = s.stations?.at(-1) ?? s.to;
  const stops = s.stations && `${s.stations.length - 1} przyst.`;
  const line = s.stations
    ? `<div class="metro-line" aria-label="Przystanki ${s.line}">${s.stations.map((n, i, a) => `<span${i === 0 || i === a.length - 1 ? ' class="on"' : ''}>${n}</span>`).join('')}</div>`
    : '';
  return `<li class="step step--metro"><span class="step__icon">M</span><div><b>${s.line} kierunek <u>${s.dir}</u> · ${s.min} min</b><p>${from} ${arrow()} ${join([to, stops, `co ${s.every} min`])}</p>${line}</div></li>`;
};

const leg = (l, tag) => `
  <div class="leg reveal"${l.id ? ` id="${l.id}"` : ''}>
    <div class="leg__head"><span class="leg__tag">${tag}</span><h3>${l.from.short} ${arrow()} ${l.to.short}</h3><span class="leg__time">${l.min} min</span></div>
    <div class="leg__body">
      <div class="map glass">
        <iframe title="Mapa: ${l.from.name} do ${l.to.gen ?? l.to.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${maps.embed(l.from.q, l.to.q, l.mode)}"></iframe>
        ${extLink(maps.dir(l.from.q, l.to.q, l.mode), `Otwórz ${icon('ext')}`, 'map__open')}
      </div>
      <ol class="steps">${l.steps.map(step).join('')}</ol>
    </div>
  </div>`;

const dojazd = () => section(S.dojazd, `
  ${leg(legs.meal, 'A')}
  ${leg(legs.arena, 'B')}
  ${unwrap('Bilet ZTM', table(['Bilet', 'Cena'], ztm.map(([k, v, best]) => (best ? [`<b>${k}</b> ${icon('check', 'ic--ok')}`, `<b>${v}</b>`] : [k, v])))
    + '<p>Weź 24h: kupiony ok. 16:00 starczy na powrót. Jakdojade, mobilet lub biletomat. Student −50%.</p>')}
  ${unwrap('Dlaczego metro?', list(['Bez korków, co 5 min.', 'Taksówka: 40–60 zł. Metro: w cenie biletu.']))}`);

/* ---------- wear + ticket ---------- */

const ticket = () => `
  <div class="ticket tilt reveal" id="bilet">
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
  </div>
  ${ticket()}`);

/* ---------- return ---------- */

const powrot = () => section(S.powrot, `${leg(legs.back, 'C')}${trainCard(trains.back)}`);

/* ---------- checklist ---------- */

const checklist = [
  ['ticket', 'Bilet na koncert'],
  ['train1', `Bilet ${chain(trains.out.legs)}`],
  ['train2', `Bilet ${chain(trains.back.legs)}`],
  ['id', 'Dowód / legitymacja'],
  ['ztm', 'Bilet ZTM 24h'],
  ['power', 'Powerbank'],
  ['umbrella', 'Czapka i rękawiczki'],
  ['snack', 'Woda i przekąska'],
];

const checklista = () => section(S.checklista, `
  <ul class="checklist glass reveal" id="checklist">${checklist.map(([k, t]) => `<li><label><input type="checkbox" data-key="${k}" /><span>${t}</span></label></li>`).join('')}</ul>
  ${dialog(event.motto, { id: 'endDialog', cls: 'dialog--end', role: 'status' })}`);

/* ---------- page ---------- */

export const main = () => `
  <main id="top">
    ${hero()}${marquee()}${plan()}${wyjazd()}${jedzenie()}${dojazd()}${ubior()}${powrot()}${checklista()}
  </main>`;

export const foot = () => `
  <footer class="footer">
    <p>${footer.note}</p>
    <p class="footer__author">Autor: <b>${footer.author}</b></p>
  </footer>`;

export const blocks = { nav, main, footer: foot };
