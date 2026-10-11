import script from "./script.json";
import { FPS } from "./theme";

export type Who = "whale" | "claude";
export type Line = { who: Who; text: string; say?: string; meme?: string; burst?: string[] };
export type Scene = { id: string; title: string; lines: Line[] };
export type Cast = Record<Who, { name: string; color: string }>;

export type LineTiming = { file: string | null; from: number; frames: number };
export type SceneTiming = { id: string; from: number; frames: number; lines: LineTiming[] };
export type Timeline = { fps: number; total: number; scenes: SceneTiming[] };

export const SCENES = script.scenes as Scene[];
export const CAST = script.cast as unknown as Cast;

// 与 tools/tts.py 同口径
const LINE_GAP = 0.28;
const SCENE_HEAD = 0.9;
const SCENE_TAIL = 0.6;

/** 未跑 `npm run tts` 时的估算时间轴：静音预览也能看节奏。 */
export function estimateTimeline(): Timeline {
  let t = 0;
  const scenes: SceneTiming[] = SCENES.map((s) => {
    const start = t;
    let cur = t + Math.round(SCENE_HEAD * FPS);
    const lines = s.lines.map((l) => {
      const chars = [...(l.say ?? l.text)].length;
      const frames = Math.ceil((0.5 + chars * 0.2) * FPS);
      const lt: LineTiming = { file: null, from: cur - start, frames };
      cur += frames + Math.round(LINE_GAP * FPS);
      return lt;
    });
    cur += Math.round(SCENE_TAIL * FPS);
    t = cur;
    return { id: s.id, from: start, frames: cur - start, lines };
  });
  return { fps: FPS, total: t, scenes };
}
