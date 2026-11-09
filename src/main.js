import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

document.documentElement.classList.add('js');

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
});

/* ---------- Hero title split ---------- */
$$('.hero__title .split').forEach((el) => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00a0' : ch;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  });
});

/* ---------- Typewriter (Undertale dialog) ---------- */
function typewrite(el) {
  const text = el.dataset.type || '';
  if (reduced) { el.textContent = text; return; }
  let i = 0;
  el.textContent = '';
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, /[.,]/.test(text[i - 1]) ? 180 : 32);
  };
  tick();
}
$$('.dialog__text').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => typewrite(el) });
});

/* ---------- Intro + reveals ---------- */
if (!reduced) {
  gsap.from('.hero__title .char', { yPercent: 110, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.15 });
  gsap.from('.nav', { y: -40, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.6, clearProps: 'transform,opacity' });

  $$('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  gsap.to('[data-parallax]', {
    yPercent: 30, rotate: 25, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
  gsap.to('.bg__gradient', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
  gsap.to('.hero__title', {
    yPercent: 35, opacity: 0.15, scale: 0.94, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.marquee__track', {
    xPercent: -15, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  $$('.section__title').forEach((t) => {
    gsap.fromTo(t, { letterSpacing: '-0.01em' }, {
      letterSpacing: '0.03em', ease: 'none',
      scrollTrigger: { trigger: t, start: 'top 90%', end: 'top 30%', scrub: true },
    });
  });
} else {
  $$('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
}

/* ---------- Progress bar + nav ---------- */
const progress = $('#progress');
const nav = $('#nav');
let lastY = 0;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    progress.style.transform = `scaleX(${self.progress})`;
    const y = self.scroll();
    nav.classList.toggle('is-hidden', y > 400 && y > lastY);
    lastY = y;
  },
});
const navLinks = $$('.nav__links a');
navLinks.forEach((a) => {
  const sec = $(a.getAttribute('href'));
  if (!sec) return;
  ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: (self) => { if (self.isActive) navLinks.forEach((l) => l.classList.toggle('is-active', l === a)); },
  });
});

/* ---------- Train stops progress ---------- */
const stops = $('#stops');
if (stops) {
  gsap.timeline({ scrollTrigger: { trigger: stops, start: 'top 70%', end: 'bottom 45%', scrub: reduced ? false : 0.6 } })
    .to('#stopsFill', { scaleY: 1, ease: 'none' }, 0)
    .to('#stopsTrain', { top: '100%', ease: 'none' }, 0);
}

/* ---------- Countdown ---------- */
const concert = new Date('2026-11-14T18:30:00+01:00').getTime();
const cd = Object.fromEntries($$('[data-cd]').map((el) => [el.dataset.cd, el]));
const pad = (n) => String(n).padStart(2, '0');
function updateCountdown() {
  let diff = Math.max(0, concert - Date.now());
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4); diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  cd.d.textContent = pad(d); cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Animated <details> ---------- */
$$('details.unwrap').forEach((d) => {
  const summary = $('summary', d);
  const body = $('.unwrap__body', d);
  if (d.open) d.classList.add('is-open');
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (d.classList.contains('is-open')) {
      d.classList.remove('is-open');
      const done = () => { d.open = false; ScrollTrigger.refresh(); };
      if (reduced) done();
      else setTimeout(done, 520);
    } else {
      d.open = true;
      void body.offsetHeight; // commit the closed state so the transition runs
      d.classList.add('is-open');
      setTimeout(() => ScrollTrigger.refresh(), 520);
    }
  });
});

/* ---------- Checklist persistence ---------- */
const STORE = 'utc-checklist';
const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
$$('#checklist input').forEach((cb) => {
  cb.checked = !!saved[cb.dataset.key];
  cb.addEventListener('change', () => {
    saved[cb.dataset.key] = cb.checked;
    localStorage.setItem(STORE, JSON.stringify(saved));
  });
});

/* ---------- Copy link ---------- */
const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('is-on'), 1800);
}
$$('[data-copy]').forEach((el) => {
  el.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(el.dataset.copy); showToast('* Skopiowano link. Napełnia cię to determinacją.'); }
    catch { window.open(el.dataset.copy, '_blank', 'noopener'); }
  });
});

/* ---------- Starfield ---------- */
const canvas = $('#stars');
const ctx = canvas.getContext('2d');
let stars = [];
let W = 0, H = 0, scrollY = 0;
const dpr = Math.min(window.devicePixelRatio || 1, 2);
function resize() {
  W = canvas.width = innerWidth * dpr;
  H = canvas.height = innerHeight * dpr;
  const count = Math.round((innerWidth * innerHeight) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: (Math.random() * 1.3 + 0.3) * dpr,
    z: Math.random() * 0.8 + 0.2,
    tw: Math.random() * Math.PI * 2,
  }));
}
resize();
addEventListener('resize', resize);
addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
function drawStars(t) {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    const y = (((s.y - scrollY * s.z * 0.35 * dpr) % H) + H) % H;
    const a = 0.35 + Math.sin(t * 0.0015 + s.tw) * 0.3 * s.z;
    ctx.beginPath();
    ctx.arc(s.x, y, s.r * s.z, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(214, 200, 255, ${a})`;
    ctx.fill();
  }
  if (!reduced) requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);

/* ---------- Cursor, spotlight, glass lighting, tilt, magnetic ---------- */
if (finePointer) {
  const root = document.documentElement;
  const ring = document.createElement('div');
  ring.className = 'cursor';
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.textContent = '❤';
  document.body.append(ring, dot);

  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const spot = { x: innerWidth / 2, y: innerHeight / 3 };
  const spotTo = { x: spot.x, y: spot.y };

  addEventListener('pointermove', (e) => {
    ringX(e.clientX); ringY(e.clientY); dotX(e.clientX); dotY(e.clientY);
    spotTo.x = e.clientX; spotTo.y = e.clientY;
  });
  gsap.ticker.add(() => {
    spot.x += (spotTo.x - spot.x) * 0.12;
    spot.y += (spotTo.y - spot.y) * 0.12;
    root.style.setProperty('--mx', `${spot.x}px`);
    root.style.setProperty('--my', `${spot.y}px`);
  });

  const hoverables = 'a, button, summary, label, .tilt';
  document.addEventListener('pointerover', (e) => { if (e.target.closest(hoverables)) ring.classList.add('is-hover'); });
  document.addEventListener('pointerout', (e) => { if (e.target.closest(hoverables)) ring.classList.remove('is-hover'); });

  $$('.glass').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${e.clientX - r.left}px`);
      el.style.setProperty('--ly', `${e.clientY - r.top}px`);
    });
  });

  if (!reduced) {
    $$('.tilt').forEach((el) => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 1200 });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const k = Math.min(1, 600 / r.width) * 6;
        rx(-py * k); ry(px * k);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }
}

addEventListener('load', () => ScrollTrigger.refresh());
