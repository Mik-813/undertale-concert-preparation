// Shared Playwright bootstrap. playwright-core lives outside the repo (see setup in SKILL.md)
// so the site keeps zero test dependencies.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

const dir = process.env.PW_DIR ?? `${homedir()}/.cache/undertale-pw`;
let chromium;
try {
  ({ chromium } = createRequire(`${dir}/`)('playwright-core'));
} catch {
  console.error(`playwright-core missing. Run: npm i --prefix ${dir} playwright-core`);
  process.exit(2);
}

export const BASE = '/undertale-concert-preparation/';
export const url = (port) => (/^https?:/.test(port) ? port : `http://localhost:${port}${BASE}`);
export const VIEWPORTS = {
  desktop: { viewport: { width: 1400, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
};
export const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium' });

// Opens a page and collects page errors and console errors into `errors`.
// `frozen` pins the clock and disables animations so two runs render identically.
export const open = async (browser, target, device, { frozen = false } = {}) => {
  const ctx = await browser.newContext(VIEWPORTS[device]);
  const page = await ctx.newPage();
  if (frozen) {
    await page.clock.install({ time: new Date('2026-11-10T12:00:00+01:00') });
    await page.clock.pauseAt(new Date('2026-11-10T12:00:00+01:00'));
    await page.addInitScript(() => addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}';
      document.head.append(s);
    }));
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url(target));
  if (frozen) await page.clock.runFor(1500);
  else await page.waitForTimeout(1200);
  return { ctx, page, errors };
};
