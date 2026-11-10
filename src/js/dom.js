export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// localStorage that never throws (private mode, quota, corrupt JSON).
export const store = {
  get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
};

// One rAF loop per caller: `fn` returns true to keep running.
export const loop = (fn) => {
  let running = false;
  const step = (t) => { running = fn(t); if (running) requestAnimationFrame(step); };
  return () => { if (!running) { running = true; requestAnimationFrame(step); } };
};

// Moves the glass highlight of `el` to viewport point (x, y).
export const light = (el, x, y) => {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--lx', `${x - r.left}px`);
  el.style.setProperty('--ly', `${y - r.top}px`);
};
