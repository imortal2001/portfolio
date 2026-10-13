// Stages a demo chat on the local Jammr dev server (port 3417) and captures it.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3417';
const ROOM = process.argv[2] || 'weekend-crew';
const browser = await chromium.launch({ channel: 'chrome' });

async function join(name, vp = [1440, 900], scale = 1, create = false) {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
  await page.fill('#join-name', name);
  if (create) {
    await page.getByRole('button', { name: 'Create a chat' }).click().catch(() => {});
    await page.fill('#create-room', ROOM).catch(() => {});
  } else {
    await page.fill('#join-room', ROOM).catch(() => {});
  }
  await page.click('#join-submit');
  await page.waitForSelector('#app:not([hidden])', { timeout: 15000 });
  await page.waitForTimeout(800);
  return page;
}

async function say(page, text) {
  await page.fill('#chat-input', text);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(450);
}

const maya = await join('Maya', [390, 844], 2, true);
const ben = await join('Ben');
const you = await join('Louie');

await say(maya, 'who’s up for a jam tonight? 🎧');
await say(ben, 'always :fire:');
await say(you, 'I’ll queue the playlist — any requests?');
await say(maya, 'something chill, it’s been a long week');
await say(ben, 'lofi beats then 😄');
await say(you, 'starting it now, everyone hears the same second 🙌');
await you.mouse.move(5, 450);
await maya.mouse.move(5, 400);
await you.waitForTimeout(1500);
await you.screenshot({ path: 'raw/jammr-chat.png' });
await maya.screenshot({ path: 'raw/jammr-chat-mobile.png' });

console.log('room', ROOM);
await browser.close();
