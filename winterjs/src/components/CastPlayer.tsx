import React, { useEffect, useState } from "react";
import { continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, MONO } from "../theme";

type Run = [string, string | null, string | null, number];
type Snap = { t: number; cx: number; cy: number; lines: Run[][] };
type Cast = { cols: number; rows: number; dur: number; snaps: Snap[] };

const cache = new Map<string, Cast>();

/** 实机录屏回放：public/casts/<name>.json（由 tools/record.py + cast2snap.mjs 生成）。
 *  start = 从第几帧开始播放（相对当前 Sequence），speed = 播放倍速。 */
export const CastPlayer: React.FC<{
  name: string; x: number; y: number; w: number; h: number;
  start?: number; speed?: number; title?: string; skip?: number;
  /** 分段变速：[[场景帧, 录像秒], ...]，给了就忽略 start/speed/skip。 */
  map?: [number, number][];
}> = ({ name, x, y, w, h, start = 0, speed = 1, title, skip = 0, map }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [cast, setCast] = useState<Cast | null>(cache.get(name) ?? null);
  const [handle] = useState(() => (cache.has(name) ? null : delayRender(`cast ${name}`)));
  useEffect(() => {
    if (cast) return;
    fetch(staticFile(`casts/${name}.json`))
      .then((r) => r.json())
      .then((c: Cast) => {
        cache.set(name, c);
        setCast(c);
        if (handle !== null) continueRender(handle);
      });
  }, [name, cast, handle]);

  const pop = spring({ frame: f, fps, config: { damping: 14 } });
  const t = map ? mapTime(map, f) : skip + Math.max(0, (f - start) / fps) * speed;
  let snap: Snap | null = null;
  if (cast) {
    let lo = 0, hi = cast.snaps.length - 1, idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cast.snaps[mid].t <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1;
    }
    snap = idx >= 0 ? cast.snaps[idx] : null;
  }
  const cols = cast?.cols ?? 96, rows = cast?.rows ?? 22;
  const fs = Math.min((w - 40) / (cols * 0.6), (h - 70) / (rows * 1.32));
  const blink = f % 30 < 16;

  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, transform: `scale(${pop})`,
        borderRadius: 18, overflow: "hidden", background: "rgba(6,12,24,0.96)",
        border: `2px solid ${C.panelBorder}`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: "rgba(255,255,255,0.06)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ marginLeft: 12, color: C.dim, fontFamily: FONT, fontSize: 22 }}>{title ?? "winterjs"}</div>
        <div style={{ marginLeft: "auto", color: "#ff6b6b", fontFamily: FONT, fontSize: 20, fontWeight: 800 }}>● 实机录制</div>
      </div>
      <div style={{ padding: "12px 20px", fontFamily: MONO, fontSize: fs, lineHeight: 1.32, color: "#dfe6f0", position: "relative" }}>
        {snap?.lines.map((runs, yi) => (
          <div key={yi} style={{ whiteSpace: "pre", height: fs * 1.32 }}>
            {runs.map(([text, fg, bg, flags], i) => {
              const inv = flags & 2;
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    height: fs * 1.32,
                    verticalAlign: "top",
                    color: (inv ? bg : fg) ?? (inv ? "#0b1426" : undefined),
                    background: (inv ? fg ?? "#dfe6f0" : bg) ?? undefined,
                    fontWeight: flags & 1 ? 800 : undefined,
                    opacity: flags & 4 ? 0.6 : undefined,
                    textDecoration: flags & 8 ? "underline" : undefined,
                  }}
                >
                  {text}
                </span>
              );
            })}
          </div>
        ))}
        {snap && blink && (
          <div style={{ position: "absolute", left: 20 + snap.cx * fs * 0.6, top: 12 + snap.cy * fs * 1.32, width: fs * 0.6, height: fs * 1.25, background: "#dfe6f0", opacity: 0.85 }} />
        )}
      </div>
    </div>
  );
};

/** 录像时长（秒），供场景排布参考。 */
export const castDuration = (c: Cast) => c.dur;

function mapTime(map: [number, number][], f: number): number {
  if (f <= map[0][0]) return map[0][1];
  for (let i = 1; i < map.length; i++) {
    const [f0, t0] = map[i - 1], [f1, t1] = map[i];
    if (f <= f1) return t0 + ((f - f0) / (f1 - f0)) * (t1 - t0);
  }
  return map[map.length - 1][1];
}
