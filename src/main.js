const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

document.documentElement.classList.add('js');

/* ---------- Anchors ---------- */
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

/* ---------- Typewriter ---------- */
function typewrite(el) {
  const text = el.dataset.type || '';
  if (reduced) { el.textContent = text; return; }
  let i = 0;
  const run = (el._tw = (el._tw || 0) + 1);
  const tick = () => {
    if (run !== el._tw) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, /[.,]/.test(text[i - 1]) ? 180 : 32);
  };
  tick();
}

/* ---------- Reveals (single observer) ---------- */
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
setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);

/* ---------- Animated <details> ---------- */
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

/* ---------- Checklist persistence ---------- */
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

/* ---------- Starfield: pre-rendered once, moved on scroll ---------- */
const canvas = $('#stars');
const ctx = canvas.getContext('2d');
const layers = [];
let W = 0, H = 0;
function buildStars() {
  W = innerWidth; H = innerHeight;
  canvas.width = W; canvas.height = H;
  layers.length = 0;
  const count = Math.round((W * H) / 16000);
  for (const z of [0.25, 0.5, 0.9]) {
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const c = off.getContext('2d');
    c.fillStyle = `rgba(214, 200, 255, ${0.35 + z * 0.4})`;
    for (let i = 0; i < count / 3; i++) {
      const r = (Math.random() * 1.1 + 0.4) * (0.6 + z * 0.6);
      c.fillRect(Math.random() * W, Math.random() * H, r, r);
    }
    layers.push({ off, z });
  }
}
function drawStars(y) {
  ctx.clearRect(0, 0, W, H);
  for (const { off, z } of layers) {
    const dy = ((-(y * z * 0.3)) % H + H) % H;
    ctx.drawImage(off, 0, dy - H);
    ctx.drawImage(off, 0, dy);
  }
}

/* ---------- Scroll: progress, nav, active link, stops rail ---------- */
const progress = $('#progress');
const nav = $('#nav');
const navLinks = $$('.nav__links a');
const sections = navLinks.map((a) => $(a.getAttribute('href')));
const stops = $('#stops');
const stopsFill = $('#stopsFill');
const stopsTrain = $('#stopsTrain');
const arcs = $('#arcs');
let lastY = 0;
let ticking = false;

function onFrame() {
  ticking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('is-hidden', y > 400 && y > lastY);
  lastY = y;

  const mid = innerHeight / 2;
  let active = -1;
  sections.forEach((s, i) => {
    if (!s) return;
    const r = s.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) active = i;
  });
  navLinks.forEach((l, i) => l.classList.toggle('is-active', i === active));

  if (stops) {
    const r = stops.getBoundingClientRect();
    const start = innerHeight * 0.7, end = innerHeight * 0.45;
    const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
    stopsFill.style.transform = `scaleY(${p})`;
    stopsTrain.style.top = `${p * 100}%`;
  }

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

/* ---------- Pointer: spotlight, glass light, tilt (one listener, one rAF) ---------- */
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const root = document.documentElement;
  const spot = { x: innerWidth / 2, y: innerHeight / 3, tx: innerWidth / 2, ty: innerHeight / 3 };
  let px = 0, py = 0, target = null, lit = null, tilted = null, running = false;

  const reset = (el) => { if (el) { el.classList.remove('is-tilting'); el.style.transform = ''; } };

  function frame() {
    spot.x += (spot.tx - spot.x) * 0.14;
    spot.y += (spot.ty - spot.y) * 0.14;
    root.style.setProperty('--mx', `${spot.x.toFixed(1)}px`);
    root.style.setProperty('--my', `${spot.y.toFixed(1)}px`);

    const glass = target && target.closest('.glass');
    if (glass !== lit) { lit?.classList.remove('is-lit'); glass?.classList.add('is-lit'); lit = glass; }
    if (glass) {
      const r = glass.getBoundingClientRect();
      glass.style.setProperty('--lx', `${px - r.left}px`);
      glass.style.setProperty('--ly', `${py - r.top}px`);
    }

    if (!reduced) {
      const t = target && target.closest('.tilt.is-in');
      if (t !== tilted) { reset(tilted); tilted = t; }
      if (t) {
        const r = t.getBoundingClientRect();
        const k = Math.min(1, 600 / r.width) * 5;
        const rx = -((py - r.top) / r.height - 0.5) * k;
        const ry = ((px - r.left) / r.width - 0.5) * k;
        t.classList.add('is-tilting');
        t.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      }
    }

    if (Math.abs(spot.tx - spot.x) > 0.5 || Math.abs(spot.ty - spot.y) > 0.5) requestAnimationFrame(frame);
    else running = false;
  }

  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY; target = e.target;
    spot.tx = px; spot.ty = py;
    root.classList.add('has-pointer');
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    root.classList.remove('has-pointer');
    lit?.classList.remove('is-lit'); lit = null;
    reset(tilted); tilted = null; target = null;
  });
  addEventListener('scroll', () => { target = null; if (lit || tilted) { lit?.classList.remove('is-lit'); lit = null; reset(tilted); tilted = null; } }, { passive: true });
}
