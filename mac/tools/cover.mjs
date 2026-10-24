// node tools/cover.mjs — renders cover/cover.html to 16:9 and 4:3 PNGs
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal'] });
for (const [r, w, name] of [['169', 1920, '封面_16x9.png'], ['43', 1440, '封面_4x3.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 1080 } });
  await p.goto(`http://127.0.0.1:8765/cover/cover.html?r=${r}`);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: name });
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 2000))]); process.exit(0);
