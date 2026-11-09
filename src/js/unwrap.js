import { $, $$, reduced } from './dom.js';

export function initUnwrap() {
  $$('details.unwrap').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.unwrap__body', d);
    if (d.open) d.classList.add('is-open');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.classList.contains('is-open')) {
        d.classList.remove('is-open');
        if (reduced) d.open = false;
        else setTimeout(() => { d.open = false; }, 520);
      } else {
        d.open = true;
        void body.offsetHeight; // commit the closed state so the transition runs
        d.classList.add('is-open');
      }
    });
  });
}
