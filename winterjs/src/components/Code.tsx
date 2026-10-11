import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, MONO } from "../theme";

const KW = /\b(import|from|export|default|const|let|await|async|return|new|function|if|of|for)\b/;
const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)|([^\w\s])/g;

function highlight(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [tok, cm, str, num, id] = m;
    let color = "#e6edf7";
    if (cm) color = "#6f86a6";
    else if (str) color = "#a5e075";
    else if (num) color = "#f5a97f";
    else if (id && KW.test(id)) color = "#c792ea";
    else if (id && /^(WinterJS|Bun|Deno|Response|Request|URL|fetch|console)$/.test(id)) color = C.ice;
    else if (id && line[m.index + tok.length] === "(") color = "#82aaff";
    out.push(<span key={m.index} style={{ color }}>{tok}</span>);
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** 代码面板：逐行显现（reveal = 已显示行数，可为小数做淡入）。 */
export const CodePanel: React.FC<{
  file: string; code: string; x: number; y: number; w: number; h?: number;
  reveal?: number; fontSize?: number; accent?: string;
}> = ({ file, code, x, y, w, h, reveal = Infinity, fontSize = 28, accent = C.ice }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 14 } });
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h,
        transform: `translateY(${(1 - pop) * 40}px)`, opacity: pop,
        borderRadius: 18, overflow: "hidden", background: "rgba(8,16,32,0.94)",
        border: `2px solid ${accent}55`, boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ padding: "10px 20px", fontFamily: FONT, fontSize: 22, color: accent, background: "rgba(255,255,255,0.05)", borderBottom: `2px solid ${accent}33` }}>
        ● {file}
      </div>
      <div style={{ padding: "14px 22px", fontFamily: MONO, fontSize, lineHeight: 1.5 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "pre", opacity: Math.max(0, Math.min(1, reveal - i)) }}>
            <span style={{ color: "#40506a", marginRight: 18 }}>{String(i + 1).padStart(2, " ")}</span>
            {highlight(l)}
          </div>
        ))}
      </div>
    </div>
  );
};
