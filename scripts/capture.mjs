// Captures raw screenshots of each project into raw/ (Jammr: see capture-jammr.mjs, which stages a demo chat). Usage: node scripts/capture.mjs [name...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('raw', { recursive: true });
const only = process.argv.slice(2);

const shots = [
  { name: 'kusina-landing', url: 'https://kusinalink.expo.app/', vp: [390, 844], scale: 2 },
  { name: 'kusina-menu', url: 'https://kusinalink.expo.app/menu', vp: [390, 844], scale: 2 },
  { name: 'kusina-desktop', url: 'https://kusinalink.expo.app/', vp: [1440, 900], scale: 1 },
  { name: 'adrift', url: 'http://localhost:8124/', vp: [1440, 900], scale: 1, wait: 9000 },
];

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
for (const s of shots) {
  if (only.length && !only.includes(s.name)) continue;
  const page = await browser.newPage({ viewport: { width: s.vp[0], height: s.vp[1] }, deviceScaleFactor: s.scale });
  try {
    await page.goto(s.url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    console.warn(s.name, 'load:', e.message.split('\n')[0]);
  }
  await page.waitForTimeout(s.wait ?? 2500);
  await page.screenshot({ path: `raw/${s.name}.png` });
  console.log('saved', s.name);
  await page.close();
}
await browser.close();
