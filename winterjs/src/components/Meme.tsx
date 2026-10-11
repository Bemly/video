import React from "react";
import { Gif } from "@remotion/gif";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../theme";

/** 表情包缺图时的兜底贴纸（emoji + 大字）。放了真图就自动用真图。 */
const FALLBACK: Record<string, [string, string]> = {
  wow: ["😲", "哇奥！！！"], jump: ["🥳", "嗨嗨！"], cool: ["😎", "酷"], think: ["🤔", "思考中…"],
  huh: ["🧐", "huh？"], waa: ["🤩", "哇哇！"], horn: ["📢", "听我说！"], melon: ["🍉", "吃瓜"],
  want: ["🙌", "给我也整一个！"], heart: ["💖", "比心"], enough: ["😑", "差不多得了"],
  cringe: ["😒", "下头"], cry: ["😭", "哭哭"], scared: ["😱", "害怕"], dizzy: ["😵‍💫", "晕晕"],
  tongue: ["😛", "略略略"], cake: ["🍰", "小蛋糕！"], flower: ["💐", "送花花"], nerd: ["🤓", "书呆子"],
  news: ["📰", "看报"], box: ["📦", "探头"], doubleclick: ["🖱️", "双击！"], bobo: ["😙", "啵啵啵"],
  blabla: ["💬", "blabla"], tail: ["✨", "尾巴立了"], work: ["💼", "上班"], hachi: ["😤", "哈基鲸！"], pat: ["🫳", "摸摸头"],
};

/** 单张表情包停留帧数（30fps）。 */
export const MEME_FRAMES = 48;

type Props = { memeKey: string; file?: string; side: "left" | "right"; frames: number };

export const MemePop: React.FC<Props> = ({ memeKey, file, side, frames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 180 } });
  // 只弹一下：约 1.5 秒后收回，不长时间遮挡内容
  const hold = Math.min(frames, MEME_FRAMES);
  const out = interpolate(f, [hold - 8, hold], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f >= hold) return null;
  const rot = (side === "left" ? -8 : 8) + Math.sin(f / 5) * 3;
  const size = 270;
  const style: React.CSSProperties = {
    position: "absolute",
    top: 370,
    [side]: 40,
    width: size,
    height: size,
    transform: `scale(${s * out}) rotate(${rot}deg)`,
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
  };
  if (file) {
    const src = staticFile(`memes/${file}`);
    return (
      <div style={{ ...style, borderRadius: 24, overflow: "hidden", background: "#fff", border: "6px solid #fff" }}>
        {file.endsWith(".gif") ? (
          <Gif src={src} width={size - 12} height={size - 12} fit="contain" />
        ) : (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        )}
      </div>
    );
  }
  const [emoji, word] = FALLBACK[memeKey] ?? ["✨", memeKey];
  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40,
        background: "linear-gradient(160deg,#fff 0%,#e8f4ff 100%)",
        border: "8px solid #0b1426",
      }}
    >
      <div style={{ fontSize: 150, lineHeight: 1 }}>{emoji}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#0b1426", marginTop: 10 }}>{word}</div>
    </div>
  );
};

/** 表情包雨：一句话期间一串表情包从底部抛物线飞过全屏。 */
export const MemeBurst: React.FC<{ keys: string[]; memes: Record<string, string>; frames: number }> = ({ keys, memes, frames }) => {
  const f = useCurrentFrame();
  return (
    <>
      {keys.map((k, i) => {
        const file = memes[k];
        if (!file) return null;
        const start = 6 + i * 7;
        const life = Math.min(frames - start, 75);
        const t = (f - start) / life;
        if (t < 0 || t > 1) return null;
        const x0 = 120 + ((i * 397) % 1500);
        const dir = i % 2 === 0 ? 1 : -1;
        const x = x0 + dir * 260 * t;
        const y = 1080 - 1150 * t + 900 * t * t;
        const size = 200 + (i % 3) * 30;
        const src = staticFile(`memes/${file}`);
        return (
          <div
            key={k + i}
            style={{
              position: "absolute", left: x, top: y, width: size, height: size,
              transform: `rotate(${dir * (t * 60 - 20)}deg)`, borderRadius: 20, overflow: "hidden",
              background: "#fff", border: "5px solid #fff", boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
            }}
          >
            {file.endsWith(".gif") ? (
              <Gif src={src} width={size - 10} height={size - 10} fit="contain" />
            ) : (
              <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            )}
          </div>
        );
      })}
    </>
  );
};
