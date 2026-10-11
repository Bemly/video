import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/** 真机截图窗口：可选 zoom 关键帧 [[帧, 缩放, 焦点x(0-1), 焦点y(0-1)], ...] 做推拉镜头。 */
export const Shot: React.FC<{
  src: string; x: number; y: number; w: number; h: number; title?: string; at?: number;
  zoom?: [number, number, number, number][]; tag?: string;
}> = ({ src, x, y, w, h, title, at = 0, zoom, tag = "● 作者真机截图" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - at, fps, config: { damping: 14 } });
  let sc = 1, fx = 0.5, fy = 0.5;
  if (zoom && zoom.length) {
    const fr = zoom.map((z) => z[0]);
    const opt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
    if (zoom.length === 1) [, sc, fx, fy] = zoom[0];
    else {
      sc = interpolate(f, fr, zoom.map((z) => z[1]), opt);
      fx = interpolate(f, fr, zoom.map((z) => z[2]), opt);
      fy = interpolate(f, fr, zoom.map((z) => z[3]), opt);
    }
  }
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, transform: `scale(${pop})`,
        borderRadius: 18, overflow: "hidden", background: "#1e2327",
        border: `2px solid ${C.panelBorder}`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: "rgba(255,255,255,0.08)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ marginLeft: 12, color: C.dim, fontFamily: FONT, fontSize: 22 }}>{title}</div>
        <div style={{ marginLeft: "auto", color: C.gold, fontFamily: FONT, fontSize: 20, fontWeight: 800 }}>{tag}</div>
      </div>
      <div style={{ position: "relative", width: w, height: h - 46, overflow: "hidden" }}>
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain",
            transform: `scale(${sc})`, transformOrigin: `${fx * 100}% ${fy * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
