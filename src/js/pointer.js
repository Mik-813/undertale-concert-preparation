import { reduced } from './dom.js';

export function initPointer() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
