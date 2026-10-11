import React from "react";
import { useCurrentFrame } from "remotion";
import { Shot } from "../components/Shot";
import { schedule, Terminal, typedFrames } from "../components/Terminal";
import { BigText, Card, PopIn } from "../components/Ui";
import { C, FONT, MONO } from "../theme";
import type { SceneViewProps } from "../Video";

const CMD = {
  add: "winterjs -a create-vue",
  create: "winterjs -r node_modules/.bin/create-vue -- hello-vue --ts --router",
  init: "cd hello-vue && winterjs -I -y",
  build: "winterjs -r build",
  dev: "winterjs -r dev",
};

export const VueScene: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const items = schedule(starts, [
    [1, 10, { kind: "cmd", text: CMD.add }],
    [1, 10 + typedFrames(CMD.add), { kind: "out", text: "+ create-vue  → node_modules", color: C.good }],
    [2, 6, { kind: "cmd", text: CMD.create }],
    [2, 6 + typedFrames(CMD.create), { kind: "out", text: "Scaffolding project in ./hello-vue..." }],
    [2, 16 + typedFrames(CMD.create), { kind: "out", text: "Done.", color: C.good }],
    [3, 6, { kind: "cmd", text: CMD.init }],
    [3, 6 + typedFrames(CMD.init), { kind: "out", text: "✓ dependencies installed → node_modules", color: C.good }],
  ]);
  return (
    <>
      <PopIn at={starts[0]} style={{ left: 1230, top: 130, width: 600 }}>
        <Card accent={C.vue} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 110, lineHeight: 1 }}>
            <span style={{ color: C.vue, fontWeight: 900 }}>▼</span>
          </div>
          <BigText size={58} color={C.vue}>Vue 3 + Vite</BigText>
          <div style={{ fontSize: 28, color: C.dim, marginTop: 6 }}>全程只用 winterjs 一个命令</div>
        </Card>
      </PopIn>
      {f >= starts[4] && f < starts[7] && (
        <PopIn at={starts[4]} from="zoom" style={{ left: 1230, top: 470, width: 600 }}>
          <Card accent={C.gold} style={{ fontSize: 40, fontWeight: 900, textAlign: "center", lineHeight: 1.6 }}>
            <div><span style={{ color: "#56627a", textDecoration: "line-through" }}>node</span>　<span style={{ color: "#56627a", textDecoration: "line-through" }}>npm</span></div>
            {f >= starts[5] && <div style={{ color: C.gold, fontSize: 34 }}>.bin 里的 JS 命令由 WinterJS 自己执行</div>}
          </Card>
        </PopIn>
      )}
      {f < starts[6] && <Terminal items={items} x={90} y={120} w={1080} h={620} fontSize={27} title="~/projects — winterjs" />}
      {/* 第 6–8 句：作者真机 —— winterjs -r build / -r dev + 浏览器 Vue DevTools */}
      {f >= starts[6] && (
        <Shot src="shots/vue-mac.png" x={90} y={110} w={1080} h={650} at={starts[6]} title="vue-project — macOS 真机"
          zoom={[
            [starts[6], 1, 0.5, 0.5], [starts[6] + 40, 2.2, 0.3, 0.66], [starts[7] - 10, 2.2, 0.3, 0.66],
            [starts[7] + 30, 2.2, 0.3, 0.93], [starts[7] + 110, 2.2, 0.3, 0.93], [starts[7] + 150, 1.6, 0.4, 0.2],
          ]} />
      )}
    </>
  );
};
