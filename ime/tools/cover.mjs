import { createRequire } from 'module'; import { execSync } from 'child_process'; import { join, resolve } from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const puppeteer = createRequire(import.meta.url)(join(execSync('npm root -g').toString().trim(), 'puppeteer'));
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const b = await puppeteer.launch({ headless: true }), p = await b.newPage();
for (const [q, w, name] of [['', 1920, 'cover-16x9.png'], ['?43', 1440, 'cover-4x3.png']]) {
  await p.setViewport({ width: w, height: 1080 }); await p.goto(pathToFileURL(join(root, 'cover.html')).href + q);
  await p.screenshot({ path: join(root, name) }); }
await b.close();
