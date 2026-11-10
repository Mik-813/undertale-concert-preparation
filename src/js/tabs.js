import { $, $$, reduced, store } from './dom.js';

const KEY = 'utc-restaurant';

// One tab bar drives every restaurant-dependent block on the page ([data-r]).
export function initTabs() {
  const bar = $('[data-tabs]');
  if (!bar) return;
  const tabs = $$('[role="tab"]', bar);
  const ink = $('.tabs__ink', bar);

  const place = (t) => { ink.style.width = `${t.offsetWidth}px`; ink.style.transform = `translateX(${t.offsetLeft}px)`; };

  const index = (key) => tabs.findIndex((t) => t.dataset.key === key);
  const variants = (key) => $$(`[data-r="${key}"]`);
  const slide = (els, from, to, ms, easing) =>
    Promise.all(els.map((el) => el.animate([from, to], { duration: ms, easing, fill: 'forwards' }).finished.catch(() => {})));

  // Shows `key` everywhere; a fresh variant skips the reveal-on-scroll.
  const show = (key, fresh = true) => $$('[data-r]').forEach((el) => {
    const on = el.dataset.r === key;
    if (on && el.hidden && fresh) [el, ...$$('.reveal', el)].forEach((x) => x.classList.add('is-in'));
    el.hidden = !on;
    if (!on) el.getAnimations().forEach((a) => a.cancel());
  });

  // Old variants slide out fully, then new ones slide in from the tab's side. One swap at a time; only the latest target queues.
  let shown = null;
  let busy = false;
  let queued = null;
  const swap = async (key) => {
    if (busy) { queued = key; return; }
    if (key === shown) return;
    const from = shown;
    shown = key;
    if (from === null || reduced) { show(key, from !== null); return; }
    busy = true;
    const d = Math.sign(index(key) - index(from)) * 24;
    await slide(variants(from), { opacity: 1, translate: '0' }, { opacity: 0, translate: `${-d}px 0` }, 220, 'ease-in');
    show(key);
    const incoming = variants(key);
    await slide(incoming, { opacity: 0, translate: `${d}px 0` }, { opacity: 1, translate: '0' }, 260, 'ease-out');
    incoming.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    busy = false;
    if (queued !== null) { const next = queued; queued = null; swap(next); }
  };

  const select = (key, focus = false) => {
    const tab = tabs.find((t) => t.dataset.key === key) ?? tabs[0];
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    place(tab);
    if (focus) tab.focus();
    store.set(KEY, tab.dataset.key);
    swap(tab.dataset.key);
  };
  bar.addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) select(t.dataset.key); });
  bar.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    select(tabs[(i + step + tabs.length) % tabs.length].dataset.key, true);
  });
  addEventListener('resize', () => place(tabs.find((t) => t.tabIndex === 0)), { passive: true });

  // First paint without the ink sliding in from the left.
  ink.style.transition = 'none';
  select(store.get(KEY, null));
  requestAnimationFrame(() => { ink.style.transition = ''; });
}
