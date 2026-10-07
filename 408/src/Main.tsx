import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Shots} from './components/Shot';
import {ActHUD} from './components/ui';
import {COL} from './theme';
import {ACT_RANGES, SHOTS, TOTAL} from './timeline';

export {TOTAL};

const STOPS: [number, string][] = ACT_RANGES.map((a) => [a.s, a.color]);
const HUD_ACTS = ACT_RANGES.slice(1, 5).map((a) => ({s: a.s, e: a.e}));

export const Main: React.FC<{mute?: boolean; musicSrc?: string}> = ({mute, musicSrc}) => (
  <AbsoluteFill style={{background: COL.bg}}>
    <Background stops={STOPS} total={TOTAL} />
    <Shots shots={SHOTS} />
    <ActHUD acts={HUD_ACTS} />
    {!mute && <Audio src={musicSrc ?? staticFile('music2.wav')} />}
  </AbsoluteFill>
);
