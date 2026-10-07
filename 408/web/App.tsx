import React, {useEffect, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {Main, TOTAL} from '../src/Main';
import {ACT_RANGES} from '../src/timeline';

const FPS = 60;
const BASE = import.meta.env.BASE_URL;

const FONTS: [string, string][] = [
  ['Noto Sans SC', 'fonts/NotoSansSC.ttf'],
  ['Noto Serif SC', 'fonts/NotoSerifSC.ttf'],
  ['JetBrains Mono', 'fonts/JetBrainsMono.ttf'],
  ['Orbitron', 'fonts/Orbitron.ttf'],
  ['Rajdhani', 'fonts/Rajdhani.ttf'],
  ['Unbounded', 'fonts/Unbounded.ttf'],
];

const fmt = (frame: number) => {
  const s = Math.floor(frame / FPS);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);

  // 字体异步加载，不阻塞首屏；没下完先用系统字体顶
  useEffect(() => {
    let dead = false;
    FONTS.forEach(([family, file]) => {
      new FontFace(family, `url('${BASE}${file}')`, {weight: '100 900'})
        .load()
        .then((ff) => {
          if (!dead) document.fonts.add(ff);
        })
        .catch(() => {});
    });
    return () => {
      dead = true;
    };
  }, []);

  return (
    <div style={{maxWidth: 1280, margin: '0 auto', padding: '24px 16px 64px'}}>
      <h1 style={{fontSize: 22, margin: '8px 0 4px'}}>408 MV · 网页实时渲染版</h1>
      <p style={{color: '#9aa7c2', margin: '0 0 16px', fontSize: 14}}>
        共 {TOTAL} 帧 / {fmt(TOTAL)}（60fps），浏览器实时播，不用导出 mp4。音频为压缩流播版（mp3 18M，边下边播）。
      </p>
      <div style={{borderRadius: 12, overflow: 'hidden', border: '1px solid #1c2742'}}>
        <Player
          ref={ref}
          component={Main}
          inputProps={{musicSrc: `${BASE}music2.mp3`}}
          durationInFrames={TOTAL}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          controls
          loop
          clickToPlay
          acknowledgeRemotionLicense
          style={{width: '100%'}}
          onFrameUpdate={setFrame}
        />
      </div>
      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16}}>
        {ACT_RANGES.map((a) => (
          <button
            key={a.key}
            onClick={() => ref.current?.seekTo(a.s)}
            style={{
              background: '#0b1328',
              color: '#eef3ff',
              border: `1px solid ${a.color}`,
              borderLeft: `6px solid ${a.color}`,
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {a.key} · {fmt(a.s)}
          </button>
        ))}
      </div>
      <p style={{color: '#4b5872', fontSize: 12, marginTop: 16}}>当前帧：{frame}（{fmt(frame)}）· 章节跳转按各 Act 起始帧 seek</p>
    </div>
  );
};

export default App;
