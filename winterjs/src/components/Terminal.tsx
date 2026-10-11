import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, MONO } from "../theme";

export type TermItem = { kind: "cmd" | "out" | "raw"; text: string; at: number; color?: string };

const CPS = 1.1; // 每帧打几个字

/** 打字机终端：cmd 逐字打出，out 在 at 帧整行出现；自动滚动保留末尾若干行。 */
export const Terminal: React.FC<{
  items: TermItem[];
  title?: string;
  prompt?: string;
  x: number; y: number; w: number; h: number;
  fontSize?: number;
}> = ({ items, title = "zsh — winterjs", prompt = "$", x, y, w, h, fontSize = 30 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 14 } });
  const rows: { text: React.ReactNode; key: number }[] = [];
  let typingNow = false;
  items.forEach((it, i) => {
    if (f < it.at) return;
    if (it.kind === "cmd") {
      const n = Math.min(it.text.length, Math.floor((f - it.at) * CPS));
      if (n < it.text.length) typingNow = true;
      rows.push({
        key: i,
        text: (
          <>
            <span style={{ color: C.good }}>{prompt} </span>
            <span style={{ color: "#fff" }}>{it.text.slice(0, n)}</span>
            {n < it.text.length && <Cursor />}
          </>
        ),
      });
    } else {
      rows.push({ key: i, text: <span style={{ color: it.color ?? C.dim, whiteSpace: "pre" }}>{it.text}</span> });
    }
  });
  const lineH = fontSize * 1.45;
  const maxRows = Math.floor((h - 70) / lineH);
  const visible = rows.slice(-maxRows);
  const lastIsCmdDone = !typingNow;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h,
        transform: `scale(${pop})`, borderRadius: 18, overflow: "hidden",
        background: "rgba(6,12,24,0.94)", border: `2px solid ${C.panelBorder}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: "rgba(255,255,255,0.06)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <div style={{ marginLeft: 12, color: C.dim, fontFamily: FONT, fontSize: 22 }}>{title}</div>
      </div>
      <div style={{ padding: "14px 24px", fontFamily: MONO, fontSize, lineHeight: `${lineH}px` }}>
        {visible.map((r) => (
          <div key={r.key} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{r.text}</div>
        ))}
        {lastIsCmdDone && (
          <div>
            <span style={{ color: C.good }}>{prompt} </span>
            <Cursor />
          </div>
        )}
      </div>
    </div>
  );
};

export const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  return <span style={{ display: "inline-block", width: "0.55em", height: "1.05em", verticalAlign: "-0.15em", background: f % 30 < 16 ? "#fff" : "transparent" }} />;
};

/** 一串命令 + 输出，按"第 i 句开始帧"排布：[句号, 相对偏移, item]。 */
export function schedule(starts: number[], plan: [number, number, Omit<TermItem, "at">][]): TermItem[] {
  return plan.map(([line, off, it]) => ({ ...it, at: (starts[line] ?? 0) + off }));
}

/** 用于 out 行：在 cmd 打完后再出现。 */
export const typedFrames = (s: string) => Math.ceil(s.length / CPS) + 6;

export const fadeIn = (f: number, at: number, len = 10) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
