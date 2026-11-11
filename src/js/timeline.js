import { $$ } from './dom.js';

const GAP = 12;

// Positions duration rails (.stage__run) directly between consecutive timestamps (.stage__time time)
// so the gap above and below each rail is equal.
export function initTimeline() {
  const routes = $$('.route');
  if (!routes.length) return;

  const layout = (route) => {
    const routeRect = route.getBoundingClientRect();
    if (!routeRect.width || !routeRect.height) return;

    const times = $$('.stage__time time', route);
    const runs = $$('.stage__run', route);

    runs.forEach((run, i) => {
      const tA = times[i];
      const tB = times[i + 1];
      if (!tA || !tB) return;

      const rA = tA.getBoundingClientRect();
      const rB = tB.getBoundingClientRect();
      const top = rA.bottom - routeRect.top + GAP;
      const height = rB.top - rA.bottom - 2 * GAP;
      const centerX = (rA.left + rA.right) / 2 - routeRect.left;

      run.style.top = `${top}px`;
      run.style.height = `${height}px`;
      run.style.left = `${centerX}px`;
      run.style.transform = 'translateX(-50%)';
    });
  };

  const update = () => routes.forEach(layout);

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) layout(entry.target);
  });

  routes.forEach((r) => ro.observe(r));
  if (document.fonts?.ready) document.fonts.ready.then(update);
  update();
}
