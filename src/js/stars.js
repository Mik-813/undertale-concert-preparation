import { $ } from './dom.js';

const canvas = $('#stars');
const ctx = canvas.getContext('2d');
const layers = [];
let W = 0, H = 0;
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
}
export function drawStars(y) {
  ctx.clearRect(0, 0, W, H);
  for (const { off, z } of layers) {
    const dy = ((-(y * z * 0.3)) % H + H) % H;
    ctx.drawImage(off, 0, dy - H);
    ctx.drawImage(off, 0, dy);
  }
}
