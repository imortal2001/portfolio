// Renders resume/index.html to public/Louie-Jay-Ceniza-Resume.pdf (A4, one page). Usage: npm run resume
import { createServer } from 'vite';
import { chromium } from 'playwright';

const OUT = 'public/Louie-Jay-Ceniza-Resume.pdf';
const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const url = `${server.resolvedUrls.local[0]}resume/`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const overflow = await page.evaluate(() => {
  const main = document.querySelector('.main');
  const side = document.querySelector('.side');
  return Math.max(main.scrollHeight - main.clientHeight, side.scrollHeight - side.clientHeight);
});
if (overflow > 0) console.warn(`Warning: content overflows the page by ${overflow}px — trim something.`);
const spare = await page.evaluate(() => {
  const free = (col) => { const r = col.getBoundingClientRect(); const pb = parseFloat(getComputedStyle(col).paddingBottom); return Math.round(r.bottom - pb - col.lastElementChild.getBoundingClientRect().bottom); };
  return { main: free(document.querySelector('.main')), side: free(document.querySelector('.side')) };
});
console.log(`Free space at the bottom (px): main ${spare.main}, sidebar ${spare.side}`);
if (process.argv.includes('--png')) await page.screenshot({ path: process.argv[process.argv.indexOf('--png') + 1], fullPage: true });
await page.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
await server.close();
console.log(`wrote ${OUT}`);
