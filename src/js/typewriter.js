import { reduced } from './dom.js';

// Every call bumps the run id, so a newer call (or cancel) stops the previous one.
export const cancel = (el) => (el._tw = (el._tw || 0) + 1);

export function typewrite(el) {
  const text = el.dataset.type || '';
  if (reduced) { el.textContent = text; return; }
  let i = 0;
  const run = cancel(el);
  const tick = () => {
    if (run !== el._tw) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, /[.,]/.test(text[i - 1]) ? 180 : 32);
  };
  tick();
}
