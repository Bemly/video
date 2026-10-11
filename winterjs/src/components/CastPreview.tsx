import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CastPlayer } from "./CastPlayer";

/** 单独预览一段实机录像（Studio 里切到 CastPreview，改 name 即可）。 */
export const CastPreview: React.FC<{ name: string }> = ({ name }) => (
  <AbsoluteFill>
    <Background />
    <CastPlayer name={name} x={90} y={80} w={1740} h={900} title={`winterjs — ${name}`} />
  </AbsoluteFill>
);
