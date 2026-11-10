// Refactor guard: node styles-diff.mjs <basePort> <newPort>
// Compares the computed style of every element and pseudo-element at desktop and phone size.
// Transitions and animations are ignored (mid-animation values differ between runs).
import { launch, open } from './pw.mjs';

const [base, next] = process.argv.slice(2);
if (!base || !next) { console.error('usage: node styles-diff.mjs <basePort> <newPort>'); process.exit(2); }

const grab = async (browser, target, device) => {
  const { ctx, page, errors } = await open(browser, target, device, { frozen: true });
  const rows = await page.evaluate(() => [...document.querySelectorAll('*')].flatMap((el, i) =>
    [null, '::before', '::after'].map((ps) => {
      const c = getComputedStyle(el, ps);
      const props = [...c].filter((k) => !/^(transition|animation)/.test(k)).map((k) => `${k}:${c.getPropertyValue(k)}`).sort();
      return { id: `${i}${ps ?? ''} ${el.tagName}.${el.className}`, props };
    })));
  await ctx.close();
  return { rows, errors };
};

// Equal if the non-numeric parts match and every number is within 0.25 (sub-pixel text jitter).
const NUM = /-?\d*\.?\d+/g;
const same = (x, y) => {
  if (x === y) return true;
  if (x.replace(NUM, '#') !== y.replace(NUM, '#')) return false;
  const a = x.match(NUM), b = y.match(NUM);
  return a.every((n, i) => Math.abs(n - b[i]) <= 0.25);
};
const sameRow = (r, s) => r.props.length === s.props.length && r.props.every((p, i) => same(p, s.props[i]));

const browser = await launch();
let total = 0;
for (const device of ['desktop', 'phone']) {
  const a = await grab(browser, base, device), b = await grab(browser, next, device);
  if (a.rows.length !== b.rows.length) console.log(`${device}: element count differs ${a.rows.length} vs ${b.rows.length}`);
  let diffs = 0;
  a.rows.forEach((r, i) => {
    const s = b.rows[i];
    if (s && sameRow(r, s)) return;
    if (!s) return;
    if (diffs++ < 8) console.log(' ', r.id.slice(0, 70), '\n    -', r.props.filter((x, j) => !same(x, s.props[j] ?? '')).slice(0, 4).join('; '), '\n    +', s.props.filter((x, j) => !same(x, r.props[j] ?? '')).slice(0, 4).join('; '));
  });
  total += diffs + Math.abs(a.rows.length - b.rows.length);
  console.log(`${device}: ${a.rows.length} rows, ${diffs} diffs, errors ${JSON.stringify([...a.errors, ...b.errors])}`);
}
await browser.close();
process.exit(total ? 1 : 0);
