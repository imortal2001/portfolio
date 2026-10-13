// Captures Adrift (local server on 8124) after waking up on the raft.
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:8124/', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
await page.getByText('WAKE UP', { exact: false }).first().click();
await page.waitForTimeout(6000);
for (const [i, key] of ['ArrowLeft', 'ArrowRight'].entries()) {
  await page.screenshot({ path: `raw/adrift-${i}.png` });
  await page.keyboard.down(key); await page.waitForTimeout(900); await page.keyboard.up(key);
  await page.waitForTimeout(1500);
}
await page.screenshot({ path: 'raw/adrift-2.png' });
await browser.close();
