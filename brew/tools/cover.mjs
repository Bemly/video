#!/usr/bin/env node
// Renders cover.html to cover-16x9.png (3840x2160) and cover-4x3.png (3200x2400).
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let puppeteer;
try { puppeteer = createRequire(import.meta.url)('puppeteer'); }
catch { puppeteer = createRequire(path.join(execSync('npm root -g').toString().trim(), 'x.js'))('puppeteer'); }
puppeteer = puppeteer.default || puppeteer;
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage();
page.on('pageerror', e => console.error(e.message));
for (const [name, w, h] of [['cover-16x9', 1920, 1080], ['cover-4x3', 1600, 1200]]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(root, 'cover.html')).href);
  await page.waitForFunction('window.ready');
  await page.screenshot({ path: path.join(root, name + '.png') });
  console.log(name + '.png');
}
await browser.close();
