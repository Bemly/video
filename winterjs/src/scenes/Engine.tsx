import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CastPlayer } from "../components/CastPlayer";
import { Shot } from "../components/Shot";
import { BigText, Card, Chip, PopIn } from "../components/Ui";
import { C, FONT, MONO } from "../theme";
import type { SceneViewProps } from "../Video";

const Layer: React.FC<{ at: number; top: number; color: string; title: string; sub: string; children?: React.ReactNode }> = ({ at, top, color, title, sub, children }) => (
  <PopIn at={at} from="down" style={{ left: 880, top, width: 960 }}>
    <Card accent={color} style={{ background: `linear-gradient(90deg, ${color}33, rgba(8,16,32,0.9))` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color }}>{title}</div>
        <div style={{ fontSize: 26, color: C.dim, fontFamily: MONO }}>{sub}</div>
      </div>
      {children && <div style={{ marginTop: 10 }}>{children}</div>}
    </Card>
  </PopIn>
);

export const Engine: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const showThreads = f >= starts[7];
  const tlO = interpolate(f, [starts[4] - 6, starts[4]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showVersions = f >= starts[4] && f < starts[5];
  const showEval = f >= starts[5] && f < starts[7];
  return (
    <>
      {/* 左：历史时间线 → 线程模型 */}
      <div style={{ opacity: tlO }}>
        <PopIn at={starts[0]} style={{ left: 90, top: 150, width: 720 }}>
          <Card accent={C.gold}>
            <div style={{ fontSize: 30, color: C.dim }}>世界上第一个 JavaScript 引擎</div>
            <BigText size={72} color={C.gold}>SpiderMonkey</BigText>
          </Card>
        </PopIn>
        <PopIn at={starts[1]} from="left" style={{ left: 90, top: 380, width: 720 }}>
          <div style={{ fontFamily: FONT, color: C.text, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 88, fontWeight: 900, color: C.fox }}>1995</div>
            <div style={{ fontSize: 34, lineHeight: 1.4 }}>网景 Netscape<br />Brendan Eich 亲手写下</div>
          </div>
        </PopIn>
        <PopIn at={starts[3]} from="left" style={{ left: 90, top: 530, width: 720 }}>
          <div style={{ fontFamily: FONT, color: C.text, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 88, fontWeight: 900, color: C.ice }}>2026</div>
            <div style={{ fontSize: 34, lineHeight: 1.4 }}>依然驱动 Firefox<br />WinterJS 钉在 Gecko 153</div>
          </div>
        </PopIn>
      </div>
      {/* 第 4 句：作者真机 REPL 截图，versions.mozjs = "153" */}
      {showVersions && (
        <Shot src="shots/repl-versions.png" x={60} y={120} w={800} h={560} at={starts[4]} title="winterjs repl — macOS"
          zoom={[[starts[4], 1, 0.3, 0.2], [starts[4] + 40, 1.55, 0.33, 0.22], [starts[5] - 20, 1.55, 0.33, 0.22]]} />
      )}
      {/* 第 5–6 句：实机 --eval 另两条（fetch / URL） */}
      {showEval && (
        <CastPlayer name="eval" x={60} y={120} w={800} h={560} title="zsh — winterjs"
          map={[[starts[5], 3.3], [starts[7] - 20, 12.2]]} />
      )}
      {showThreads && (
        <PopIn at={starts[7]} style={{ left: 90, top: 170, width: 740 }}>
          <Card accent={C.good}>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.good, marginBottom: 14 }}>线程模型</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
              <div style={{ padding: "14px 20px", borderRadius: 14, background: `${C.fox}33`, border: `2px solid ${C.fox}` }}>JS 独占线程</div>
              <div style={{ fontSize: 30, color: C.gold }}>⇄ 消息队列 ⇄</div>
              <div style={{ padding: "14px 20px", borderRadius: 14, background: `${C.ice}33`, border: `2px solid ${C.ice}` }}>Rust 工作线程</div>
            </div>
            <div style={{ fontSize: 28, color: C.dim, marginTop: 18 }}>unsafe 只出现在引擎边界 · 业务层零 unsafe</div>
          </Card>
        </PopIn>
      )}

      {/* 右：架构分层，自下而上 */}
      <Layer at={starts[0]} top={560} color={C.fox} title="SpiderMonkey" sub="C++ · Gecko 153">
        {f >= starts[3] && (
          <>
            <Chip color={C.fox} size={24}>JIT 编译</Chip>
            <Chip color={C.fox} size={24}>分代 GC</Chip>
            <Chip color={C.fox} size={24}>最新 ECMAScript</Chip>
          </>
        )}
      </Layer>
      <Layer at={starts[4]} top={390} color={C.gold} title="mozjs" sub="=0.26.0 · Servo 维护的 Rust 绑定" />
      <Layer at={starts[6]} top={130} color={C.ice} title="WinterJS" sub="100% Rust">
        {["事件循环", "模块加载器", "Web API", "node: 兼容层", "包管理器"].map((t, i) => (
          <PopIn key={t} at={starts[6] + 6 + i * 5} style={{ position: "relative", display: "inline-block" }}>
            <Chip size={24}>{t}</Chip>
          </PopIn>
        ))}
      </Layer>
    </>
  );
};
