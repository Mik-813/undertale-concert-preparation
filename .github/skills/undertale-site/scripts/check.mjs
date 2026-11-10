// Behaviour smoke test: node check.mjs [port|url] [--shots DIR]
// Exit code 1 if any check fails.
import { launch, open } from './pw.mjs';

const args = process.argv.slice(2);
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--shots') ?? '4173';
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
let failed = 0;
const ok = (name, cond, info = '') => {
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`);
};

const browser = await launch();
for (const device of ['desktop', 'phone']) {
  console.log(`\n== ${device}`);
  const { ctx, page: p, errors } = await open(browser, target, device);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(1000);
  const touch = device === 'phone';

  ok('pointer class', await p.evaluate((t) => document.documentElement.classList.contains(t ? 'is-touch' : 'is-fine'), touch));
  ok('countdown filled', await p.$$eval('.countdown b', (b) => b.length > 0 && b.every((x) => /\d/.test(x.textContent))));

  // Header hidden at the top and over the plan, shown below it.
  const navShown = () => p.$eval('#nav', (n) => !n.classList.contains('is-hidden'));
  ok('nav hidden at top', !(await navShown()));
  await p.evaluate(() => scrollTo(0, document.querySelector('#plan').getBoundingClientRect().bottom + scrollY + 50));
  await p.waitForTimeout(800);
  ok('nav shown below plan', await navShown());

  // Plan links scroll to their target.
  await p.evaluate(() => scrollTo(0, 0));
  const link = p.locator('#plan a[href^="#"]').first();
  const href = await link.getAttribute('href');
  await link.click();
  await p.waitForTimeout(1500);
  const top = await p.$eval(href, (e) => Math.round(e.getBoundingClientRect().top));
  ok('plan link scrolls', Math.abs(top) < 120, `${href} top=${top}`);

  // Restaurant tabs swap every [data-r] variant and persist.
  const keys = await p.$$eval('[role="tab"]', (t) => t.map((x) => x.dataset.key));
  for (const key of keys) {
    await p.locator(`[role="tab"][data-key="${key}"]`).scrollIntoViewIfNeeded();
    await p.click(`[role="tab"][data-key="${key}"]`);
    await p.waitForTimeout(400);
    const vis = await p.$$eval('[data-r]', (els) => [...new Set(els.filter((e) => !e.hidden).map((e) => e.dataset.r))]);
    ok(`tab ${key}`, vis.length === 1 && vis[0] === key, vis.join(','));
    if (shots) await p.locator('#jedzenie').screenshot({ path: `${shots}/${device}-tab-${key}.png` });
  }
  await p.reload();
  await p.waitForTimeout(600);
  ok('tab persisted', (await p.$eval('[aria-selected="true"]', (e) => e.dataset.key)) === keys.at(-1));

  await p.locator('#wyjazd .train__route').scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  // Train route: stop times share one centre line per row.
  const ys = await p.$$eval('#wyjazd .train__route > *', (els) =>
    els.map((e) => { const r = (e.querySelector('time') ?? e).getBoundingClientRect(); return r.top + r.height / 2; }));
  if (!touch) ok('train row aligned', Math.max(...ys) - Math.min(...ys) < 2, ys.map(Math.round).join(','));

  // Checklist: all checked shows the end dialog, unchecking hides it, state persists.
  const boxes = p.locator('.checklist input');
  const n = await boxes.count();
  for (let i = 0; i < n; i++) touch ? await boxes.nth(i).tap() : await boxes.nth(i).check();
  await p.waitForTimeout(3500);
  const end = await p.$eval('.dialog--end', (e) => [e.classList.contains('is-shown'), e.innerText]);
  ok('checklist end dialog', end[0] && /DETERMINACJ/.test(end[1]));
  await p.reload();
  await p.waitForTimeout(800);
  ok('checklist persisted', (await p.$$eval('.checklist input:checked', (e) => e.length)) === n, `${n} items`);
  await boxes.nth(0).click();
  await p.waitForTimeout(300);
  ok('uncheck hides dialog', !(await p.$eval('.dialog--end', (e) => e.classList.contains('is-shown'))));

  // Pointer effects.
  if (!touch) {
    const t = p.locator('#bilet .ticket');
    await t.scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    const bb = await t.boundingBox();
    await p.mouse.move(bb.x + 50, bb.y + 30);
    await p.mouse.move(bb.x + 80, bb.y + 40, { steps: 5 });
    await p.waitForTimeout(500);
    ok('tilt', /rotate/.test(await t.evaluate((e) => e.style.transform)));
    ok('spotlight follows', /translate3d/.test(await p.$eval('.bg__spotlight', (e) => e.style.transform)));
  } else {
    await p.locator('.timeline .glass').first().scrollIntoViewIfNeeded();
    await p.touchscreen.tap(200, 400);
    await p.waitForTimeout(500);
    ok('touch lights a pane', (await p.$$eval('.is-lit', (e) => e.length)) === 1);
  }

  if (shots) await p.screenshot({ path: `${shots}/${device}-full.png`, fullPage: true });
  ok('no errors', errors.length === 0, errors.join(' | '));
  await p.evaluate(() => localStorage.clear());
  await ctx.close();
}
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
