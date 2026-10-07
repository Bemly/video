import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
const composition = await selectComposition({serveUrl, id: 'MV408Preview', puppeteerInstance: browser});
for (const frame of frames) {
  const t = Date.now();
  await renderStill({composition, serveUrl, output: `out/stills/f${String(frame).padStart(5, '0')}.jpg`, frame, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, puppeteerInstance: browser, overwrite: true});
  console.log('frame', frame, Date.now() - t, 'ms');
}
await browser.close({silent: true});
