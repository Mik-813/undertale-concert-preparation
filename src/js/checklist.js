import { $, $$ } from './dom.js';
import { typewrite } from './typewriter.js';

export function initChecklist() {
  const STORE = 'utc-checklist';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { saved = {}; }
  $$('#checklist input').forEach((cb) => {
    cb.checked = !!saved[cb.dataset.key];
    cb.addEventListener('change', () => {
      saved[cb.dataset.key] = cb.checked;
      try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch { /* private mode */ }
      syncEnd();
    });
  });
  function syncEnd() {
    const end = $('#endDialog');
    const done = $$('#checklist input').every((c) => c.checked);
    if (done === end.classList.contains('is-shown')) return;
    end.classList.toggle('is-shown', done);
    const t = $('.dialog__text', end);
    t._tw = (t._tw || 0) + 1;
    if (done) { t.textContent = ''; setTimeout(() => end.classList.contains('is-shown') && typewrite(t), 250); }
  }
  syncEnd();
}
