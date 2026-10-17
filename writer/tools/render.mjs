// 无头逐帧出片：对播放页 ?t= 按帧截图，再配乐合成。
// 用法（仓库根）：python3 -m http.server 8765 & node writer/tools/render.mjs out.mp4 [fps]
// 依赖：playwright（npx playwright install chromium）+ ffmpeg
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const out = process.argv[2] || 'writer-out.mp4';
const fps = +(process.argv[3] || 30);
const dir = await fs.promises.mkdtemp('/tmp/writer-frames-');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('http://localhost:8765/writer/?t=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.__writerReady, null, { timeout: 30000 });
const T = await page.evaluate(() => window.__writer.T());
const total = Math.ceil(T * fps);
console.log(`duration=${T.toFixed(2)}s fps=${fps} frames=${total}`);
for (let f = 0; f < total; f++) {
  const t = f / fps;
  await page.evaluate(t => window.__writer.seek(t), t);
  await page.waitForTimeout(16);
  await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (f % 60 === 0) console.log(`${f}/${total}`);
}
await browser.close();
execSync(`ffmpeg -y -v error -framerate ${fps} -i ${dir}/f%04d.jpg -i writer/audio/mix.m4a -map 0:v -map 1:a -c:v libx264 -profile:v high -pix_fmt yuv420p -r ${fps} -preset medium -crf 20 -c:a copy -movflags +faststart ${out}`, { stdio: 'inherit' });
console.log('done', out);
