import { reduced } from './dom.js';

export function typewrite(el) {
  const text = el.dataset.type || '';
  if (reduced) { el.textContent = text; return; }
  let i = 0;
  const run = (el._tw = (el._tw || 0) + 1);
  const tick = () => {
    if (run !== el._tw) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, /[.,]/.test(text[i - 1]) ? 180 : 32);
  };
  tick();
}
