// Dev helper: full-page screenshots of the local site at several widths. Usage: node scripts/shoot.mjs <outDir> [url]
import { chromium } from 'playwright';
const out = process.argv[2] || 'shots';
const url = process.argv[3] || 'http://localhost:5190/';
const sizes = { desktop: [1440, 900], tablet: [820, 1180], mobile: [390, 844] };
const schemes = (process.env.SCHEMES || 'light').split(',');
const browser = await chromium.launch({ channel: 'chrome' });
for (const scheme of schemes) for (const [name, [w, h]] of Object.entries(sizes)) {
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) continue;
  const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: scheme });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in')));
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.screenshot({ path: `${out}/${scheme}-${name}-top.png` });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const slice = name === 'desktop' ? 1800 : name === 'tablet' ? 2000 : 1700;
  for (let y = 0, i = 0; y < total; y += slice, i++) {
    await page.screenshot({ path: `${out}/${scheme}-${name}-${String(i).padStart(2, '0')}.png`, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(slice, total - y) } });
  }
  console.log(scheme, name, 'overflowX', overflow, errors.length ? errors : '');
  await page.close();
}
await browser.close();
