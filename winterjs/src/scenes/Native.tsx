import React from "react";
import { useCurrentFrame } from "remotion";
import { CastPlayer } from "../components/CastPlayer";
import { CodePanel } from "../components/Code";
import { BigText, Card, Chip, PopIn } from "../components/Ui";
import { C, FONT, MONO } from "../theme";
import type { SceneViewProps } from "../Video";

const MEDIA_CODE = `// WinterJS.media 实机演示：解码真实 MP4 里的 FLAC 音轨 → PCM，再编码 AV1
import { readFileSync } from "node:fs";

const mp4 = readFileSync(new URL("./beep.mp4", import.meta.url));
const info = WinterJS.media.mp4Info(mp4);
console.log("mp4Info →", info.tracks.map((t) => \`\${t.kind}/\${t.codec}\`).join(", "));

const pcm = WinterJS.media.decodeAudio(mp4);
console.log("decodeAudio →", { codec: pcm.codec, sampleRate: pcm.sampleRate, channels: pcm.channels, samples: pcm.data.length });

const w = 64, h = 36, n = 8;
const frames = new Uint8Array(w * h * 4 * n);
for (let i = 0; i < n; i++)
  for (let p = 0; p < w * h; p++) frames.set([i * 30, 120, 255 - i * 30, 255], (i * w * h + p) * 4);
const ivf = WinterJS.media.videoEncode({ data: frames, width: w, height: h, count: n }, { speed: 10 });
console.log("videoEncode →", String.fromCharCode(...ivf.slice(0, 4)), ivf.length, "bytes (AV1)");
console.log("formats →", WinterJS.media.formats().map((f) => f.name).join(" "));`;

const IMG_FORMATS = ["PNG", "JPEG", "GIF", "WebP", "TIFF", "TGA", "BMP", "ICO", "HDR", "EXR", "PNM", "farbfeld", "QOI", "SVG", "JPEG XL", "DDS"];
const TOOLS = ["semver", "yaml", "jsonc", "qrcode", "ip", "shlex", "spdx", "git", "graph", "transpile", "mime", "cookie", "hex", "time", "retry", "log"];

const Wave: React.FC<{ f: number }> = ({ f }) => {
  const pts = Array.from({ length: 120 }, (_, i) => {
    const x = i * 6.5;
    const amp = 70 * (0.4 + 0.6 * Math.abs(Math.sin(i / 9 + f / 10))) * Math.sin(i / 2.2 + f / 3);
    return `${x},${90 + amp}`;
  }).join(" ");
  return (
    <svg width={780} height={180}>
      <polyline points={pts} fill="none" stroke={C.ice} strokeWidth={4} />
    </svg>
  );
};

export const Native: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const mediaPhase = f >= starts[2] && f < starts[7];
  const imgPhase = f >= starts[7] && f < starts[9];
  const toolPhase = f >= starts[9];
  return (
    <>
      {f < starts[2] && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PopIn at={starts[0]} from="zoom" style={{ position: "relative" }}>
            <BigText size={130} color={C.ice}>WinterJS.*</BigText>
          </PopIn>
          <div style={{ marginTop: 30, width: 1400, textAlign: "center" }}>
            {["media", "image", "semver", "yaml", "qrcode", "git", "transpile", "fs", "net", "…"].map((t, i) => (
              <PopIn key={t} at={starts[0] + 10 + i * 4} from="zoom" style={{ position: "relative", display: "inline-block" }}>
                <Chip size={40} color={t === "media" ? C.gold : C.ice}>{t}</Chip>
              </PopIn>
            ))}
          </div>
        </div>
      )}

      {mediaPhase && (
        <>
          {f < starts[4] && <CodePanel file="demo/media.js" code={MEDIA_CODE} x={80} y={120} w={1000} reveal={2 + (f - starts[2]) / 5} fontSize={17} accent={C.gold} />}
          {f >= starts[4] && (
            <CastPlayer name="media" x={80} y={120} w={1000} h={640} title="winterjs --run media.js"
              map={[[starts[4], 0], [starts[4] + 45, 1.6], [starts[5], 1.62], [starts[5] + 30, 3.66]]} />
          )}
          <div style={{ position: "absolute", left: 1110, top: 120, width: 740, fontFamily: FONT, color: C.text }}>
            <PopIn at={starts[2]} style={{ position: "relative" }}>
              <Card accent={C.ice} style={{ padding: "12px 20px" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.ice }}>🎵 decodeAudio → Float32 PCM</div>
                <div style={{ transform: "scale(0.9)", transformOrigin: "left" }}><Wave f={f} /></div>
                <div style={{ fontSize: 22, color: C.dim }}>MP3 · FLAC · OGG · WAV · M4A · AAC · AIFF · CAF · ALAC · MKA</div>
              </Card>
            </PopIn>
            {f >= starts[3] && (
              <PopIn at={starts[3]} style={{ position: "relative", marginTop: 16 }}>
                <Card accent={C.good} style={{ padding: "12px 20px", fontSize: 28, fontWeight: 800 }}>
                  🔊 play() 后台线程放音 {"◗".repeat(1 + (Math.floor(f / 8) % 3))}
                </Card>
              </PopIn>
            )}
            {f >= starts[4] && (
              <PopIn at={starts[4]} style={{ position: "relative", marginTop: 16 }}>
                <Card accent={C.fox} style={{ padding: "12px 20px" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.fox }}>🎞️ RGBA 帧 → AV1</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} style={{ width: 96, height: 60, borderRadius: 6, border: "3px solid #fff3", background: `hsl(${(f * 3 + i * 40) % 360},70%,55%)` }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 22, color: C.dim, marginTop: 8 }}>out.ivf · "DKIF" · av01</div>
                </Card>
              </PopIn>
            )}
            {f >= starts[5] && (
              <PopIn at={starts[5]} style={{ position: "relative", marginTop: 16 }}>
                <Card accent={C.ice} style={{ padding: "12px 20px", fontFamily: MONO, fontSize: 24 }}>
                  <div style={{ color: C.ice, fontFamily: FONT, fontWeight: 900, fontSize: 28 }}>📦 mp4Info / mp4Samples</div>
                  <div>track#1  audio  flac  44100Hz</div>
                  <div>samples → mp4Sample(i)</div>
                </Card>
              </PopIn>
            )}
          </div>
        </>
      )}

      {imgPhase && (
        <>
          <PopIn at={starts[7]} style={{ left: 0, right: 0, top: 120, textAlign: "center" }}>
            <BigText size={64} color={C.gold}>🖼️ WinterJS.image · 16 种格式</BigText>
          </PopIn>
          {IMG_FORMATS.map((t, i) => (
            <PopIn key={t} at={starts[7] + 10 + i * 3} from="zoom" style={{ left: 330 + (i % 4) * 320, top: 230 + Math.floor(i / 4) * 105 }}>
              <div style={{ width: 290, height: 90, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#0b1426", background: `hsl(${200 + i * 11},80%,${t === "JPEG XL" || t === "SVG" || t === "DDS" ? 70 : 82}%)`, border: "4px solid #0b1426" }}>
                {t}
              </div>
            </PopIn>
          ))}
          {f >= starts[8] && (
            <PopIn at={starts[8]} from="zoom" style={{ left: 0, right: 0, top: 700, textAlign: "center" }}>
              <BigText size={50} color={C.good}>全部内置 · 无需 npm install</BigText>
            </PopIn>
          )}
        </>
      )}

      {toolPhase && (
        <>
          <div style={{ position: "absolute", left: 90, top: 140, width: 960 }}>
            {TOOLS.map((t, i) => (
              <PopIn key={t} at={starts[9] + i * 3} from="zoom" style={{ position: "relative", display: "inline-block" }}>
                <Chip size={36} color={t === "qrcode" ? C.gold : C.ice}>WinterJS.{t}</Chip>
              </PopIn>
            ))}
          </div>
          <CastPlayer name="media" x={1080} y={110} w={760} h={660} title="winterjs --run tools.js"
            map={[[starts[9] + 20, 5.7], [starts[9] + 70, 7.26]]} />
        </>
      )}
    </>
  );
};
