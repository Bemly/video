import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, COL, eBack, eIn, eInOut, eOut, FONT, lerp, prog, rgba} from '../theme';
import {useF} from './Shot';

export type Seg = string | {t: string; c?: string; m?: boolean};
export type Cue = [number, string, number?];

export type ProblemProps = {
  no: number;
  color: string;
  tag: string;
  title: string;
  q: Seg[][];
  options?: string[];
  answer?: number;
  answerText?: string;
  brief: string;
  card?: number;
  steps?: {at: number; label: string}[];
  reveal: number;
  insight?: string;
  children: (sf: number) => React.ReactNode;
};

export const CARD = 330;

export const probCues = (p: {card?: number; reveal: number; steps?: {at: number}[]}, extra: Cue[] = []): Cue[] => {
  const card = p.card ?? CARD;
  return [
    [8, 'stamp'],
    [card - 6, 'whoosh'],
    ...(p.steps ?? []).map((s): Cue => [card + s.at, 'step']),
    [card + p.reveal, 'reveal'],
    ...extra.map((c): Cue => [c[0] + card, c[1], c[2]]),
  ];
};

export const Seal: React.FC<{size: number; text?: string; rot?: number}> = ({size, text = '难题', rot = -6}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.12,
      background: 'linear-gradient(145deg, #e0454b, #b3212a)',
      boxShadow: `0 0 ${size * 0.4}px rgba(224,69,75,0.55), inset 0 0 ${size * 0.15}px rgba(0,0,0,0.35)`,
      border: `${Math.max(1.5, size * 0.04)}px solid rgba(255,225,215,0.85)`,
      transform: `rotate(${rot}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        fontFamily: FONT.serif,
        fontWeight: 900,
        color: '#fff4ee',
        fontSize: text.length > 1 ? size * 0.36 : size * 0.62,
        lineHeight: 1.02,
        width: text.length > 1 ? size * 0.4 : undefined,
        textAlign: 'center',
        letterSpacing: 0,
        wordBreak: 'break-all',
      }}
    >
      {text}
    </div>
  </div>
);

const Q: React.FC<{segs: Seg[]; color: string; f: number; at: number}> = ({segs, color, f, at}) => {
  const a = prog(f, at, 26);
  const hl = prog(f, at + 16, 30, eInOut);
  return (
    <div
      style={{
        opacity: a,
        transform: `translateY(${(1 - a) * 18}px)`,
        filter: `blur(${(1 - a) * 6}px)`,
        fontFamily: FONT.sans,
        fontSize: 33,
        lineHeight: '58px',
        color: '#dde6f6',
        letterSpacing: '0.02em',
      }}
    >
      {segs.map((s, i) => {
        if (typeof s === 'string') return <span key={i}>{s}</span>;
        const c = s.c ?? color;
        return (
          <span
            key={i}
            style={{
              color: c,
              fontFamily: s.m ? FONT.mono : undefined,
              fontWeight: 700,
              backgroundImage: `linear-gradient(transparent 64%, ${rgba(c, 0.3)} 64%)`,
              backgroundSize: `${hl * 100}% 100%`,
              backgroundRepeat: 'no-repeat',
              padding: '0 3px',
            }}
          >
            {s.t}
          </span>
        );
      })}
    </div>
  );
};

export const Problem: React.FC<ProblemProps> = (p) => {
  const f = useF();
  const card = p.card ?? CARD;
  const sf = f - card;
  const k = prog(f, card - 8, 42, eInOut);
  const cin = prog(f, 0, 28);
  const stamp = clamp01((f - 8) / 16);
  const nlines = p.q.length;
  const optAt = 30 + nlines * 12 + 10;
  const revealed = sf >= p.reveal;
  const rv = prog(sf, p.reveal, 30);
  const rvPop = eBack(clamp01((sf - p.reveal) / 22));
  const noTxt = String(p.no).padStart(2, '0');
  const answerLabel =
    p.options && p.answer !== undefined ? `${'ABCD'[p.answer]}. ${p.options[p.answer]}` : p.answerText ?? '';
  const curStep = p.steps ? p.steps.reduce((acc, s, i) => (sf >= s.at ? i : acc), -1) : -1;

  return (
    <AbsoluteFill>
      {/* stage */}
      {f > card - 40 && (
        <AbsoluteFill style={{opacity: prog(f, card - 24, 40), transform: `scale(${lerp(0.93, 1, prog(f, card - 24, 60))})`}}>
          {p.children(sf)}
        </AbsoluteFill>
      )}
      {/* dim + card */}
      {k < 1 && (
        <>
          <AbsoluteFill style={{background: 'rgba(2,4,10,0.5)', opacity: (1 - k) * cin}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                width: 1420,
                padding: '44px 64px 48px',
                borderRadius: 28,
                background: 'linear-gradient(160deg, rgba(22,30,52,0.94), rgba(8,12,24,0.96))',
                backgroundImage: `linear-gradient(160deg, rgba(22,30,52,0.94), rgba(8,12,24,0.96)), repeating-linear-gradient(0deg, ${rgba(p.color, 0.05)} 0 1px, transparent 1px 58px)`,
                border: `1.5px solid ${rgba(p.color, 0.45)}`,
                boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 60px ${rgba(p.color, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                opacity: cin * (1 - k),
                transform: `translateY(${(1 - cin) * 40 - k * 80}px) scale(${lerp(0.94, 1, cin) * lerp(1, 0.9, k)})`,
                filter: `blur(${k * 10 + (1 - cin) * 8}px)`,
                position: 'relative',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
                <div
                  style={{
                    transform: `scale(${lerp(2.6, 1, eOut(stamp))}) rotate(${lerp(-30, 0, eOut(stamp))}deg)`,
                    opacity: clamp01(stamp * 3),
                    position: 'relative',
                  }}
                >
                  <Seal size={84} />
                  {stamp > 0 && stamp < 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 42 - 60 * stamp - 20,
                        top: 42 - 60 * stamp - 20,
                        width: 120 * stamp + 40,
                        height: 120 * stamp + 40,
                        borderRadius: '50%',
                        border: `3px solid rgba(255,120,110,${1 - stamp})`,
                      }}
                    />
                  )}
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4, opacity: prog(f, 12, 24)}}>
                  <div style={{fontFamily: FONT.sans, fontSize: 22, letterSpacing: '0.4em', color: COL.sub}}>408 经典难题</div>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
                    <span style={{fontFamily: FONT.hero, fontWeight: 800, fontSize: 40, color: p.color}}>No.{noTxt}</span>
                    <span style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 54, color: '#fff', textShadow: `0 0 30px ${rgba(p.color, 0.5)}`}}>
                      {p.title}
                    </span>
                  </div>
                </div>
                <div style={{flex: 1}} />
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 24,
                    color: p.color,
                    border: `1.5px solid ${rgba(p.color, 0.6)}`,
                    borderRadius: 999,
                    padding: '6px 20px',
                    background: rgba(p.color, 0.1),
                    opacity: prog(f, 18, 24),
                  }}
                >
                  {p.tag}
                </span>
              </div>
              <div
                style={{
                  height: 2,
                  margin: '28px 0 22px',
                  width: `${prog(f, 16, 40) * 100}%`,
                  background: `linear-gradient(90deg, ${p.color}, ${rgba(p.color, 0.1)})`,
                  boxShadow: `0 0 12px ${p.color}`,
                }}
              />
              {p.q.map((line, i) => (
                <Q key={i} segs={line} color={p.color} f={f} at={30 + i * 12} />
              ))}
              {p.options && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px', marginTop: 24}}>
                  {p.options.map((o, i) => {
                    const a = eBack(clamp01((f - optAt - i * 5) / 20));
                    return (
                      <div
                        key={i}
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 30,
                          color: '#fff',
                          padding: '10px 22px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          opacity: clamp01(a * 2),
                          transform: `translateX(${(1 - a) * 30}px)`,
                        }}
                      >
                        <b style={{fontFamily: FONT.hero, color: p.color, marginRight: 16}}>{'ABCD'[i]}</b>
                        {o}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* reading progress */}
              <div style={{position: 'absolute', left: 0, bottom: 0, height: 4, borderRadius: 2, width: `${clamp01(f / (card - 10)) * 100}%`, background: rgba(p.color, 0.6)}} />
            </div>
          </AbsoluteFill>
        </>
      )}
      {/* banner */}
      {k > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 104,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 26px 8px 10px',
            borderRadius: 999,
            background: 'rgba(8,12,24,0.78)',
            border: `1px solid ${rgba(p.color, 0.4)}`,
            opacity: k,
            transform: `translateY(${(1 - k) * -20}px)`,
            maxWidth: 1700,
          }}
        >
          <Seal size={40} text="题" rot={0} />
          <span style={{fontFamily: FONT.hero, fontWeight: 800, fontSize: 22, color: p.color}}>No.{noTxt}</span>
          <span style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, color: '#fff'}}>{p.title}</span>
          <span style={{width: 1.5, height: 22, background: rgba('#ffffff', 0.25)}} />
          <span style={{fontFamily: FONT.sans, fontSize: 23, color: COL.sub, whiteSpace: 'nowrap'}}>{p.brief}</span>
        </div>
      )}
      {/* stepper */}
      {p.steps && k > 0 && (
        <div style={{position: 'absolute', left: 104, bottom: 54, display: 'flex', alignItems: 'center', gap: 14, opacity: k}}>
          {p.steps.map((s, i) => {
            const on = i === curStep && !revealed;
            const done = i < curStep || revealed;
            const a = eBack(clamp01((sf - s.at + 6) / 16));
            return (
              <React.Fragment key={i}>
                {i > 0 && <span style={{width: 28, height: 2, background: done || on ? p.color : 'rgba(255,255,255,0.18)'}} />}
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontWeight: on ? 800 : 500,
                    fontSize: 25,
                    color: on ? '#04101a' : done ? '#fff' : COL.dim,
                    background: on ? p.color : done ? rgba(p.color, 0.18) : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${on || done ? p.color : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: 999,
                    padding: '6px 18px',
                    boxShadow: on ? `0 0 24px ${rgba(p.color, 0.7)}` : undefined,
                    transform: `scale(${on ? lerp(1.15, 1.04, a) : 1})`,
                  }}
                >
                  {'①②③④⑤⑥⑦⑧'[i]} {s.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}
      {/* answer */}
      {revealed && (
        <>
          <AbsoluteFill style={{background: `radial-gradient(circle at 80% 85%, ${rgba(p.color, 0.35)}, transparent 55%)`, opacity: (1 - rv) * 0.9}} />
          <div
            style={{
              position: 'absolute',
              right: 104,
              bottom: 50,
              padding: '18px 34px 20px',
              borderRadius: 22,
              background: 'linear-gradient(150deg, rgba(20,28,48,0.95), rgba(8,12,24,0.95))',
              border: `2px solid ${p.color}`,
              boxShadow: `0 0 ${60 * (1 - rv) + 30}px ${rgba(p.color, 0.55)}`,
              transform: `scale(${lerp(0.5, 1, rvPop)})`,
              transformOrigin: '100% 100%',
              opacity: clamp01(rvPop * 2),
              maxWidth: 1000,
            }}
          >
            <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
              <span style={{fontFamily: FONT.sans, fontSize: 24, letterSpacing: '0.3em', color: p.color}}>答案</span>
              <span style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: `0 0 24px ${rgba(p.color, 0.8)}`}}>{answerLabel}</span>
            </div>
            {p.insight && (
              <div style={{fontFamily: FONT.sans, fontSize: 25, color: COL.sub, marginTop: 6, opacity: prog(sf, p.reveal + 14, 24)}}>{p.insight}</div>
            )}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const _u = eIn;
