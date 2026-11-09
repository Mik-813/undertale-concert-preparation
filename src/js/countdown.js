import { $$ } from './dom.js';
import { event } from '../data.js';

const concert = new Date(event.iso).getTime();
const pad = (n) => String(n).padStart(2, '0');

export function initCountdown() {
  const cd = Object.fromEntries($$('[data-cd]').map((el) => [el.dataset.cd, el]));
  function updateCountdown() {
    let diff = Math.max(0, concert - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    cd.d.textContent = pad(d); cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(s);
  }
  updateCountdown();
  setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);
}
