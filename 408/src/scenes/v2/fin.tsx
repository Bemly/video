import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Cue} from '../../components/Problem';
import {ShotCtx, useF} from '../../components/Shot';
import {clamp01, COL, eBack, eIn, eOut, FONT, lerp, prog, rgba} from '../../theme';
import {DSHuffman, DSKmp, DSRelink} from './ds_a';
import {DSHash} from './ds_b';
import {COAdder, COMatrix} from './co';
import {OSInode, OSReplace} from './os';
import {CNWeb} from './cn';

const WORDS: [string, string, string][] = [
  ['链表', 'LINKED LIST', COL.ds],
  ['卡特兰', 'CATALAN', COL.ds],
  ['KMP', 'PATTERN', COL.ds],
  ['二叉树', 'BINARY TREE', COL.ds],
  ['AVL', 'BALANCE', COL.ds],
  ['关键路径', 'CRITICAL PATH', COL.ds],
  ['散列', 'HASHING', COL.ds],
  ['B 树', 'B-TREE', COL.ds],
  ['补码', "TWO'S COMPLEMENT", COL.co],
  ['浮点数', 'IEEE 754', COL.co],
  ['Cache', 'CACHE', COL.co],
  ['TLB', 'VIRTUAL MEMORY', COL.co],
  ['数据通路', 'DATAPATH', COL.co],
  ['流水线', 'PIPELINE', COL.co],
  ['冒险', 'HAZARD', COL.co],
  ['DMA', 'I/O', COL.co],
  ['系统调用', 'SYSCALL', COL.os],
  ['进程', 'PROCESS', COL.os],
  ['调度', 'SCHEDULING', COL.os],
  ['信号量', 'SEMAPHORE', COL.os],
  ['死锁', 'DEADLOCK', COL.os],
  ['银行家', "BANKER'S", COL.os],
  ['页面置换', 'REPLACEMENT', COL.os],
  ['磁盘调度', 'DISK', COL.os],
  ['香农', 'SHANNON', COL.cn],
  ['CSMA/CD', 'ETHERNET', COL.cn],
  ['滑动窗口', 'SLIDING WINDOW', COL.cn],
  ['子网', 'SUBNET', COL.cn],
  ['分片', 'FRAGMENT', COL.cn],
  ['握手', 'HANDSHAKE', COL.cn],
  ['拥塞', 'CONGESTION', COL.cn],
  ['DNS', 'NAME SYSTEM', COL.cn],
];
const STEP = 15;
const PANEL_T0 = 480;

const PANELS: {C: React.FC; k: number; c: string; t: string}[] = [
  {C: DSRelink, k: 330 + 1000, c: COL.ds, t: '链表重排'},
  {C: DSKmp, k: 360 + 900, c: COL.ds, t: 'KMP'},
  {C: DSHash, k: 380 + 500, c: COL.ds, t: '散列表'},
  {C: COAdder, k: 620, c: COL.co, t: '加法器'},
  {C: COMatrix, k: 380 + 200, c: COL.co, t: 'Cache 命中率'},
  {C: DSHuffman, k: 420, c: COL.ds, t: '哈夫曼树'},
  {C: OSReplace, k: 400 + 300, c: COL.os, t: '页面置换'},
  {C: OSInode, k: 380 + 560, c: COL.os, t: '混合索引'},
  {C: CNWeb, k: 400 + 400, c: COL.cn, t: '一次网页访问'},
];
const PW = 580;
const PH = 326;

export const Montage2: React.FC = () => {
  const f = useF();
  const wi = Math.floor(f / STEP);
  const wl = f - wi * STEP;
  const word = f >= 0 && wi < WORDS.length ? WORDS[wi] : null;
  const shake = word ? (1 - clamp01(wl / 8)) * 6 : 0;
  const latin = (s: string) => /^[A-Za-z]/.test(s);
  return (
    <AbsoluteFill>
      {word && (
        <AbsoluteFill style={{transform: `translate(${Math.sin(f * 3.1) * shake}px, ${Math.cos(f * 2.7) * shake}px)`}}>
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
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <div
              style={{
                fontFamily: latin(word[0]) ? FONT.hero : FONT.serif,
                fontWeight: 900,
                fontSize: latin(word[0]) ? 190 : word[0].length > 3 ? 200 : 240,
                lineHeight: 1.1,
                color: '#fff',
                transform: `scale(${lerp(1.22, 1, eOut(clamp01(wl / 10)))})`,
                filter: `blur(${(1 - clamp01(wl / 5)) * 8}px)`,
                textShadow: `0 0 40px ${word[2]}, 0 0 100px ${rgba(word[2], 0.6)}`,
              }}
            >
              {word[0]}
            </div>
            <div style={{fontFamily: FONT.display, fontSize: 28, letterSpacing: '0.6em', color: rgba('#ffffff', 0.8), marginTop: 18}}>{word[1]}</div>
          </AbsoluteFill>
          <div style={{position: 'absolute', right: 110, bottom: 80, fontFamily: FONT.display, fontSize: 26, color: word[2], letterSpacing: '0.2em'}}>
            {String(wi + 1).padStart(2, '0')} / {WORDS.length}
          </div>
        </AbsoluteFill>
      )}
      {f >= PANEL_T0 - 4 &&
        PANELS.map((p, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 60 + col * (PW + 30);
          const y = 40 + row * (PH + 30);
          const fin = eBack(clamp01((f - PANEL_T0 - i * 5) / 30));
          const out = prog(f, 860, 90, eIn);
          const cx = x + PW / 2;
          const cy = y + PH / 2;
          const dx = (col - 1) * 900;
          const dy = (row - 1) * 600;
          const tx = (1 - fin) * dx + (960 - cx) * out;
          const ty = (1 - fin) * dy + (540 - cy) * out;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: PW,
                height: PH,
                transform: `translate(${tx}px, ${ty}px) scale(${lerp(1, 0.05, out)}) rotate(${out * 180}deg)`,
                opacity: clamp01((f - PANEL_T0 - i * 5) / 12),
                borderRadius: lerp(16, PW, prog(f, 900, 40)),
                overflow: 'hidden',
                border: `2px solid ${p.c}`,
                boxShadow: `0 0 30px ${rgba(p.c, 0.55)}`,
                background: `radial-gradient(circle at 50% 40%, ${rgba(p.c, 0.16)} 0%, #03060d 70%)`,
              }}
            >
              <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${PW / 1920})`, transformOrigin: '0 0'}}>
                <ShotCtx.Provider value={{offset: PANEL_T0 - p.k, dur: 900, mini: true}}>
                  <p.C />
                </ShotCtx.Provider>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 12,
                  fontFamily: FONT.sans,
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#fff',
                  padding: '3px 12px',
                  borderRadius: 8,
                  background: rgba(p.c, 0.35),
                  border: `1px solid ${p.c}`,
                }}
              >
                {p.t}
              </div>
              <AbsoluteFill style={{background: p.c, opacity: prog(f, 900, 40)}} />
            </div>
          );
        })}
    </AbsoluteFill>
  );
};

export const Montage2Cues: Cue[] = [
  ...WORDS.map((_, i): Cue => [i * STEP, 'stab', i]),
  ...PANELS.map((_, i): Cue => [PANEL_T0 + i * 5, 'whoosh']),
  [860, 'riser2'],
];
