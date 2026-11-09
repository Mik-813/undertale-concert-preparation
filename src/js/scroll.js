import { $, $$, reduced } from './dom.js';
import { buildStars, drawStars } from './stars.js';

export function initScroll() {
  const progress = $('#progress');
  const nav = $('#nav');
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));
  const arcs = $('#arcs');
  const plan = $('#plan');
  let ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-hidden', plan.getBoundingClientRect().bottom > 0);

    const mid = innerHeight / 2;
    let active = -1;
    sections.forEach((s, i) => {
      if (!s) return;
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) active = i;
    });
    navLinks.forEach((l, i) => l.classList.toggle('is-active', i === active));

    if (!reduced) {
      drawStars(y);
      arcs.style.transform = `translate3d(0, ${y * -0.08}px, 0) rotate(${y * 0.02}deg)`;
    } else if (!onFrame.drawn) { drawStars(0); onFrame.drawn = true; }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };

  buildStars();
  onFrame();
  addEventListener('scroll', request, { passive: true });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildStars(); onFrame(); }, 150); });
}
