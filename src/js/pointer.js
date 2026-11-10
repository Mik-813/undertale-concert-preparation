import { reduced, loop, light } from './dom.js';

// The background glow eases toward the pointer; `ease()` returns true while it is still moving.
const glow = { x: innerWidth / 2, y: innerHeight / 3, tx: innerWidth / 2, ty: innerHeight / 3 };
const aim = (x, y) => { glow.tx = x; glow.ty = y; };
const ease = () => {
  glow.x += (glow.tx - glow.x) * 0.14;
  glow.y += (glow.ty - glow.y) * 0.14;
  return Math.abs(glow.tx - glow.x) > 0.5 || Math.abs(glow.ty - glow.y) > 0.5;
};

// Only one glass pane is lit at a time.
let lit = null;
const litUp = (el) => { if (el !== lit) { lit?.classList.remove('is-lit'); el?.classList.add('is-lit'); lit = el; } };

export function initPointer() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.documentElement.classList.add(fine ? 'is-fine' : 'is-touch');
  (fine ? initMouse : initTouch)();
}

function initMouse() {
  const root = document.documentElement;
  const spotlight = document.querySelector('.bg__spotlight');
  let px = 0, py = 0, target = null, tilted = null;

  const untilt = () => { if (tilted) { tilted.classList.remove('is-tilting'); tilted.style.transform = ''; tilted = null; } };
  const tilt = (el) => {
    if (el !== tilted) { untilt(); tilted = el; }
    if (!el) return;
    const r = el.getBoundingClientRect();
    const k = Math.min(1, 600 / r.width) * 5;
    const rx = -((py - r.top) / r.height - 0.5) * k;
    const ry = ((px - r.left) / r.width - 0.5) * k;
    el.classList.add('is-tilting');
    el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
  };
  const release = () => { target = null; litUp(null); untilt(); };

  const kick = loop(() => {
    const moving = ease();
    if (spotlight) spotlight.style.transform = `translate3d(${glow.x.toFixed(1)}px, ${glow.y.toFixed(1)}px, 0)`;
    const glass = target?.closest('.glass') ?? null;
    litUp(glass);
    if (glass) light(glass, px, py);
    if (!reduced) tilt(target?.closest('.tilt.is-in') ?? null);
    return moving;
  });

  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY; target = e.target;
    aim(px, py);
    root.classList.add('has-pointer');
    kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { root.classList.remove('has-pointer'); release(); });
  addEventListener('scroll', release, { passive: true });
}

// Touch: no glow; the last tapped pane stays lit at the tap point.
function initTouch() {
  document.querySelector('.bg__spotlight')?.remove();
  addEventListener('pointerdown', (e) => {
    const glass = e.target.closest?.('.glass') ?? null;
    litUp(glass);
    if (glass) light(glass, e.clientX, e.clientY);
  }, { passive: true });
}
