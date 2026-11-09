import { $, $$ } from './dom.js';
import { typewrite } from './typewriter.js';

export function initReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      en.target.classList.add('is-in');
      const t = en.target.matches('.dialog__text') ? en.target : $('.dialog__text', en.target);
      if (t && !t.dataset.done) { t.dataset.done = '1'; typewrite(t); }
      io.unobserve(en.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal, .hero__title').forEach((el) => io.observe(el));
}
