// Generic build-time HTML helpers. Every repeated UI pattern lives here once.

export const join = (parts, sep = ' · ') => parts.filter(Boolean).join(sep);

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const roman = (n) => ROMAN.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const span = (a, b) => (toMin(b) - toMin(a) + 1440) % 1440;
export const dur = (min) => join([Math.floor(min / 60) && `${Math.floor(min / 60)} h`, min % 60 && `${min % 60} min`], ' ');

export const icon = (id, cls = '') => `<svg class="ic${cls && ` ${cls}`}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
export const arrow = () => icon('arrow', 'ic--arrow');
export const ext = () => icon('ext');
export const heart = (cls = '', tag = 'span') => `<${tag} class="px-heart${cls && ` ${cls}`}" aria-hidden="true"></${tag}>`;

export const badge = (carrier, sm = true) => `<span class="badge badge--${carrier.toLowerCase()}${sm ? ' badge--sm' : ''}">${carrier}</span>`;
export const train = (t, { sm = true, named = false } = {}) => {
  const label = `${t.no}${named && t.name ? ` „${t.name}”` : ''}`;
  return `${badge(t.carrier, sm)} ${sm ? label : `<b>${label}</b>`}`;
};
export const chain = (legs, opts) => legs.map((l) => train(l, opts)).join(` ${arrow()} `);
export const peron = (n) => `peron ${roman(n)}`;

export const extLink = (href, label, cls = '') => `<a${cls && ` class="${cls}"`} href="${href}" target="_blank" rel="noopener">${label}</a>`;
export const btn = (href, label, primary = false) =>
  extLink(href, primary ? `${label} ${ext()}` : label, primary ? 'btn btn--primary' : 'btn');
export const btns = (...b) => `<div class="btns">${b.join('')}</div>`;

const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+').replace(/%2C/g, ',');
export const maps = {
  search: (q) => `https://www.google.com/maps/search/?api=1&query=${enc(q)}`,
  dir: (a, b, mode) => `https://www.google.com/maps/dir/?api=1&origin=${enc(a)}&destination=${enc(b)}&travelmode=${mode}`,
  embed: (a, b, mode) => `https://maps.google.com/maps?saddr=${enc(a)}&daddr=${enc(b)}&dirflg=${mode === 'walking' ? 'w' : 'r'}&output=embed`,
};

export const facts = (rows) => `<dl class="facts">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
export const list = (items, cls = '') => `<ul${cls && ` class="${cls}"`}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const table = (head, rows) =>
  `<table class="tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

export const unwrap = (title, body) =>
  `<details class="unwrap reveal"><summary><span>${title}</span><i></i></summary><div class="unwrap__body"><div>${body}</div></div></details>`;

export const section = ({ id, title }, body) =>
  `<section class="section" id="${id}"><header class="section__head"><h2 class="section__title reveal">${title}</h2></header>${body}</section>`;

export const dialog = (text, { id, cls = '', role = 'note' } = {}) =>
  `<div class="dialog${cls && ` ${cls}`}"${id ? ` id="${id}"` : ''} role="${role}"${role === 'status' ? ' aria-live="polite"' : ''}>${heart('dialog__heart')}<p class="dialog__text" data-type="${text}"></p></div>`;
