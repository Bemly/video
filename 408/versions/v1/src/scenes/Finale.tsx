import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ShotCtx, useF} from '../components/Shot';
import {clamp01, COL, eBack, eIn, eInOut, eOut, FONT, lerp, prog, rgba} from '../theme';
import {DSGraph} from './DS';
import {COPipeline} from './CO';
import {OSPV} from './OS';
import {CNGlobe} from './CN';

const WORDS: [string, string, string, string][] = [
  ['链表', 'LINKED LIST', COL.ds, '数据结构'],
  ['二叉树', 'BINARY TREE', COL.ds, '数据结构'],
  ['图', 'GRAPH', COL.ds, '数据结构'],
  ['排序', 'SORTING', COL.ds, '数据结构'],
  ['浮点数', 'IEEE 754', COL.co, '计算机组成原理'],
  ['流水线', 'PIPELINE', COL.co, '计算机组成原理'],
  ['Cache', 'CACHE', COL.co, '计算机组成原理'],
  ['中断', 'INTERRUPT', COL.co, '计算机组成原理'],
  ['进程', 'PROCESS', COL.os, '操作系统'],
  ['信号量', 'SEMAPHORE', COL.os, '操作系统'],
  ['分页', 'PAGING', COL.os, '操作系统'],
  ['死锁', 'DEADLOCK', COL.os, '操作系统'],
  ['封装', 'ENCAPSULATION', COL.cn, '计算机网络'],
  ['握手', 'HANDSHAKE', COL.cn, '计算机网络'],
  ['拥塞', 'CONGESTION', COL.cn, '计算机网络'],
  ['路由', 'ROUTING', COL.cn, '计算机网络'],
];
const STEP = 15;

const PANELS = [
  {C: DSGraph, k: 300, c: COL.ds, t: '01 数据结构', x: 140, y: 70, dx: -1, dy: -1},
  {C: COPipeline, k: 150, c: COL.co, t: '02 计算机组成原理', x: 980, y: 70, dx: 1, dy: -1},
  {C: OSPV, k: 110, c: COL.os, t: '03 操作系统', x: 140, y: 560, dx: -1, dy: 1},
  {C: CNGlobe, k: 110, c: COL.cn, t: '04 计算机网络', x: 980, y: 560, dx: 1, dy: 1},
];
const PW = 800;
const PH = 450;

export const Montage: React.FC = () => {
  const f = useF();
  const wi = Math.floor(f / STEP);
  const wl = f - wi * STEP;
  const word = f >= 0 && f < WORDS.length * STEP ? WORDS[wi] : null;
  const shake = word ? (1 - clamp01(wl / 8)) * 6 : 0;

  return (
    <AbsoluteFill>
      {word && (
        <AbsoluteFill style={{transform: `translate(${Math.sin(f * 3.1) * shake}px, ${Math.cos(f * 2.7) * shake}px)`}}>
          {/* burst rays */}
          <div
            style={{
              position: 'absolute',
              left: 960 - 1200,
              top: 540 - 1200,
              width: 2400,
              height: 2400,
              background: `repeating-conic-gradient(from ${wi * 17 + f * 0.4}deg at 50% 50%, ${rgba(word[2], 0.22)} 0deg 2deg, transparent 2deg 11deg)`,
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 8%, black 18%, transparent 58%)',
              transform: `scale(${lerp(0.8, 1.15, wl / STEP)})`,
            }}
          />
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${rgba(word[2], 0.25 * (1 - wl / STEP))} 0%, transparent 55%)`}} />
          {/* echo */}
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                fontFamily: /^[A-Za-z]/.test(word[0]) ? FONT.hero : FONT.serif,
                fontWeight: 900,
                fontSize: 300,
                color: 'transparent',
                WebkitTextStroke: `2px ${rgba(word[2], 0.4)}`,
                transform: `scale(${lerp(1.2, 1.7, eOut(wl / STEP))})`,
                opacity: 1 - wl / STEP,
              }}
            >
              {word[0]}
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <div style={{fontFamily: FONT.sans, fontSize: 26, letterSpacing: '0.5em', color: word[2], marginBottom: 10}}>{word[3]}</div>
            <div
              style={{
                fontFamily: /^[A-Za-z]/.test(word[0]) ? FONT.hero : FONT.serif,
                fontWeight: 900,
                fontSize: /^[A-Za-z]/.test(word[0]) ? 210 : 250,
                lineHeight: 1.1,
                color: '#fff',
                transform: `scale(${lerp(1.22, 1, eOut(clamp01(wl / 10)))})`,
                filter: `blur(${(1 - clamp01(wl / 5)) * 8}px)`,
                textShadow: `0 0 40px ${word[2]}, 0 0 100px ${rgba(word[2], 0.6)}`,
              }}
            >
              {word[0]}
            </div>
            <div style={{fontFamily: FONT.display, fontSize: 30, letterSpacing: '0.6em', color: rgba('#ffffff', 0.8), marginTop: 18}}>{word[1]}</div>
          </AbsoluteFill>
          <div style={{position: 'absolute', right: 110, bottom: 80, fontFamily: FONT.display, fontSize: 28, color: word[2], letterSpacing: '0.2em'}}>
            {String(wi + 1).padStart(2, '0')} / 16
          </div>
        </AbsoluteFill>
      )}

      {f >= 236 &&
        PANELS.map((p, i) => {
          const fin = eBack(clamp01((f - 240 - i * 7) / 34));
          const fa = clamp01((f - 240 - i * 7) / 12);
          const out = prog(f, 404, 70, eIn);
          const cx = p.x + PW / 2;
          const cy = p.y + PH / 2;
          const tx = (1 - fin) * p.dx * 700 + (960 - cx) * out;
          const ty = (1 - fin) * p.dy * 420 + (540 - cy) * out;
          const sc = lerp(1, 0.05, out);
          const orb = prog(f, 440, 30);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: PW,
                height: PH,
                transform: `perspective(1400px) translate(${tx}px, ${ty}px) rotateY(${(1 - fin) * p.dx * -35}deg) rotateX(${(1 - fin) * p.dy * 20}deg) scale(${sc}) rotate(${out * p.dx * p.dy * 90}deg)`,
                opacity: fa,
                borderRadius: lerp(18, PW, orb),
                overflow: 'hidden',
                border: `2px solid ${p.c}`,
                boxShadow: `0 0 ${30 + orb * 120}px ${rgba(p.c, 0.6 + orb * 0.4)}, inset 0 0 40px ${rgba(p.c, 0.2)}`,
                background: `radial-gradient(circle at 50% 40%, ${rgba(p.c, 0.18)} 0%, #03060d 70%)`,
              }}
            >
              <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${PW / 1920})`, transformOrigin: '0 0'}}>
                <ShotCtx.Provider value={{offset: 240 - p.k, dur: 600, mini: true}}>
                  <p.C />
                </ShotCtx.Provider>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 18,
                  top: 14,
                  fontFamily: FONT.sans,
                  fontWeight: 700,
                  fontSize: 24,
                  color: '#fff',
                  padding: '4px 14px',
                  borderRadius: 8,
                  background: rgba(p.c, 0.3),
                  border: `1px solid ${p.c}`,
                }}
              >
                {p.t}
              </div>
              <AbsoluteFill style={{background: p.c, opacity: orb}} />
            </div>
          );
        })}
      {f > 250 && f < 420 && (
        <div
          style={{
            position: 'absolute',
            width: 1920,
            top: 518,
            textAlign: 'center',
            fontFamily: FONT.hero,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: '0.4em',
            color: '#fff',
            opacity: prog(f, 290, 20) * (1 - prog(f, 390, 20)),
            textShadow: '0 0 20px rgba(150,190,255,0.9)',
          }}
        >
          408
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ============================ Logo ============================ */

const SUBJ = [
  {t: '数据结构', s: 45, c: COL.ds},
  {t: '计算机组成原理', s: 45, c: COL.co},
  {t: '操作系统', s: 35, c: COL.os},
  {t: '计算机网络', s: 25, c: COL.cn},
];

export const Logo: React.FC = () => {
  const f = useF();
  const R = 330;
  const CY = 470;
  const up = prog(f, 300, 70, eInOut);
  const fade = 1 - prog(f, 640, 70, eIn);
  const logoIn = prog(f, 0, 40);
  const rot = f * 0.05;
  const arcLen = (2 * Math.PI * R * 80) / 360;
  const circ = 2 * Math.PI * R;

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <AbsoluteFill style={{transform: `translateY(${-150 * up}px) scale(${lerp(1, 0.66, up)})`, transformOrigin: `960px ${CY}px`}}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>
            <filter id="lg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* shockwave */}
          {f < 60 && <circle cx={960} cy={CY} r={lerp(40, 1100, eOut(f / 60))} fill="none" stroke="#fff" strokeWidth={lerp(24, 1, f / 60)} opacity={1 - f / 60} />}
          {/* ticks */}
          <g transform={`rotate(${-rot * 1.4} 960 ${CY})`} opacity={prog(f, 10, 40) * 0.6}>
            {new Array(120).fill(0).map((_, i) => {
              const a = (i / 120) * Math.PI * 2;
              const r0 = R + 40;
              const r1 = R + (i % 10 === 0 ? 62 : 50);
              return <line key={i} x1={960 + Math.cos(a) * r0} y1={CY + Math.sin(a) * r0} x2={960 + Math.cos(a) * r1} y2={CY + Math.sin(a) * r1} stroke="#9ec5ff" strokeWidth={i % 10 === 0 ? 2.5 : 1.2} />;
            })}
          </g>
          <circle cx={960} cy={CY} r={R - 34} fill="none" stroke={rgba('#9ec5ff', 0.25)} strokeWidth={1.5} strokeDasharray="3 9" transform={`rotate(${rot * 2} 960 ${CY})`} />
          {/* four arcs */}
          <g transform={`rotate(${rot - 90 + 5} 960 ${CY})`}>
            {SUBJ.map((s, i) => {
              const g = eInOut(clamp01((f - 6 - i * 8) / 50));
              return (
                <circle
                  key={i}
                  cx={960}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={s.c}
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeDasharray={`${arcLen * g} ${circ}`}
                  transform={`rotate(${i * 90} 960 ${CY})`}
                  filter="url(#lg)"
                />
              );
            })}
          </g>
        </svg>
        {/* 408 */}
        <div
          style={{
            position: 'absolute',
            width: 1920,
            top: CY - 150,
            height: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: FONT.hero,
            fontWeight: 900,
            fontSize: 250,
            letterSpacing: '-0.02em',
            color: '#f4f8ff',
            transform: `scale(${lerp(1.5, 1, logoIn)})`,
            filter: `blur(${(1 - logoIn) * 20}px)`,
            opacity: logoIn,
            textShadow: `-6px 0 30px ${rgba(COL.ds, 0.8)}, 6px 0 30px ${rgba(COL.os, 0.8)}, 0 -6px 30px ${rgba(COL.co, 0.6)}, 0 6px 30px ${rgba(COL.cn, 0.6)}, 0 0 90px rgba(160,200,255,0.8)`,
          }}
        >
          408
        </div>
        {/* subject labels around ring */}
        {SUBJ.map((s, i) => {
          const ang = ((-90 + 5 + 40 + i * 90 + rot) * Math.PI) / 180;
          const x = 960 + Math.cos(ang) * (R + 130);
          const y = CY + Math.sin(ang) * (R + 110);
          const a = eBack(clamp01((f - 50 - i * 10) / 24));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - 160,
                top: y - 34,
                width: 320,
                textAlign: 'center',
                opacity: clamp01(a * 2) * (1 - up),
                transform: `scale(${lerp(0.6, 1, a)})`,
              }}
            >
              <div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: `0 0 18px ${s.c}`}}>{s.t}</div>
              <div style={{fontFamily: FONT.display, fontSize: 22, color: s.c, letterSpacing: '0.2em'}}>{s.s} 分</div>
            </div>
          );
        })}
      </AbsoluteFill>
      {/* sum */}
      <div
        style={{
          position: 'absolute',
          width: 1920,
          top: 930,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontSize: 36,
          letterSpacing: '0.15em',
          color: '#fff',
          opacity: prog(f, 120, 30) * (1 - prog(f, 290, 30)),
        }}
      >
        {SUBJ.map((s, i) => (
          <span key={i}>
            <span style={{color: s.c}}>{s.s}</span>
            {i < 3 ? ' + ' : ''}
          </span>
        ))}
        <span> = </span>
        <span style={{fontSize: 48, fontWeight: 900, textShadow: '0 0 20px #9ec5ff'}}>150</span>
      </div>
      {/* taglines */}
      {[
        {t: '从比特到网络，从算法到系统', at: 350, y: 640, s: 50, w: 800, ff: FONT.serif, c: '#fff'},
        {t: '一张试卷，装下一个完整的计算机世界', at: 395, y: 720, s: 32, w: 500, ff: FONT.sans, c: COL.sub},
      ].map((l, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 1920,
            top: l.y,
            textAlign: 'center',
            fontFamily: l.ff,
            fontWeight: l.w,
            fontSize: l.s,
            color: l.c,
            letterSpacing: `${lerp(0.5, 0.18, prog(f, l.at, 80))}em`,
            opacity: prog(f, l.at, 40),
            filter: `blur(${(1 - prog(f, l.at, 30)) * 10}px)`,
          }}
        >
          {l.t}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          width: 1920,
          top: 820,
          textAlign: 'center',
          fontFamily: FONT.serif,
          fontWeight: 900,
          fontSize: 88,
          color: '#fff',
          letterSpacing: `${lerp(0.6, 0.22, prog(f, 450, 90))}em`,
          opacity: prog(f, 450, 40),
          transform: `scale(${lerp(1.15, 1, prog(f, 450, 60))})`,
          textShadow: '0 0 30px rgba(255,214,120,0.8), 0 0 80px rgba(255,190,90,0.5)',
        }}
      >
        所有努力，终将上岸
      </div>
      <div
        style={{
          position: 'absolute',
          width: 1920,
          top: 960,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontSize: 22,
          letterSpacing: '0.6em',
          color: COL.sub,
          opacity: prog(f, 500, 40),
        }}
      >
        408 · 计算机学科专业基础 · 致每一位考研人
      </div>
    </AbsoluteFill>
  );
};
