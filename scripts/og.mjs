// Renders the 1200×630 social preview image to public/og.png. Usage: npm run og
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const img = (f) => `data:image/webp;base64,${readFileSync(`public/images/${f}`).toString('base64')}`;
const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #F4F7FC; font-family: 'Bricolage Grotesque', sans-serif; color: #0B1B36; position: relative; }
  .glow { position: absolute; right: -200px; top: -260px; width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(circle, rgba(36,87,245,.25), transparent 62%); }
  .copy { position: absolute; left: 72px; top: 84px; width: 580px; }
  .mark { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 18px; background: #0B1B36; color: #F3F7FF; font-weight: 800; font-size: 26px; }
  h1 { font-size: 70px; line-height: .98; letter-spacing: -.035em; margin: 40px 0 24px; font-weight: 750; }
  h1 em { color: #2457F5; font-weight: 500; }
  p { font-family: 'JetBrains Mono', monospace; font-size: 22px; color: #66748F; margin: 0; }
  .phone { position: absolute; width: 210px; border-radius: 34px; padding: 8px; background: #0E121A; box-shadow: 0 30px 60px -20px rgba(11,27,70,.4); }
  .phone img { width: 100%; border-radius: 27px; display: block; }
  .a { right: 235px; top: 80px; transform: rotate(-6deg); }
  .b { right: 40px; top: 150px; transform: rotate(6deg); }
</style></head><body>
  <div class="glow"></div>
  <div class="copy">
    <span class="mark">LJ</span>
    <h1>I build apps &amp; games people <em>love</em> to use.</h1>
    <p>Louie Jay · Full-stack developer</p>
  </div>
  <div class="phone a"><img src="${img('isla-farm.webp')}"></div>
  <div class="phone b"><img src="${img('kusina-menu.webp')}"></div>
</body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
