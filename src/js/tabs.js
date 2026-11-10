import { $, $$, store } from './dom.js';

const KEY = 'utc-restaurant';

// One tab bar drives every restaurant-dependent block on the page ([data-r]).
export function initTabs() {
  const bar = $('[data-tabs]');
  if (!bar) return;
  const tabs = $$('[role="tab"]', bar);
  const ink = $('.tabs__ink', bar);

  const place = (t) => { ink.style.width = `${t.offsetWidth}px`; ink.style.transform = `translateX(${t.offsetLeft}px)`; };

  // Replays the swap animation and skips the reveal-on-scroll for a freshly shown variant.
  const swapIn = (el) => {
    [el, ...$$('.reveal', el)].forEach((x) => x.classList.add('is-in'));
    el.classList.remove('is-swap');
    void el.offsetWidth;
    el.classList.add('is-swap');
  };

  let first = true;
  const select = (key, focus = false) => {
    const tab = tabs.find((t) => t.dataset.key === key) ?? tabs[0];
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('[data-r]').forEach((el) => {
      const on = el.dataset.r === tab.dataset.key;
      if (el.hidden === !on) return;
      el.hidden = !on;
      if (on && !first) swapIn(el);
    });
    place(tab);
    if (focus) tab.focus();
    store.set(KEY, tab.dataset.key);
    first = false;
  };

  document.addEventListener('animationend', (e) => e.target.classList?.remove('is-swap'));
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
