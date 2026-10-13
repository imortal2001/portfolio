// Dev helper: tiles screenshots side by side into one image. Usage: node scripts/sheet.mjs out.png width a.png b.png ...
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const [out, w, ...files] = process.argv.slice(2);
const html = `<body style="margin:0;display:flex;gap:12px;align-items:flex-start;background:#888">${files.map((f) => `<img src="${pathToFileURL(f)}" style="width:${w}px">`).join('')}</body>`;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: files.length * (Number(w) + 12), height: 100 } });
const tmp = out.replace(/\.png$/, '.html');
writeFileSync(tmp, html);
await p.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
await p.screenshot({ path: out, fullPage: true });
await b.close();
