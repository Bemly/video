import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../theme';
import {useF} from './Shot';

export const Placeholder: React.FC<{id: string}> = ({id}) => {
  const f = useF();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT.mono, fontSize: 80, color: '#fff'}}>
      {id} · {f}
    </AbsoluteFill>
  );
};
