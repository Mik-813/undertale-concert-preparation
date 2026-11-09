import { $, $$, reduced } from './dom.js';

export function initAnchors() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const behavior = reduced ? 'auto' : 'smooth';
      if (id === '#top') { e.preventDefault(); window.scrollTo({ top: 0, behavior }); return; }
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior });
    });
  });
}
