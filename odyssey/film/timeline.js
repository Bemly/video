// Shot timing is derived from the subtitle text, so the script can be re-timed (or voiced) later.
export const FPS = 30;
export const W = 1920, H = 1080;
const BASE = 1.45, PER_CHAR = 0.215;

export const lineDur = (zh, pad = 0) => (zh ? BASE + PER_CHAR * [...zh].length : 0) + pad;

export function build(shots) {
  let t = 0;
  for (const s of shots) {
    let lt = 0;
    s.lines = s.lines.map(([zh, en, o = {}]) => { const L = { zh, en, start: lt, dur: lineDur(zh, o.pad || 0) }; lt += L.dur; return L; });
    s.frames = Math.round((lt + (s.tail || 0)) * FPS);
    s.dur = s.frames / FPS; s.start = t; s.f0 = Math.round(t * FPS);
    t += s.dur;
  }
  return { shots, dur: t, frames: Math.round(t * FPS) };
}

const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

// per-frame context handed to every shot
export function ctxOf(shot, t) {
  let line = 0;
  for (let i = 0; i < shot.lines.length; i++) if (t >= shot.lines[i].start) line = i;
  const at = (i) => (i < shot.lines.length ? shot.lines[Math.max(0, i)].start : shot.dur);
  return {
    t, dur: shot.dur, line, lt: t - at(line), at,
    // eased 0..1 ramp that starts `delay` seconds into line i and lasts d seconds
    p: (i, d = 0.7, delay = 0) => smooth((t - at(i) - delay) / d),
    // linear version
    q: (i, d = 1, delay = 0) => Math.min(1, Math.max(0, (t - at(i) - delay) / d)),
    in: (i, a = 0, b = 1e9) => t >= at(i) + a && t < at(i) + b,
    smooth,
  };
}

// piecewise input script: [[seconds, value], ...]
export function seq(t, parts, fallback = {}) {
  for (const [d, v] of parts) { if (t < d) return v; t -= d; }
  return fallback;
}
