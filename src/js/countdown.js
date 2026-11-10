import { $$ } from './dom.js';
import { event } from '../data.js';

const concert = new Date(event.iso).getTime();
const UNITS = [['d', 864e5], ['h', 36e5], ['m', 6e4], ['s', 1e3]];

export function initCountdown() {
  const cells = $$('[data-cd]');
  const update = () => {
    let left = Math.max(0, concert - Date.now());
    const value = Object.fromEntries(UNITS.map(([k, ms]) => { const n = Math.floor(left / ms); left -= n * ms; return [k, n]; }));
    cells.forEach((el) => { el.textContent = String(value[el.dataset.cd]).padStart(2, '0'); });
  };
  update();
  setInterval(() => { if (!document.hidden) update(); }, 1000);
}
