import { $, $$, store } from './dom.js';
import { typewrite, cancel } from './typewriter.js';

const KEY = 'utc-checklist';

export function initChecklist() {
  const boxes = $$('#checklist input');
  const end = $('#endDialog');
  const text = $('.dialog__text', end);
  const saved = store.get(KEY, {});

  const sync = () => {
    const done = boxes.every((c) => c.checked);
    if (done === end.classList.contains('is-shown')) return;
    end.classList.toggle('is-shown', done);
    cancel(text);
    if (done) { text.textContent = ''; setTimeout(() => end.classList.contains('is-shown') && typewrite(text), 250); }
  };

  boxes.forEach((cb) => {
    cb.checked = !!saved[cb.dataset.key];
    cb.addEventListener('change', () => { saved[cb.dataset.key] = cb.checked; store.set(KEY, saved); sync(); });
  });
  sync();
}
