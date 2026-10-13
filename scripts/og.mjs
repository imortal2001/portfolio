// Renders the 1200×630 social preview image to public/og.png. Usage: npm run og
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const img = (f) => `data:image/webp;base64,${readFileSync(`public/images/${f}`).toString('base64')}`;
const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600&family=Instrument+Serif:ital@1&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #F7FBFD; font-family: 'Instrument Sans', sans-serif; color: #03045E; position: relative; }
  .glow { position: absolute; right: -160px; top: -220px; width: 820px; height: 820px; border-radius: 50%; background: radial-gradient(circle, rgba(202,240,248,.95), transparent 62%); }
  .copy { position: absolute; left: 80px; top: 92px; width: 640px; }
  .mark { display: inline-grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: #03045E; color: #F7FBFD; font-weight: 700; font-size: 22px; }
  h1 { font-size: 76px; line-height: 1; letter-spacing: -.04em; margin: 44px 0 14px; font-weight: 600; }
  .role { font-family: 'JetBrains Mono', monospace; font-size: 22px; color: #0077B6; margin: 0 0 30px; }
  p.lede { font-size: 30px; line-height: 1.35; color: #2E3A63; margin: 0; }
  p.lede em { font-family: 'Instrument Serif', serif; font-style: italic; color: #03045E; font-size: 1.1em; }
  .phone { position: absolute; width: 200px; border-radius: 30px; padding: 7px; background: #0E1430; box-shadow: 0 30px 60px -24px rgba(3,4,94,.45); }
  .phone img { width: 100%; border-radius: 24px; display: block; }
  .a { right: 250px; top: 90px; }
  .b { right: 40px; top: 150px; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: linear-gradient(90deg, #03045E, #023E8A, #0077B6, #0096C7, #00B4D8, #48CAE4, #90E0EF, #ADE8F4, #CAF0F8); }
</style></head><body>
  <div class="glow"></div>
  <div class="copy">
    <span class="mark">LJ</span>
    <h1>Louie Jay Ceniza</h1>
    <p class="role">Full-stack engineer · Cebu, PH</p>
    <p class="lede">I build and modernise <em>production</em> web platforms.</p>
  </div>
  <div class="phone a"><img src="${img('kusina-menu.webp')}"></div>
  <div class="phone b"><img src="${img('isla-farm.webp')}"></div>
  <div class="bar"></div>
</body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
