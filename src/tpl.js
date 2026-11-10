// Generic build-time HTML helpers. Every repeated UI pattern lives here once.

export const join = (parts, sep = ' · ') => parts.filter(Boolean).join(sep);
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const attr = (name, v) => (v || v === 0 ? ` ${name}="${v}"` : '');
export const cls = (...names) => attr('class', join(names, ' '));
export const each = (xs, fn) => xs.map(fn).join('');

/* ---------- numbers & time ---------- */

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const roman = (n) => ROMAN.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');

const pad = (n) => String(n).padStart(2, '0');
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const addMin = (t, m) => { const x = (toMin(t) + m) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
export const span = (a, b) => (toMin(b) - toMin(a) + 1440) % 1440;
export const dur = (min) => join([Math.floor(min / 60) && `${Math.floor(min / 60)} h`, min % 60 && `${min % 60} min`], ' ');
// Start time of every part plus the final arrival: [at, at + p0, at + p0 + p1, ...].
export const clock = (at, parts) => parts.reduce((ts, p) => [...ts, addMin(ts.at(-1), p.min)], [at]);

/* ---------- icons & badges ---------- */

export const icon = (id, mod = '') => `<svg${cls('ic', mod)} aria-hidden="true"><use href="#i-${id}"/></svg>`;
export const arrow = () => icon('arrow', 'ic--arrow');
export const heart = (mod = '', tag = 'span') => `<${tag}${cls('px-heart', mod)} aria-hidden="true"></${tag}>`;

const badge = (carrier, sm) => `<span${cls('badge', `badge--${carrier.toLowerCase()}`, sm && 'badge--sm')}>${carrier}</span>`;
export const train = (t, { sm = true, named = false } = {}) => {
  const name = named && t.name ? ` <span class="train-id__name">${t.name}</span>` : '';
  return `<span${cls('train-id', sm && 'train-id--sm')}>${badge(t.carrier, sm)}<span class="train-id__no">${t.no}${name}</span></span>`;
};
export const chain = (legs, opts) => `<span class="chain">${legs.map((l) => train(l, opts)).join(arrow())}</span>`;
export const peron = (n, from) => `peron ${from ? `${roman(from)} ${arrow()} ` : ''}${roman(n)}`;

/* ---------- links ---------- */

export const extLink = (href, label, c = '') => `<a${cls(c)} href="${href}" target="_blank" rel="noopener">${label}</a>`;
export const btn = (href, label, primary = false) =>
  primary ? extLink(href, `${label} ${icon('ext')}`, 'btn btn--primary') : extLink(href, label, 'btn');
export const btns = (...b) => `<div class="btns">${b.join('')}</div>`;

const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+').replace(/%2C/g, ',');
export const maps = {
  search: (q) => `https://www.google.com/maps/search/?api=1&query=${enc(q)}`,
  // Path + data form is the only link format that carries a departure time (local time as epoch seconds, subway preferred).
  dir: (a, b, mode, date, time) => {
    const when = `!6e0!7e2!8j${Date.parse(`${date}T${time}:00Z`) / 1000}`;
    const data = mode === 'walking' ? `!4m6!4m5!2m3${when}!3e2` : `!4m7!4m6!2m4!5e1${when}!3e3`;
    return `https://www.google.com/maps/dir/${enc(a)}/${enc(b)}/data=${data}`;
  },
  embed: (a, b, mode) => `https://maps.google.com/maps?saddr=${enc(a)}&daddr=${enc(b)}&dirflg=${mode === 'walking' ? 'w' : 'r'}&output=embed`,
};

// Jakdojade Warsaw route at a given date (YYYY-MM-DD) and time; the page sells the matching ZTM ticket.
export const jakdojade = (a, b, date, time) => {
  const [y, m, d] = date.split('-');
  const pt = (k, p) => `${k}n=${enc(p.stop)}&${k}c=${p.ll.join(':')}&${k}t=LOCATION_TYPE_COORDINATE`;
  return `https://jakdojade.pl/warszawa/trasa/?${pt('f', a)}&${pt('t', b)}&d=${d}.${m}.${y.slice(2)}&h=${time}`;
};

/* ---------- blocks ---------- */

export const dl = (rows, c = '') => `<dl${cls(c)}>${each(rows, ([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`;
export const facts = (rows) => dl(rows, 'facts');
export const list = (items, c = '', tag = 'ul') => `<${tag}${cls(c)}>${each(items, (i) => `<li>${i}</li>`)}</${tag}>`;
export const table = (head, rows) =>
  `<table class="tbl"><thead><tr>${each(head, (h) => `<th>${h}</th>`)}</tr></thead><tbody>${each(rows, (r) => `<tr>${each(r, (c) => `<td>${c}</td>`)}</tr>`)}</tbody></table>`;

export const unwrap = (title, body) =>
  `<details class="unwrap reveal"><summary><span>${title}</span><i></i></summary><div class="unwrap__body"><div>${body}</div></div></details>`;

export const section = ({ id, title }, body) =>
  `<section class="section" id="${id}"><header class="section__head"><h2 class="section__title reveal">${title}</h2></header>${body}</section>`;

export const dialog = (text, { id, mod = '', role = 'note' } = {}) =>
  `<div${cls('dialog', mod)}${attr('id', id)} role="${role}"${role === 'status' ? ' aria-live="polite"' : ''}>${heart('dialog__heart')}<p class="dialog__text" data-type="${text}"></p></div>`;
