// WinterJS.media 实机演示：解码真实 MP4 里的 FLAC 音轨 → PCM，再编码 AV1
import { readFileSync } from "node:fs";

const mp4 = readFileSync(new URL("./beep.mp4", import.meta.url));
const info = WinterJS.media.mp4Info(mp4);
console.log("mp4Info →", info.tracks.map((t) => `${t.kind}/${t.codec}`).join(", "));

const pcm = WinterJS.media.decodeAudio(mp4);
console.log("decodeAudio →", { codec: pcm.codec, sampleRate: pcm.sampleRate, channels: pcm.channels, samples: pcm.data.length });

const w = 64, h = 36, n = 8;
const frames = new Uint8Array(w * h * 4 * n);
for (let i = 0; i < n; i++)
  for (let p = 0; p < w * h; p++) frames.set([i * 30, 120, 255 - i * 30, 255], (i * w * h + p) * 4);
const ivf = WinterJS.media.videoEncode({ data: frames, width: w, height: h, count: n }, { speed: 10 });
console.log("videoEncode →", String.fromCharCode(...ivf.slice(0, 4)), ivf.length, "bytes (AV1)");
console.log("formats →", WinterJS.media.formats().map((f) => f.name).join(" "));
