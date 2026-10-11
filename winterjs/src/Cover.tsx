import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Background } from "./components/Background";
import { BigText } from "./components/Ui";
import { C, FONT, MONO } from "./theme";

/** B 站封面（16:10，1920×1200）。核心内容在中间 1600px 内，4:3 裁切也安全。 */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg0, overflow: "hidden" }}>
    <Background />
    {/* 顶部光晕 */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(124,200,255,0.28) 0%, transparent 55%)" }} />

    {/* 角色 */}
    <Img src={staticFile("cast/whale.webp")} style={{ position: "absolute", left: -40, bottom: -10, height: 760, filter: "drop-shadow(0 0 30px rgba(124,200,255,0.7))" }} />
    <Img src={staticFile("cast/claude.webp")} style={{ position: "absolute", right: -30, bottom: -10, height: 700, filter: "drop-shadow(0 0 30px rgba(255,179,71,0.7))" }} />

    {/* 标题区 */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#0b1426", background: C.fox, padding: "6px 34px", borderRadius: 16, border: "5px solid #0b1426", transform: "rotate(-3deg)" }}>
        🦊 Firefox 同款引擎 · SpiderMonkey
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 22 }}>
        <div style={{ fontSize: 200, lineHeight: 1 }}>❄️</div>
        <BigText size={260} color="#fff" stroke={C.iceDeep}>
          Winter<span style={{ color: C.ice }}>JS</span>
        </BigText>
      </div>
      <BigText size={112} color={C.gold} style={{ marginTop: 4 }}>一个二进制 通吃</BigText>
      <BigText size={112} color="#fff">Node · Bun · Deno</BigText>
      <div style={{ marginTop: 34, display: "flex", gap: 18 }}>
        {["Rust 纯血", "原生多媒体 API", "REPL 补全+文档"].map((t) => (
          <span key={t} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#0b1426", background: C.ice, borderRadius: 999, padding: "8px 30px", border: "5px solid #0b1426" }}>
            {t}
          </span>
        ))}
      </div>
    </div>

    {/* 表情包 */}
    <div style={{ position: "absolute", right: 70, top: 50, width: 220, height: 220, borderRadius: 26, overflow: "hidden", background: "#fff", border: "7px solid #fff", transform: "rotate(10deg)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
      <Img src={staticFile("memes/rage.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>

    {/* 底部终端条 */}
    <div style={{ position: "absolute", left: "50%", bottom: 46, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 40, color: "#dfe6f0", background: "rgba(6,12,24,0.92)", border: `3px solid ${C.panelBorder}`, borderRadius: 16, padding: "12px 34px", whiteSpace: "nowrap" }}>
      <span style={{ color: C.good }}>$ </span>winterjs --eval <span style={{ color: "#a5e075" }}>'40 + 2'</span>
      <span style={{ color: C.dim }}>  →  </span><span style={{ color: C.gold }}>42</span>
    </div>
  </AbsoluteFill>
);
