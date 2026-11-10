import { $ } from './dom.js';

const canvas = $('#stars');
const ctx = canvas.getContext('2d');
const layers = [];
const rings = [[120, 2, 0.7], [190, 1.5, 0.55], [270, 1.2, 0.45], [360, 1, 0.35], [460, 0.8, 0.25]];
let W = 0, H = 0, arcs = null, A = 0;

// Arcs are rasterised once; per frame we only blit rotated bitmaps (an SVG would be re-rasterised every frame).
function buildArcs() {
  A = Math.round(Math.max(W, H) * 1.6);
  arcs = document.createElement('canvas');
  arcs.width = arcs.height = A;
  const c = arcs.getContext('2d');
  const k = A / 1000;
  c.strokeStyle = '#a78bfa'; c.lineCap = 'round';
  c.setLineDash([2 * k, 14 * k, 40 * k, 10 * k]);
  for (const [r, w, o] of rings) {
    c.globalAlpha = o * 0.4; c.lineWidth = w * k;
    c.beginPath(); c.arc(A / 2, A / 2, r * k, 0, Math.PI * 2); c.stroke();
  }
}

export function buildStars() {
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
  buildArcs();
}

let lastT = -1;
// Draws at most once per frame.
export function paint(t, y) {
  if (t !== undefined && t === lastT) return;
  lastT = t;
  drawStars(y);
}

export function drawStars(y) {
  ctx.clearRect(0, 0, W, H);
  // Arc centre sits 40% of the arc box below the viewport top (matches the old CSS placement).
  ctx.save();
  ctx.translate(W / 2, A * 0.1 - y * 0.08);
  ctx.rotate((y * 0.02 * Math.PI) / 180);
  ctx.drawImage(arcs, -A / 2, -A / 2);
  ctx.restore();
  for (const { off, z } of layers) {
    const dy = ((-(y * z * 0.3)) % H + H) % H;
    ctx.drawImage(off, 0, dy - H);
    ctx.drawImage(off, 0, dy);
  }
}
