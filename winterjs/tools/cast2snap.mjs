// asciicast → 屏幕快照序列（xterm headless 解析，含颜色/粗体/光标）。
// 用法：node tools/cast2snap.mjs public/casts/*.cast   → 同名 .json
// 快照格式：{ cols, rows, dur, snaps: [{ t, cx, cy, lines: [[[text, fg, bg, flags], ...], ...] }] }
import fs from "node:fs";
import xterm from "@xterm/headless";

const { Terminal } = xterm;
const PAL = [
  "#1c2233", "#ff6b6b", "#5fe3a1", "#ffd65a", "#6fa8ff", "#d98cff", "#5ed7e6", "#dfe6f0",
  "#56627a", "#ff8f8f", "#8af0bd", "#ffe38a", "#9cc4ff", "#e6b0ff", "#8ae8f2", "#ffffff",
];
function xcolor(n) {
  if (n < 16) return PAL[n];
  if (n < 232) {
    const v = n - 16, r = Math.floor(v / 36), g = Math.floor(v / 6) % 6, b = v % 6;
    const c = (x) => (x ? 55 + x * 40 : 0);
    return `rgb(${c(r)},${c(g)},${c(b)})`;
  }
  const l = 8 + (n - 232) * 10;
  return `rgb(${l},${l},${l})`;
}
const color = (cell, fg) => {
  if (fg ? cell.isFgDefault() : cell.isBgDefault()) return null;
  const v = fg ? cell.getFgColor() : cell.getBgColor();
  if (fg ? cell.isFgRGB() : cell.isBgRGB()) return `#${v.toString(16).padStart(6, "0")}`;
  return xcolor(v);
};

function snapshot(term) {
  const b = term.buffer.active;
  const lines = [];
  for (let y = 0; y < term.rows; y++) {
    const line = b.getLine(b.viewportY + y);
    const runs = [];
    if (line) {
      let cur = null;
      for (let x = 0; x < term.cols; x++) {
        const cell = line.getCell(x);
        if (!cell || cell.getWidth() === 0) continue;
        const ch = cell.getChars() || " ";
        const fg = color(cell, true), bg = color(cell, false);
        const flags = (cell.isBold() ? 1 : 0) | (cell.isInverse() ? 2 : 0) | (cell.isDim() ? 4 : 0) | (cell.isUnderline() ? 8 : 0);
        if (cur && cur[1] === fg && cur[2] === bg && cur[3] === flags) cur[0] += ch;
        else runs.push((cur = [ch, fg, bg, flags]));
      }
      while (runs.length && runs[runs.length - 1][0].trim() === "" && !runs[runs.length - 1][2]) runs.pop();
    }
    lines.push(runs);
  }
  return { cx: b.cursorX, cy: b.cursorY, lines };
}

for (const file of process.argv.slice(2)) {
  const rows = fs.readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const head = rows.shift();
  const term = new Terminal({ cols: head.width, rows: head.height, allowProposedApi: true, scrollback: 0 });
  const snaps = [];
  for (const [t, kind, data] of rows) {
    if (kind !== "o") continue;
    await new Promise((r) => term.write(data, r));
    const s = snapshot(term);
    const prev = snaps[snaps.length - 1];
    if (prev && prev.t === t) snaps[snaps.length - 1] = { t, ...s };
    else snaps.push({ t, ...s });
  }
  const out = file.replace(/\.cast$/, ".json");
  const dur = rows.length ? rows[rows.length - 1][0] : 0;
  fs.writeFileSync(out, JSON.stringify({ cols: head.width, rows: head.height, dur, snaps }));
  console.log(`${out}: ${snaps.length} snaps, ${dur}s`);
}
