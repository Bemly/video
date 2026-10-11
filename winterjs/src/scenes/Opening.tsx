import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CastPlayer } from "../components/CastPlayer";
import { BigText, Card, PopIn } from "../components/Ui";
import { C, FONT } from "../theme";
import type { SceneViewProps } from "../Video";

const RUNTIMES = [
  { name: "Node.js", engine: "V8", color: "#5fa04e" },
  { name: "Deno", engine: "V8", color: "#e8eef7" },
  { name: "Bun", engine: "JavaScriptCore", color: "#fbf0df" },
];

export const Opening: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame: f - starts[0], fps, config: { damping: 10 } });
  const shrink = spring({ frame: f - starts[2], fps, config: { damping: 16 } });
  const scale = logoIn * (1 - 0.45 * shrink);
  const top = 250 - 170 * shrink;
  const origin = "50% 0%";
  const slogan = f >= starts[8];
  // 第 1 句：实机 --eval（带 ASCII banner），期间隐藏动画 Logo
  const realDemo = f >= starts[1] && f < starts[2];

  return (
    <>
      {/* 主 Logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${scale})`, transformOrigin: origin, opacity: slogan || realDemo ? 0 : 1 }}>
        <div style={{ fontSize: 150, transform: `rotate(${f * 1.5}deg)` }}>❄️</div>
        <BigText size={170} color="#fff" stroke={C.iceDeep}>
          Winter<span style={{ color: C.ice }}>JS</span>
        </BigText>
        <div style={{ fontFamily: FONT, fontSize: 44, color: C.dim, marginTop: 16, fontWeight: 700 }}>SpiderMonkey × Rust 的 JavaScript 运行时</div>
      </div>

      {realDemo && (
        <CastPlayer name="eval" x={260} y={110} w={1400} h={560} title="zsh — winterjs"
          map={[[starts[1], 0.6], [starts[1] + 75, 3.3]]} />
      )}

      {/* 三巨头 */}
      {!slogan &&
        RUNTIMES.map((r, i) => (
          <PopIn key={r.name} at={starts[2] + 8 + i * 6} style={{ left: 330 + i * 440, top: 380 }}>
            <Card accent={r.color} style={{ width: 380, textAlign: "center", opacity: f >= starts[4] ? 0.45 : 1 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: r.color }}>{r.name}</div>
              {f >= starts[3] && <div style={{ fontSize: 32, color: C.dim, marginTop: 6 }}>引擎：{r.engine}</div>}
            </Card>
          </PopIn>
        ))}

      {/* SpiderMonkey 登场 */}
      {!slogan && (
        <PopIn at={starts[4]} from="zoom" style={{ left: 510, top: 560 }}>
          <Card accent={C.fox} glow style={{ width: 900, textAlign: "center", background: "linear-gradient(135deg,#3a1406,#6b2408)" }}>
            <div style={{ fontSize: 30, color: "#ffd3b0", fontWeight: 700 }}>🦊 Firefox 同款 JS 引擎</div>
            <div style={{ fontSize: 76, fontWeight: 900, color: "#fff" }}>SpiderMonkey</div>
            {f >= starts[6] && (
              <div style={{ fontSize: 34, color: C.gold, fontWeight: 800, marginTop: 6 }}>首个兼容 Node · Bun · Deno 三大生态的 SpiderMonkey 运行时</div>
            )}
          </Card>
        </PopIn>
      )}

      {/* 口号 */}
      {slogan && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PopIn at={starts[8]} from="zoom" style={{ position: "relative" }}>
            <BigText size={120} color={C.gold}>一个二进制</BigText>
          </PopIn>
          <PopIn at={starts[8] + 12} from="zoom" style={{ position: "relative" }}>
            <BigText size={120} color="#fff">跑遍 <span style={{ color: C.ice }}>JS 生态</span></BigText>
          </PopIn>
          <div style={{ height: 30 }} />
          <div style={{ opacity: interpolate(f, [starts[8] + 20, starts[8] + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            {["node:*", "Bun.*", "Deno.*", "Web API", "WinterJS.*"].map((t) => (
              <span key={t} style={{ fontFamily: FONT, fontSize: 36, fontWeight: 800, color: "#0b1426", background: C.ice, borderRadius: 999, padding: "6px 22px", margin: 8, display: "inline-block" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
