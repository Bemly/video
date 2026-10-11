import React from "react";
import { useCurrentFrame } from "remotion";
import { CodePanel } from "../components/Code";
import { CastPlayer } from "../components/CastPlayer";
import { BigText, Card, Chip, PopIn } from "../components/Ui";
import { C } from "../theme";
import type { SceneViewProps } from "../Video";

const APIS = ["fetch", "Request", "Response", "URL", "Web Streams", "TextEncoder", "WebCrypto", "structuredClone", "WebSocket", "Blob", "AbortController", "EventTarget"];

const HANDLER = `export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/hello") return new Response("hello from winterjs\\n");
    return new Response(JSON.stringify({ path: url.pathname }) + "\\n", {
      headers: { "content-type": "application/json" },
    });
  },
};`;

export const WinterCG: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const extras = f >= starts[6];
  return (
    <>
      {f < starts[2] && (
        <PopIn at={starts[0]} style={{ left: 0, right: 0, top: 110, textAlign: "center" }}>
          <BigText size={64} color={C.ice}>WinterCG · 标准 Web API</BigText>
        </PopIn>
      )}
      {f < starts[2] &&
        APIS.map((a, i) => (
          <PopIn key={a} at={starts[1] + i * 4} from="zoom" style={{ left: 170 + (i % 4) * 400, top: 260 + Math.floor(i / 4) * 130 }}>
            <Chip size={40}>{a}</Chip>
          </PopIn>
        ))}
      {f >= starts[2] && (
        <>
          <CodePanel file="handler.mjs" code={HANDLER} x={90} y={130} w={820} reveal={(f - starts[2]) / 3} fontSize={23} />
          <CastPlayer name="serve" x={950} y={130} w={880} h={640} title="winterjs --serve"
            map={[[starts[2] + 20, 0], [starts[2] + 80, 4.2], [starts[3], 5.0], [starts[3] + 90, 11.05]]} />
        </>
      )}
      {f >= starts[3] && !extras && (
        <div style={{ position: "absolute", left: 90, top: 470, width: 820 }}>
          {["HTTP/1.1", "HTTP/2", "HTTP/3", "WebSocket", "静态文件", "ACME 自动证书"].map((t, i) => (
            <PopIn key={t} at={starts[3] + i * 6} from="zoom" style={{ position: "relative", display: "inline-block" }}>
              <Chip color={t === "HTTP/3" ? C.gold : C.good} size={t === "HTTP/3" && f >= starts[4] ? 44 : 32}>{t}</Chip>
            </PopIn>
          ))}
          {f >= starts[5] && (
            <PopIn at={starts[5]} style={{ position: "relative", marginTop: 16 }}>
              <Card accent={C.ice} style={{ fontSize: 30, textAlign: "center" }}>同一份 handler → 其他 WinterCG 平台，写法不变 ✓</Card>
            </PopIn>
          )}
        </div>
      )}
      {extras && (
        <div style={{ position: "absolute", left: 90, top: 470, width: 820 }}>
          <PopIn at={starts[6]} style={{ position: "relative" }}>
            <Card accent={C.gold} style={{ fontSize: 30, lineHeight: 1.7 }}>
              <div>🗜️ <b style={{ color: C.gold }}>new CompressionStream("zstd")</b></div>
              <div>💾 <b style={{ color: C.gold }}>localStorage</b> → 持久化到本地数据库</div>
            </Card>
          </PopIn>
        </div>
      )}
    </>
  );
};
