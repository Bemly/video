import React from 'react';
import {Composition} from 'remotion';
import {ensureFonts} from './fonts';
import {Main, TOTAL} from './Main';

ensureFonts();

export const Root: React.FC = () => (
  <>
    <Composition id="MV408" component={Main} durationInFrames={TOTAL} fps={60} width={1920} height={1080} />
    <Composition id="MV408Preview" component={Main} durationInFrames={TOTAL} fps={60} width={1920} height={1080} defaultProps={{mute: true}} />
  </>
);
