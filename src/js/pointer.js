import { reduced } from './dom.js';
import { spot, paint } from './stars.js';

export function initPointer() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const light = document.querySelector('.bg__spotlight');
  const glow = { x: innerWidth / 2, y: innerHeight / 3, tx: innerWidth / 2, ty: innerHeight / 3 };
  let px = 0, py = 0, target = null, lit = null, tilted = null, running = false;

  const reset = (el) => { if (el) { el.classList.remove('is-tilting'); el.style.transform = ''; } };
  const unlight = () => { lit?.classList.remove('is-lit'); lit = null; };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  function frame() {
    glow.x += (glow.tx - glow.x) * 0.14;
    glow.y += (glow.ty - glow.y) * 0.14;
    if (light) light.style.transform = `translate3d(${glow.x.toFixed(1)}px, ${glow.y.toFixed(1)}px, 0)`;

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

    if (Math.abs(glow.tx - glow.x) > 0.5 || Math.abs(glow.ty - glow.y) > 0.5) requestAnimationFrame(frame);
    else running = false;
  }

  root.classList.add(fine ? 'is-fine' : 'is-touch');

  if (fine) {
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY; target = e.target;
      glow.tx = px; glow.ty = py;
      root.classList.add('has-pointer');
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      root.classList.remove('has-pointer');
      unlight(); reset(tilted); tilted = null; target = null;
    });
    addEventListener('scroll', () => { target = null; if (lit || tilted) { unlight(); reset(tilted); tilted = null; } }, { passive: true });
    return;
  }

  if (light) light.remove();
  // Touch: the glow lives in the stars canvas (already redrawn on scroll), follows the finger
  // and drifts while scrolling; the last tapped pane stays lit at the tap point.
  spot.on = true; spot.x = glow.x; spot.y = glow.y;
  const draw = (t) => {
    glow.x += (glow.tx - glow.x) * 0.14;
    glow.y += (glow.ty - glow.y) * 0.14;
    spot.x = glow.x; spot.y = glow.y;
    paint(t, reduced ? 0 : scrollY);
    if (Math.abs(glow.tx - glow.x) > 0.5 || Math.abs(glow.ty - glow.y) > 0.5) requestAnimationFrame(draw);
    else running = false;
  };
  const go = () => { if (!running) { running = true; requestAnimationFrame(draw); } };
  addEventListener('pointerdown', (e) => {
    glow.tx = e.clientX; glow.ty = e.clientY; go();
    const g = e.target.closest?.('.glass');
    if (g !== lit) { unlight(); g?.classList.add('is-lit'); lit = g; }
    if (g) {
      const r = g.getBoundingClientRect();
      g.style.setProperty('--lx', `${e.clientX - r.left}px`);
      g.style.setProperty('--ly', `${e.clientY - r.top}px`);
    }
  }, { passive: true });
  addEventListener('pointermove', (e) => { glow.tx = e.clientX; glow.ty = e.clientY; go(); }, { passive: true });
  addEventListener('scroll', () => {
    const k = scrollY / 520;
    glow.tx = innerWidth * (0.5 + 0.32 * Math.sin(k));
    glow.ty = innerHeight * (0.42 + 0.12 * Math.cos(k * 0.7));
    go();
  }, { passive: true });
}
