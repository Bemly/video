import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BigText, Card, Chip, PopIn } from "../components/Ui";
import { C, FONT, MONO } from "../theme";
import type { SceneViewProps } from "../Video";

const ANCESTORS = [
  { name: "wasmerio/winterjs", desc: "WinterCG 规范的 HTTP 服务端", status: "2026.03 已归档", tag: "只做服务器", line: 2 },
  { name: "spiderfire", desc: "SpiderMonkey 运行时", status: "最后提交 2025.08", tag: "慢性弃用", line: 5 },
  { name: "GJS", desc: "GNOME 桌面的 JS 绑定", status: "桌面应用 / 扩展", tag: "只做桌面", line: 6 },
];

export const History: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finale = f >= starts[8];
  const lift = spring({ frame: f - starts[8], fps, config: { damping: 14 } });
  return (
    <>
      <PopIn at={starts[1]} style={{ left: 0, right: 0, top: 120, textAlign: "center" }}>
        <BigText size={60} color={C.gold}>📜 SpiderMonkey 运行时家谱</BigText>
      </PopIn>
      {/* 连线 */}
      {f >= starts[2] && <div style={{ position: "absolute", left: 200, right: 200, top: 520, height: 6, background: `linear-gradient(90deg, ${C.dim}, ${C.ice})`, opacity: 0.5 }} />}
      {ANCESTORS.map((a, i) => (
        <PopIn key={a.name} at={starts[a.line]} style={{ left: 130 + i * 570, top: 250, width: 520 }}>
          <Card accent="#6b7a96" style={{ opacity: finale ? 0.35 + 0.65 * (1 - lift) : 1, minHeight: 250 }}>
            <div style={{ fontSize: 40, fontWeight: 900, fontFamily: MONO, color: "#dfe9f7" }}>{a.name}</div>
            <div style={{ fontSize: 30, color: C.dim, marginTop: 8 }}>{a.desc}</div>
            <div style={{ fontSize: 28, color: "#b8c4d8", marginTop: 8 }}>{a.status}</div>
            {f >= starts[7] && (
              <div style={{ marginTop: 14, transform: `rotate(-4deg) scale(${spring({ frame: f - starts[7] - i * 5, fps, config: { damping: 9 } })})`, display: "inline-block" }}>
                <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.fox, border: `4px solid ${C.fox}`, borderRadius: 10, padding: "2px 14px" }}>{a.tag}</span>
              </div>
            )}
          </Card>
        </PopIn>
      ))}

      {/* 同名 ≠ 同一个 */}
      {f >= starts[3] && f < starts[5] && (
        <PopIn at={starts[3]} from="zoom" style={{ left: 330, top: 560, width: 1260 }}>
          <Card accent={C.ice} glow style={{ display: "flex", alignItems: "center", justifyContent: "space-around", fontSize: 38, fontWeight: 900 }}>
            <span style={{ fontFamily: MONO, color: "#b8c4d8" }}>wasmerio/winterjs</span>
            <span style={{ color: C.fox, fontSize: 56 }}>≠</span>
            <span style={{ fontFamily: MONO, color: C.ice }}>Bemly/winterjs</span>
            {f >= starts[4] && <span style={{ fontSize: 30, color: C.gold }}>mozjs 从零重写 · 通用运行时</span>}
          </Card>
        </PopIn>
      )}

      {/* WinterJS 登顶 */}
      {finale && (
        <div style={{ position: "absolute", left: 260, top: 560 - lift * 30, width: 1400, opacity: lift }}>
          <Card accent={C.ice} glow style={{ textAlign: "center", background: "linear-gradient(135deg,#0f2d55,#123a6b)" }}>
            <BigText size={72} color="#fff">❄️ Winter<span style={{ color: C.ice }}>JS</span> · 完整运行时</BigText>
            <div style={{ marginTop: 12 }}>
              {["跑脚本", "包管理", "测试", "lint / fmt", "HTTP/1·2·3 服务", "REPL"].map((t, i) => (
                <PopIn key={t} at={starts[8] + 8 + i * 5} style={{ position: "relative", display: "inline-block" }}>
                  <Chip color={C.good}>✓ {t}</Chip>
                </PopIn>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
