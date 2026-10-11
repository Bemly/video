import React, {useEffect, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {Promo} from '../src/Video';
import {SCENES, estimateTimeline, type Timeline} from '../src/timeline';
import {FPS} from '../src/theme';

const BASE = import.meta.env.BASE_URL;

const fmt = (frame: number) => {
  const s = Math.floor(frame / FPS);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [timeline, setTimeline] = useState<Timeline>(() => estimateTimeline());
  const [memes, setMemes] = useState<Record<string, string>>({});
  const [voiced, setVoiced] = useState(false);

  useEffect(() => {
    const STATIC_BASE = window.location.pathname.startsWith('/winterjs') ? '/winterjs' : '';
    (window as unknown as Record<string, unknown>).remotion_staticBase = STATIC_BASE;
    let dead = false;
    // Player 4.x 用事件监听当前帧（无 onFrameUpdate prop，见 player-methods/event-emitter）。
    const onFrame = (e: {detail: {frame: number}}) => {
      if (!dead) setFrame(e.detail.frame);
    };
    const r = ref.current;
    r?.addEventListener('frameupdate', onFrame);
    // 有配音时间轴就用配音版（含配音 + BGM），否则用字数估算的静音版。
    // voice/ 下的文件由 tools/tts.py 生成，默认不进仓库（见 .gitignore）。
    fetch(`${BASE}voice/timeline.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((tl: Timeline | null) => {
        if (!dead && tl && typeof tl.total === 'number') {
          setTimeline(tl);
          setVoiced(true);
        }
      })
      .catch(() => {});
    fetch(`${BASE}memes/manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!dead && m) setMemes(m);
      })
      .catch(() => {});
    return () => {
      dead = true;
      r?.removeEventListener('frameupdate', onFrame);
    };
  }, []);

  const total = timeline.total;

  return (
    <div style={{maxWidth: 1280, margin: '0 auto', padding: '24px 16px 64px'}}>
      <h1 style={{fontSize: 22, margin: '8px 0 4px'}}>WinterJS 宣传片 · 网页实时渲染版</h1>
      <p style={{color: '#9aa7c2', margin: '0 0 16px', fontSize: 14}}>
        共 {total} 帧 / {fmt(total)}（{FPS}fps，1920×1080），浏览器实时播，不用导出 mp4。
        {voiced ? '已加载配音时间轴（含配音 + BGM）。' : '静音预览版：未含 edge-tts 配音，按字数估算节奏；本地跑 npm run tts 可生成配音再渲染成片。'}
      </p>
      <div style={{borderRadius: 12, overflow: 'hidden', border: '1px solid #1c2742'}}>
        <Player
          ref={ref}
          component={Promo}
          inputProps={{timeline, memes, voiced}}
          durationInFrames={total}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          controls
          loop
          clickToPlay
          acknowledgeRemotionLicense
          style={{width: '100%'}}
        />
      </div>
      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16}}>
        {timeline.scenes.map((s, i) => (
          <button
            key={s.id}
            onClick={() => ref.current?.seekTo(s.from)}
            style={{
              background: '#0b1426',
              color: '#eef3ff',
              border: '1px solid #3a8bd6',
              borderLeft: '6px solid #7cc8ff',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {SCENES[i]?.title ?? s.id} · {fmt(s.from)}
          </button>
        ))}
      </div>
      <p style={{color: '#4b5872', fontSize: 12, marginTop: 16}}>
        当前帧：{frame}（{fmt(frame)}）· 章节跳转按每场起始帧 seek · 源码：winterjs2 promo-video 分支 ·{' '}
        <a href="https://github.com/Bemly/winterjs2/tree/promo-video">promo-video</a>
      </p>
    </div>
  );
};

export default App;
