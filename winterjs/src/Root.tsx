import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { estimateTimeline, Timeline } from "./timeline";
import { FPS, H, W } from "./theme";
import { Promo } from "./Video";
import { CastPreview } from "./components/CastPreview";
import { Cover } from "./Cover";

export type PromoProps = {
  timeline: Timeline | null;
  memes: Record<string, string>;
  voiced: boolean;
};

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(staticFile(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const calculateMetadata: CalculateMetadataFunction<PromoProps> = async () => {
  const voiced = await loadJson<Timeline>("voice/timeline.json");
  const timeline = voiced ?? estimateTimeline();
  const memes = (await loadJson<Record<string, string>>("memes/manifest.json")) ?? {};
  return {
    durationInFrames: timeline.total,
    props: { timeline, memes, voiced: voiced !== null },
  };
};

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Cover" component={Cover} width={1920} height={1200} fps={FPS} durationInFrames={1} />
  <Composition
    id="CastPreview"
    component={CastPreview}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 30}
    defaultProps={{ name: "repl" }}
  />
  <Composition
    id="WinterJSPromo"
    component={Promo}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 60}
    defaultProps={{ timeline: null, memes: {}, voiced: false }}
    calculateMetadata={calculateMetadata}
  />
  </>
);
