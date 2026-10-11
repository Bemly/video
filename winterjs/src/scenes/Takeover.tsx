import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/Code";
import { CastPlayer } from "../components/CastPlayer";
import { Shot } from "../components/Shot";
import { BigText, Card, PopIn } from "../components/Ui";
import { C, MONO } from "../theme";
import type { SceneViewProps } from "../Video";

const PROJECTS = [
  { tool: "yarn", file: "yarn.lock", color: "#2c8ebb" },
  { tool: "pnpm", file: "pnpm-lock.yaml", color: "#f9ad00" },
  { tool: "bun", file: "bun.lock", color: "#fbf0df" },
  { tool: "deno", file: "deno.json", color: "#e8eef7" },
];

const BUN_CODE = `import { Database } from "bun:sqlite";

const db = new Database(":memory:");
console.log("bun:sqlite →", db.query("select 42 as answer").get());

const server = Bun.serve({ port: 3001, fetch: () => new Response("hello from Bun.serve") });
console.log("Bun.serve  →", await (await fetch("http://localhost:3001/")).text());
process.exit(0);`;

const DENO_CODE = `const cfg: string = await Deno.readTextFile("./config.json");
console.log("Deno.readTextFile →", JSON.parse(cfg));

const server = Deno.serve({ port: 8123, onListen() {} }, (_req: Request) => new Response(cfg));
console.log("Deno.serve →", await (await fetch("http://localhost:8123")).text());
Deno.exit(0);`;

export const Takeover: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const flow = interpolate(f, [starts[1], starts[1] + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showCode = f >= starts[3] && f < starts[5];
  return (
    <>
      {PROJECTS.map((p, i) => (
        <PopIn key={p.tool} at={starts[0] + i * 6} from="left" style={{ left: 90, top: 130 + i * 140, width: 420 }}>
          <Card accent={p.color} style={{ padding: "14px 24px" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.tool} 项目</div>
            <div style={{ fontSize: 24, fontFamily: MONO, color: C.dim }}>{p.file} · node_modules/</div>
          </Card>
        </PopIn>
      ))}
      {/* 流入箭头 */}
      {f >= starts[1] && (
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {PROJECTS.map((p, i) => {
            const y = 190 + i * 140;
            return (
              <line key={p.tool} x1={520} y1={y} x2={520 + 140 * flow} y2={y + (400 - y) * flow} stroke={C.ice} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-f * 2} />
            );
          })}
        </svg>
      )}
      <PopIn at={starts[1] + 10} from="zoom" style={{ left: 640, top: 320, width: 330 }}>
        <Card accent={C.ice} glow style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80 }}>❄️</div>
          <BigText size={44}>直接接管</BigText>
          <div style={{ fontSize: 24, color: C.dim }}>不重装 · 不迁移</div>
        </Card>
      </PopIn>

      {/* 第 2 句：作者真机 winterjs -r dev（Vite 项目按 scripts 执行） */}
      {f >= starts[2] && f < starts[3] && (
        <Shot src="shots/vue-mac.png" x={1010} y={120} w={820} h={640} at={starts[2]} title="vue-project — winterjs -r dev"
          zoom={[[starts[2], 1, 0.5, 0.5], [starts[2] + 45, 2.1, 0.2, 0.93], [starts[3], 2.1, 0.2, 0.93]]} />
      )}
      {/* 第 3–4 句：真实项目源码 + 实机运行 */}
      {showCode && f < starts[4] && <CodePanel file="bun-app/server.js（Bun 项目）" code={BUN_CODE} x={1010} y={120} w={820} reveal={(f - starts[3]) / 3} fontSize={15} accent="#fbf0df" />}
      {showCode && f >= starts[4] && <CodePanel file="deno-app/main.ts（Deno 项目）" code={DENO_CODE} x={1010} y={120} w={820} reveal={(f - starts[4]) / 3} fontSize={15} accent="#e8eef7" />}
      {f >= starts[3] && f < starts[6] && (
        <CastPlayer name="takeover" x={1010} y={420} w={820} h={340} title="winterjs — Bun / Deno 项目"
          map={[[starts[3], 0], [starts[3] + 60, 3.6], [starts[4], 3.8], [starts[4] + 90, 6.5]]} />
      )}
      {f >= starts[5] && f < starts[6] && (
        <PopIn at={starts[5]} from="zoom" style={{ left: 560, top: 620, width: 440 }}>
          <div style={{ textAlign: "center" }}>
            <BigText size={56} color={C.gold}>零迁移成本！</BigText>
          </div>
        </PopIn>
      )}
      {/* 第 6 句：实机 winterjs -t */}
      {f >= starts[6] && (
        <CastPlayer name="tests" x={1010} y={140} w={820} h={420} title="winterjs -t"
          map={[[starts[6], 0], [starts[6] + 45, 1.5]]} />
      )}
    </>
  );
};
