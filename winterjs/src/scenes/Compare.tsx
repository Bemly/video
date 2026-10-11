import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BigText } from "../components/Ui";
import { C, FONT } from "../theme";
import type { SceneViewProps } from "../Video";

const COLS = [
  { name: "Node.js", color: "#5fa04e" },
  { name: "Deno", color: "#e8eef7" },
  { name: "Bun", color: "#fbf0df" },
  { name: "WinterJS ❄️", color: C.ice },
];

type Row = { label: string; cells: string[]; line: number; wjLine?: number };

export const Compare: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows: Row[] = [
    { label: "JS 引擎", cells: ["V8", "V8", "JavaScriptCore", "SpiderMonkey"], line: 1, wjLine: 2 },
    { label: "实现语言", cells: ["C++", "Rust", "Zig", "Rust"], line: 1, wjLine: 2 },
    { label: "node: 模块", cells: ["✓", "✓", "✓", "✓"], line: 4 },
    { label: "Bun.* / bun:sqlite", cells: ["—", "—", "✓", "✓"], line: 5 },
    { label: "Deno.* 命名空间", cells: ["—", "✓", "—", "✓"], line: 6 },
    { label: "内置音视频编解码", cells: ["—", "—", "—", "✓"], line: 8 },
  ];
  const tableIn = spring({ frame: f - starts[1] + 10, fps, config: { damping: 14 } });
  const stamp = spring({ frame: f - starts[7], fps, config: { damping: 8, stiffness: 200 } });
  const glow = 0.5 + 0.5 * Math.sin(f / 8);

  const cellStyle = (ci: number): React.CSSProperties => ({
    flex: ci < 0 ? "0 0 380px" : 1,
    textAlign: "center",
    padding: "14px 8px",
    fontSize: 34,
    fontWeight: 800,
  });

  return (
    <>
      <div
        style={{
          position: "absolute", left: 120, top: 120, width: 1680, fontFamily: FONT, color: C.text,
          opacity: tableIn, transform: `translateY(${(1 - tableIn) * 40}px)`,
          background: C.panel, borderRadius: 24, border: `2px solid ${C.panelBorder}`, overflow: "hidden",
        }}
      >
        {/* WinterJS 列高亮 */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: (1680 - 380) / 4, background: `rgba(124,200,255,${0.1 + glow * 0.08})`, borderLeft: `3px solid ${C.ice}` }} />
        <div style={{ display: "flex", borderBottom: `2px solid ${C.panelBorder}`, background: "rgba(255,255,255,0.05)" }}>
          <div style={cellStyle(-1)} />
          {COLS.map((c, i) => (
            <div key={c.name} style={{ ...cellStyle(i), color: c.color, fontSize: 40, fontWeight: 900 }}>{c.name}</div>
          ))}
        </div>
        {rows.map((r) => {
          const shown = f >= starts[r.line];
          const o = interpolate(f, [starts[r.line], starts[r.line] + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={r.label} style={{ display: "flex", borderBottom: "1px solid rgba(124,200,255,0.12)", opacity: shown ? o : 0.12 }}>
              <div style={{ ...cellStyle(-1), textAlign: "left", paddingLeft: 30, color: C.dim }}>{r.label}</div>
              {r.cells.map((v, ci) => {
                const isWj = ci === 3;
                const wjShown = !isWj || r.wjLine === undefined || f >= starts[r.wjLine];
                const color = v === "✓" ? C.good : v === "—" ? "#56627a" : isWj ? C.ice : C.text;
                return (
                  <div key={ci} style={{ ...cellStyle(ci), color, opacity: wjShown ? 1 : 0, transform: isWj && wjShown ? `scale(${1 + 0.04 * glow})` : undefined }}>
                    {v}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {f >= starts[7] && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", transform: `scale(${stamp}) rotate(-6deg)`, opacity: f >= starts[8] ? 0 : 1 }}>
          <div style={{ border: `10px solid ${C.fox}`, borderRadius: 30, padding: "10px 40px", background: "rgba(11,20,38,0.85)" }}>
            <BigText size={110} color={C.fox}>三家 API 全都认！</BigText>
          </div>
        </div>
      )}
    </>
  );
};
