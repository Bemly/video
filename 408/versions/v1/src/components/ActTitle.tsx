import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, COL, eBack, eOut, FONT, lerp, prog, rgba} from '../theme';
import {useF, useShot} from './Shot';

export const ActTitle: React.FC<{
  num: string;
  zh: string;
  en: string;
  color: string;
  topics: string[];
  quote: string;
  by: string;
  score: number;
}> = ({num, zh, en, color, topics, quote, by, score}) => {
  const f = useF();
  const {dur} = useShot();
  const t = clamp01(f / dur);
  const push = lerp(1.0, 1.06, t);
  const chars = zh.split('');
  const size = zh.length > 4 ? 150 : 190;
  const line = prog(f, 22, 50);
  const numIn = prog(f, 0, 70);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* light rays */}
      <div
        style={{
          position: 'absolute',
          left: 1330 - 1100,
          top: 540 - 1100,
          width: 2200,
          height: 2200,
          background: `repeating-conic-gradient(from ${f * 0.12}deg at 50% 50%, ${rgba(color, 0.12)} 0deg 3deg, transparent 3deg 14deg)`,
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 55%)',
          opacity: numIn,
        }}
      />
      {/* giant outline number */}
      <div
        style={{
          position: 'absolute',
          right: 150 - (1 - numIn) * 200,
          top: 150,
          fontFamily: FONT.hero,
          fontWeight: 800,
          fontSize: 500,
          lineHeight: '700px',
          color: 'transparent',
          WebkitTextStroke: `3px ${rgba(color, 0.55)}`,
          opacity: 0.5 * numIn,
          transform: `scale(${lerp(1.08, 1.0, t)})`,
          filter: `drop-shadow(0 0 30px ${rgba(color, 0.5)})`,
          letterSpacing: '-0.02em',
        }}
      >
        {num}
      </div>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '30% 50%'}}>
        <div style={{position: 'absolute', left: 190, top: 250}}>
          {/* part label + score */}
          <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: prog(f, 6, 30)}}>
            <span style={{fontFamily: FONT.display, fontSize: 26, letterSpacing: '0.5em', color}}>PART {num}</span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 22,
                color: COL.text,
                border: `1.5px solid ${rgba(color, 0.6)}`,
                background: rgba(color, 0.12),
                borderRadius: 999,
                padding: '4px 16px',
                letterSpacing: '0.1em',
              }}
            >
              分值 <b style={{fontFamily: FONT.display, color}}>{Math.round(score * prog(f, 10, 50))}</b> / 150
            </span>
          </div>
          {/* main title */}
          <div style={{display: 'flex', marginTop: 18}}>
            {chars.map((ch, i) => {
              const a = prog(f, 4 + i * 5, 42);
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT.serif,
                    fontWeight: 900,
                    fontSize: size,
                    lineHeight: `${size * 1.2}px`,
                    color: '#ffffff',
                    display: 'inline-block',
                    transform: `translateY(${(1 - a) * 110}px) scale(${lerp(1.3, 1, a)})`,
                    opacity: a,
                    filter: `blur(${(1 - a) * 18}px)`,
                    textShadow: `0 0 40px ${rgba(color, 0.75)}, 0 0 90px ${rgba(color, 0.35)}`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          {/* english + line */}
          <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 8}}>
            <div
              style={{
                width: 180 * line,
                height: 3,
                background: `linear-gradient(90deg, ${color}, transparent)`,
                boxShadow: `0 0 12px ${color}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT.display,
                fontWeight: 600,
                fontSize: 34,
                color,
                letterSpacing: `${lerp(1.2, 0.42, prog(f, 14, 60))}em`,
                opacity: prog(f, 14, 40),
                whiteSpace: 'nowrap',
              }}
            >
              {en}
            </span>
          </div>
          {/* topics */}
          <div style={{display: 'flex', gap: 14, marginTop: 44, flexWrap: 'wrap', width: 1000}}>
            {topics.map((tp, i) => {
              const a = clamp01((f - 44 - i * 6) / 20);
              const s = eBack(a);
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 26,
                    fontWeight: 500,
                    color: COL.text,
                    padding: '8px 20px',
                    borderRadius: 10,
                    background: 'rgba(12,18,34,0.75)',
                    border: `1px solid ${rgba(color, 0.45)}`,
                    opacity: clamp01(a * 2),
                    transform: `translateY(${(1 - s) * 24}px) scale(${lerp(0.8, 1, s)})`,
                  }}
                >
                  {tp}
                </span>
              );
            })}
          </div>
        </div>
        {/* quote */}
        <div
          style={{
            position: 'absolute',
            right: 150,
            bottom: 120,
            textAlign: 'right',
            opacity: prog(f, 80, 50),
            transform: `translateY(${(1 - prog(f, 80, 60)) * 20}px)`,
          }}
        >
          <div style={{fontFamily: FONT.serif, fontWeight: 600, fontSize: 40, color: COL.text, letterSpacing: '0.08em'}}>
            <span style={{color, fontSize: 56, marginRight: 8}}>“</span>
            {quote}
            <span style={{color, fontSize: 56, marginLeft: 8}}>”</span>
          </div>
          <div style={{fontFamily: FONT.tech, fontSize: 24, color: COL.sub, letterSpacing: '0.2em', marginTop: 6}}>—— {by}</div>
        </div>
      </AbsoluteFill>
      {/* scan line sweep */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lerp(-200, 1200, eOut(clamp01(f / 70))),
          height: 160,
          background: `linear-gradient(to bottom, transparent, ${rgba(color, 0.14)}, transparent)`,
          opacity: 1 - clamp01(f / 70),
        }}
      />
    </AbsoluteFill>
  );
};
