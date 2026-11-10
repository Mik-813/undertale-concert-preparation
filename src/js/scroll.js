import { $, $$, reduced } from './dom.js';
import { buildStars, drawStars, paint } from './stars.js';

export function initScroll() {
  const progress = $('#progress');
  const nav = $('#nav');
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));
  const plan = $('#plan');
  const hint = $('.scroll-hint');
  let ticking = false, drawn = false, hintGone = null;

  function onFrame(t) {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-hidden', plan.getBoundingClientRect().bottom > 0);
    const gone = y > 8;
    if (hint && gone !== hintGone) hint.classList.toggle('is-gone', (hintGone = gone));

    const mid = innerHeight / 2;
    let active = -1;
    sections.forEach((s, i) => {
      if (!s) return;
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) active = i;
    });
    navLinks.forEach((l, i) => l.classList.toggle('is-active', i === active));

    if (!reduced) paint(t, y);
    else if (!drawn) { drawStars(0); drawn = true; }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };

  buildStars();
  onFrame();
  addEventListener('scroll', request, { passive: true });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildStars(); onFrame(); }, 150); });
}
