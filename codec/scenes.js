// 2D overlay + panel/effect configuration for each scene.
(function(){
const FONT = '"PingFang SC","Hiragino Sans GB","Heiti SC",sans-serif';
const MONO = '"SF Mono","Menlo",monospace';
const COL = { I: '#ff4d5e', P: '#3d8bff', B: '#2fd27a', txt: '#e8eef8', dim: '#8a97ad', faint: '#3a4660' };
const CODEC = {
  h263:  { name: 'H.263', year: '1996 · ITU-T VCEG', acc: '#8fb3ff',
    pain: 'PSTN / 3G 可视电话：几十 kbps 带宽，延迟就是一切',
    base: 'Baseline：仅 I/P · 半像素 MV · 固定尺寸 SQCIF~16CIF',
    tune: 'H.263+ Annex D(UMV) / F(OBMC) / J(去块) · CBR 64k~1M · 无 B 帧',
    paper: 'Rijkse, "H.263: Video Coding for Low-Bit-Rate Communication", IEEE Commun. Mag., 1996' },
  mpeg2: { name: 'MPEG-2 / H.262', year: '1995 · ISO/IEC 13818-2', acc: '#c0a0ff',
    pain: 'DVD 与数字电视：标清广播、隔行扫描',
    base: '档次 × 级别：Main@ML = DVD 720×576 · 4:2:2P = 演播室',
    tune: 'CBR ≤ 9.8 Mbps（DVD 总线）· GOP 12 IBBP · VBV 1835k',
    paper: 'ISO/IEC 13818-2 (1995) · Haskell, Puri & Netravali, "Digital Video: An Introduction to MPEG-2"' },
  vp6:   { name: 'VP6', year: '2003 · On2 → Flash Video', acc: '#ff9f43',
    pain: '浏览器内播放：弱 CPU 也要解得动',
    base: 'VP6-E 默认 · VP6-S 低解码复杂度 · VP6A 带 alpha',
    tune: '2-pass VBR：min section 40% / max 400% · bpp < 0.07 自动丢帧',
    paper: 'EE Times, "The On2 VP6 codec: how it works" · Zencoder VP6 settings' },
  theora:{ name: 'Theora', year: '2004 · Xiph.Org（源自 VP3.2）', acc: '#7bd88f',
    pain: '完全开放、免专利费的 Web 视频',
    base: '无档次体系 · 仅 4:2:0 · 8×8 DCT · 无 B 帧 · 无标准环路滤波',
    tune: '-q:v 0~10（×6.3 → 0~63）或 目标码率；低码率块效应明显',
    paper: 'Xiph.Org, "Theora Specification" (2004–2011)' },
  avc:   { name: 'H.264 / AVC', year: '2003 · JVT (ITU-T + MPEG)', acc: '#4da3ff',
    pain: '同画质码率减半：网络、广播、蓝光通吃',
    base: 'Baseline · Main · High · High10 · High 4:2:2 · High 4:4:4',
    tune: 'CRF · preset · tune · VBV · mb-tree',
    paper: 'Wiegand et al., IEEE TCSVT 2003 · Marpe et al., "CABAC", IEEE TCSVT 2003' },
  vp8:   { name: 'VP8', year: '2010 · Google (WebM)', acc: '#ffcc4d',
    pain: '免专利费的 HTML5 视频',
    base: 'profile 0~3 = 解码复杂度递减 · WebM 推荐 0',
    tune: 'AltRef + lag-in-frames 25 · 直播 CBR 关闭 AltRef',
    paper: 'Bankoski et al., "Technical Overview of VP8", ICME 2011' },
  hevc:  { name: 'H.265 / HEVC', year: '2013 · JCT-VC', acc: '#3dd6c6',
    pain: '4K / HDR 带来的码率爆炸',
    base: 'Main · Main10 · RExt（4:2:2 / 4:4:4 / 12 bit）',
    tune: 'x265 CRF 28 · preset · tune grain · AQ / cutree',
    paper: 'Sullivan, Ohm, Han & Wiegand, "Overview of the HEVC Standard", IEEE TCSVT 2012' },
  vp9:   { name: 'VP9', year: '2013 · Google', acc: '#ffd166',
    pain: 'YouTube 规模的免版税高清 / 4K',
    base: 'profile 0/1/2/3 = 采样(4:2:0/4:4:4) × 位深(8/10-12)',
    tune: 'tile 并行（码率 +1~3%）· row-mt 免费 · CQ / 2-pass VBR',
    paper: 'Mukherjee et al., "The latest open-source video codec VP9", PCS 2013' },
  av1:   { name: 'AV1', year: '2018 · AOMedia', acc: '#ff6b9a',
    pain: '免版税，且效率超越 HEVC',
    base: 'Main · High · Professional',
    tune: 'SVT-AV1 preset 0~13 · tune 0=VQ / 1=PSNR · film-grain',
    paper: 'Han et al., "A Technical Overview of AV1", Proc. IEEE 2021' },
  vvc:   { name: 'H.266 / VVC', year: '2020 · JVET', acc: '#5ce1e6',
    pain: '8K、360°、HDR、屏幕内容、自适应流',
    base: 'Main10 · Main10 4:4:4 · Multilayer Main10',
    tune: 'VVenC faster…slower · qpa 感知量化 · refreshsec',
    paper: 'Bross et al., "Overview of the VVC Standard and its Applications", IEEE TCSVT 2021' },
  avs3:  { name: 'AVS3', year: '2019 · 中国 AVS 工作组', acc: '#ff5e57',
    pain: '自主标准，4K/8K 超高清广播',
    base: 'Main (8 bit) · Main10（4K 广播主力）· High（第二阶段）',
    tune: 'RA：分层 B · GOP 32 / LD：仅前向参考',
    paper: 'Zhang et al., "Recent Development of AVS Video Coding Standard: AVS3", PCS 2019' },
  av2:   { name: 'AV2', year: '2026 · AOMedia', acc: '#c56bff',
    pain: '比 AV1 再省约 30%',
    base: 'Main_420_10 (IP0/1/2) · 4:2:2 / 4:4:4 10 bit',
    tune: 'AVM 参考编码器 · 单遍 · vbr / cbr / cq / q',
    paper: 'Norkin et al., AV2 overview (2025) · arXiv:2601.02712' },
};
const REC = {
  full:  [240, 118, 1440, 819],
  side:  [880, 150, 960, 800],
  title: [560, 470, 800, 455],
  outro: [1040, 300, 800, 455],
};

// ---------- helpers ----------
const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x+2, 3)/2; };
const fin = (L, a, d=0.5) => ease((L - a) / d);
function sentIdx(st){ const s = st.seg.sents || []; let k = 0; for(let i=0;i<s.length;i++) if(st.L >= s[i].t0 - 0.15) k = i; return k; }
function sentT(st, i){ const s = st.seg.sents || []; return s[i] ? s[i].t0 : 1e9; }
function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function card(c, x, y, w, h, a=1, acc=null){ c.save(); c.globalAlpha *= a; rr(c,x,y,w,h,14); c.fillStyle='rgba(10,16,30,0.78)'; c.fill();
  c.lineWidth=1.5; c.strokeStyle = acc ? acc+'aa' : 'rgba(120,150,200,0.25)'; c.stroke(); c.restore(); }
function text(c, s, x, y, o={}){ c.save(); c.globalAlpha *= (o.a ?? 1);
  c.font = `${o.w||500} ${o.s||32}px ${o.mono?MONO:FONT}`; c.fillStyle = o.c || COL.txt; c.textAlign = o.al || 'left'; c.textBaseline = o.bl || 'alphabetic';
  if(o.glow){ c.shadowColor = o.glow; c.shadowBlur = o.gb || 24; }
  c.fillText(s, x, y); c.restore(); }
function wrap(c, s, x, y, maxw, lh, o={}){ c.save(); c.font = `${o.w||400} ${o.s||28}px ${FONT}`; let line='', yy=y;
  for(const ch of (s.match(/[A-Za-z0-9.\-+\/~=()%:×,'"&_]+|./g) || [])){ const t = line+ch; if(c.measureText(t).width > maxw && line){ text(c, line, x, yy, o); line = ch.trimStart(); yy += lh; } else line = t; }
  if(line) text(c, line, x, yy, o); c.restore(); return yy + lh; }
function chip(c, s, x, y, col, a=1, o={}){ c.save(); c.globalAlpha *= a; c.font = `600 ${o.s||24}px ${o.mono?MONO:FONT}`;
  const w = c.measureText(s).width + 28, h = (o.s||24) + 18; rr(c, x, y, w, h, h/2); c.fillStyle = col + (o.fill||'33'); c.fill();
  c.strokeStyle = col; c.lineWidth = 1.5; c.stroke(); c.fillStyle = o.tc || '#fff'; c.textBaseline='middle'; c.fillText(s, x+14, y+h/2+1); c.restore(); return w; }
function arrow(c, x1, y1, x2, y2, col, a=1, wd=3, head=12, dash=null){ c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = wd;
  if(dash) c.setLineDash(dash); c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); c.setLineDash([]);
  const an = Math.atan2(y2-y1, x2-x1); c.beginPath(); c.moveTo(x2,y2); c.lineTo(x2-head*Math.cos(an-0.4), y2-head*Math.sin(an-0.4)); c.lineTo(x2-head*Math.cos(an+0.4), y2-head*Math.sin(an+0.4)); c.closePath(); c.fill(); c.restore(); }
function frameBox(c, r, col, a=1, label=null){ c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 3; c.shadowColor = col; c.shadowBlur = 18;
  c.strokeRect(r[0]-2, r[1]-2, r[2]+4, r[3]+4); c.restore(); if(label) text(c, label, r[0], r[1]-14, {s:24, c:col, a, w:600}); }
function recFrame(c, st, key, label, end=1e9){ const r = REC[key]; const a = fin(st.L, 0.1, 0.4) * (1 - fin(st.L, end, 0.4));
  frameBox(c, r, st.accent, a); c.save(); c.globalAlpha = a; c.fillStyle = '#000'; c.fillRect(r[0], r[1], r[2], r[3]); c.restore();
  if(label) text(c, label, r[0]+r[2], r[1]+r[3]+34, {s:20, c:COL.dim, al:'right', a, mono:true}); }
const carX = tt => { const f = (0.05 + tt*0.07); return (f - Math.floor(f))*1.5 - 0.25; };

// ---------- chrome: chapter tag, progress, subtitles ----------
function chrome(c, st){
  const seg = st.seg, L = st.L;
  if(seg.scene !== 'hook' || L > 3){
    const a = seg.scene === 'hook' ? fin(L, 3, 0.6) : 1;
    c.save(); c.globalAlpha = a; c.fillStyle = st.accent; c.fillRect(56, 44, 6, 40);
    text(c, seg.ch || '', 76, 76, {s:30, w:600});
    text(c, '压缩三十年', 1864, 72, {s:22, c:COL.dim, al:'right'});
    const p = st.t / TL.duration; c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(1664, 86, 200, 3); c.fillStyle = st.accent; c.fillRect(1664, 86, 200*p, 3);
    c.restore();
  }
  const sub = (seg.subs || []).find(s => L >= s.t0 && L < s.t1 + 0.12);
  if(sub){
    c.save(); c.font = `600 42px ${FONT}`; const w = c.measureText(sub.text).width;
    const a = clamp((L - sub.t0)/0.12) * clamp((sub.t1 + 0.12 - L)/0.12);
    c.globalAlpha = 0.55*a; rr(c, 960 - w/2 - 26, 968, w + 52, 66, 12); c.fillStyle = '#05080f'; c.fill();
    c.globalAlpha = a; c.fillStyle = '#fff'; c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,0.8)'; c.shadowBlur = 8;
    c.fillText(sub.text, 960, 1015); c.restore();
  }
}

// ---------- scenes ----------
const S = {};
S.blank = () => {};

S.hook = (c, st) => {
  const si = sentIdx(st), L = st.L;
  st.fx = 1;
  const rain = si === 0 ? clamp(L/2)*0.5 : si === 1 ? 1 : si === 2 ? 1 - clamp((L - sentT(st,2))/1.2) : 0;
  const dim = si >= 2 ? 0.35 + 0.65*clamp((L - sentT(st,2))/1.5) : 0.35;
  st.fxp = [L/st.D, rain, dim, 0];
  const a4 = fin(L, sentT(st,4), 0.8);
  c.save(); c.globalAlpha = 1 - a4;
  const bx = 120, by = 330;
  card(c, bx, by, 820, 420, 0.9);
  text(c, '1920 × 1080 · 60 fps · 8 bit 4:2:0', bx+40, by+70, {s:30, mono:true, c:COL.dim});
  const k1 = clamp((L - sentT(st,1))/2.5);
  const rows = [['每帧', (3.11*k1).toFixed(2)+' MB', COL.I], ['每秒', (1.49*k1).toFixed(2)+' Gbps', COL.I], ['每分钟', (11.2*k1).toFixed(1)+' GB', COL.I]];
  rows.forEach((r, i) => { const a = fin(L, sentT(st,1) + i*0.5); text(c, r[0], bx+40, by+150+i*72, {s:32, a, c:COL.dim}); text(c, r[1], bx+780, by+150+i*72, {s:54, a, mono:true, w:700, al:'right', c:r[2], glow:r[2], gb:16}); });
  const a2 = fin(L, sentT(st,2));
  text(c, '网络播放', bx+40, by+372, {s:32, a:a2, c:COL.dim}); text(c, '5 Mbps', bx+780, by+372, {s:54, a:a2, mono:true, w:700, al:'right', c:COL.B, glow:COL.B, gb:16});
  const a3 = fin(L, sentT(st,3), 0.7);
  if(a3 > 0){ text(c, '÷ 300', 1440, 680, {s:200*(0.8+0.2*a3), a:a3, mono:true, w:800, al:'center', c:'#fff', glow:st.accent, gb:50});
    text(c, '肉眼几乎无差别', 1440, 770, {s:40, a:a3, al:'center', c:COL.txt}); }
  c.restore();
  if(a4 > 0){ c.save(); c.globalAlpha = a4*0.6; c.fillStyle = '#000'; c.fillRect(0,0,1920,1080); c.restore();
    text(c, '三十年 · 一代又一代编码标准', 960, 520, {s:72, a:a4, w:700, al:'center', glow:st.accent, gb:40}); }
};

S.title = (c, st) => {
  const L = st.L; st.fx = 2;
  text(c, '压缩三十年', 960, 230, {s:120, w:800, al:'center', a:fin(L,0,0.8), glow:st.accent, gb:50});
  text(c, '从 H.263 到 H.266 / AV2 / AVS3', 960, 320, {s:46, al:'center', a:fin(L,0.4), mono:false});
  text(c, '主流视频编码格式科普 · I/P/B · 率失真 · 档次与微调', 960, 380, {s:28, al:'center', c:COL.dim, a:fin(L,0.8)});
  const names = ['H.263','MPEG-2','VP6','Theora','H.264','VP8','HEVC','VP9','AV1','VVC','AVS3','AV2'];
  const keys  = ['h263','mpeg2','vp6','theora','avc','vp8','hevc','vp9','av1','vvc','avs3','av2'];
  recFrame(c, st, 'title', 'VideoAnalyzer-Qt · 帧级分析');
  let x = 140; const y = 470;
  // vertical chip column left + right of the recording
  names.forEach((n, i) => { const col = CODEC[keys[i]].acc; const a = fin(L, 1.2 + i*0.35, 0.4);
    const side = i < 6; const xx = side ? 150 : 1430; const yy = 480 + (i%6)*72; chip(c, n, xx + (side?0:0), yy, col, a, {s:26}); });
};

S.redundancy = (c, st) => {
  const si = sentIdx(st), L = st.L;
  const M = [120, 160, 1040, 585], R2 = [1200, 160, 600, 338];
  st.panels.push({ rect: M, mode: si >= 4 ? 2 : 0, alpha: fin(L, 0, 0.6) });
  frameBox(c, M, st.accent, fin(L,0,0.6));
  const names = [['空间冗余','相邻像素高度相似', COL.P], ['时间冗余','相邻帧大部分不变', COL.B], ['统计冗余','符号出现频率不均', '#ffcc4d'], ['感知冗余','人眼对色度/高频不敏感', COL.I]];
  const cur = si - 1;
  if(cur === 0){ st.panels.push({ rect: R2, mode: 3, param: 8, q: [0.12, 0.10, 0.07, 0.12], alpha: fin(L, sentT(st,1)) });
    const a = fin(L, sentT(st,1)); c.save(); c.globalAlpha = a; c.strokeStyle = COL.P; c.lineWidth = 3; c.strokeRect(M[0]+0.12*M[2], M[1]+0.10*M[3], 0.07*M[2], 0.12*M[3]); c.restore();
    arrow(c, M[0]+0.19*M[2], M[1]+0.16*M[3], R2[0]-10, R2[1]+120, COL.P, a, 2, 10, [6,6]);
    text(c, '放大：一片几乎相同的蓝', R2[0], R2[1]+R2[3]+40, {s:26, c:COL.P, a}); }
  else if(cur === 1){ st.panels.push({ rect: R2, mode: 1, alpha: fin(L, sentT(st,2)) });
    text(c, '帧差 |F(t) − F(t−1)|：几乎全黑', R2[0], R2[1]+R2[3]+40, {s:26, c:COL.B, a:fin(L,sentT(st,2))}); }
  else if(cur === 2){ const a = fin(L, sentT(st,3)); card(c, R2[0], R2[1], R2[2], R2[3], a);
    const sy = [['0', 0.62], ['±1', 0.2], ['±2', 0.09], ['±3', 0.05], ['…', 0.04]];
    sy.forEach((s, i) => { const y = R2[1]+50+i*56; text(c, s[0], R2[0]+40, y+18, {s:28, mono:true, a});
      c.save(); c.globalAlpha = a; c.fillStyle = '#ffcc4d'; c.fillRect(R2[0]+120, y-6, 400*s[1]*ease(clamp((L-sentT(st,3))/1.2)), 30); c.restore(); });
    text(c, '短码给常见符号：Huffman / 算术编码', R2[0], R2[1]+R2[3]+40, {s:26, c:'#ffcc4d', a}); }
  else if(cur >= 3){ const a = fin(L, sentT(st,4)); card(c, R2[0], R2[1], R2[2], R2[3], a);
    text(c, '4:2:0', R2[0]+300, R2[1]+150, {s:96, mono:true, w:800, al:'center', a, c:COL.I, glow:COL.I});
    text(c, '色度分辨率只有亮度的 1/4', R2[0]+300, R2[1]+230, {s:28, al:'center', a});
    text(c, '左：原图　右：色度 1/64 采样（夸张演示）', M[0], M[1]+M[3]+40, {s:24, c:COL.dim, a}); }
  else { const a = fin(L, 0.3); card(c, R2[0], R2[1], R2[2], R2[3], a);
    text(c, '冗余 = 可以不传的信息', R2[0]+300, R2[1]+180, {s:40, w:700, al:'center', a, glow:st.accent}); }
  names.forEach((n, i) => { const y = 560 + i*92; const on = i === cur; const a = fin(L, 0.4 + i*0.15);
    card(c, 1200, y, 600, 78, a, on ? n[2] : null);
    text(c, n[0], 1230, y+50, {s:32, w:700, c: on ? n[2] : COL.txt, a: a*(on||cur<0?1:0.5)}); text(c, n[1], 1420, y+49, {s:24, c:COL.dim, a: a*(on||cur<0?1:0.5)}); });
};

S.hybrid = (c, st) => {
  const si = sentIdx(st), L = st.L;
  const IN = [80, 270, 300, 169];
  st.panels.push({ rect: IN, mode: 0, alpha: fin(L, 0) });
  frameBox(c, IN, COL.dim, fin(L,0), '输入帧');
  if(si >= 1){ const a = fin(L, sentT(st,1)); c.save(); c.globalAlpha = a*0.8; c.strokeStyle = '#fff'; c.lineWidth = 1;
    for(let x = IN[0]; x <= IN[0]+IN[2]; x += 300/16){ c.beginPath(); c.moveTo(x, IN[1]); c.lineTo(x, IN[1]+IN[3]); c.stroke(); }
    for(let y = IN[1]; y <= IN[1]+IN[3]; y += 300/16){ c.beginPath(); c.moveTo(IN[0], y); c.lineTo(IN[0]+IN[2], y); c.stroke(); } c.restore(); }
  const N = { sub:[560,354,'−  残差'], T:[790,354,'变换 DCT'], Q:[1020,354,'量化 Q'], E:[1250,354,'熵编码'],
    IQ:[1020,620,'反量化·反变换'], REC:[790,620,'＋  重建'], LF:[790,820,'环路滤波'], BUF:[560,820,'参考帧缓存'], PRED:[560,620,'预测 帧内/帧间'] };
  const grp = { 2: ['PRED','BUF'], 3: ['sub','T','Q','E'], 4: ['IQ','REC','LF','BUF'] };
  const act = grp[si] || [];
  const E = [['sub','T'],['T','Q'],['Q','E'],['Q','IQ'],['IQ','REC'],['PRED','REC'],['REC','LF'],['LF','BUF'],['BUF','PRED'],['PRED','sub']];
  const bw = 200, bh = 70;
  E.forEach(([a,b], i) => { const A = N[a], B = N[b]; const on = act.includes(a) && act.includes(b) || (si===3 && a==='PRED' && b==='sub');
    const al = fin(L, 0.3 + i*0.08); let x1=A[0], y1=A[1], x2=B[0], y2=B[1];
    if(Math.abs(x2-x1) > Math.abs(y2-y1)){ x1 += Math.sign(x2-x1)*bw/2; x2 -= Math.sign(x2-x1)*bw/2; } else { y1 += Math.sign(y2-y1)*bh/2; y2 -= Math.sign(y2-y1)*bh/2; }
    arrow(c, x1, y1, x2, y2, on ? st.accent : '#5a6a88', al, on?3:2, 12);
    if(on){ const k = (st.t*0.9 + i*0.3) % 1; c.save(); c.fillStyle = '#fff'; c.shadowColor = st.accent; c.shadowBlur = 14; c.beginPath(); c.arc(x1+(x2-x1)*k, y1+(y2-y1)*k, 5, 0, 7); c.fill(); c.restore(); } });
  arrow(c, IN[0]+IN[2]+6, 354, N.sub[0]-bw/2, 354, COL.dim, fin(L,0.3), 2, 12);
  arrow(c, IN[0]+IN[2]/2, IN[1]+IN[3]+6, N.PRED[0]-bw/2, 620, COL.dim, fin(L,0.5)*0.6, 2, 10, [6,6]);
  Object.entries(N).forEach(([k, n], i) => { const on = act.includes(k); const a = fin(L, 0.2 + i*0.07);
    card(c, n[0]-bw/2, n[1]-bh/2, bw, bh, a, on ? st.accent : null);
    text(c, n[2], n[0], n[1]+10, {s: 26, w: 600, al:'center', a, c: on ? '#fff' : COL.txt, glow: on ? st.accent : null}); });
  const ea = fin(L, 0.5); const bits = '0110100111010010110101';
  for(let i = 0; i < 18; i++){ const x = 1380 + ((i*26 + st.t*120) % 470); text(c, bits[(i + Math.floor(st.t*3)) % bits.length], x, 364, {s:30, mono:true, c: act.includes('E') ? st.accent : '#5a6a88', a: ea*clamp((1850-x)/80)}); }
  text(c, '比特流', 1610, 300, {s:26, c:COL.dim, al:'center', a:ea});
  if(si >= 4){ const a = fin(L, sentT(st,4)); c.save(); c.globalAlpha = a*0.9; c.setLineDash([10,8]); c.strokeStyle = st.accent; c.lineWidth = 2; rr(c, 430, 560, 720, 320, 18); c.stroke(); c.restore();
    text(c, '解码器 = 编码器里的这条回路', 1170, 860, {s:28, c:st.accent, a}); }
  text(c, '基于块的混合编码框架（H.261 起沿用至今）', 960, 940, {s:24, c:COL.dim, al:'center', a:fin(L,0.5)});
};

S.dct = (c, st) => {
  const si = sentIdx(st), L = st.L;
  const A = [120, 250, 420, 420], B = [750, 250, 420, 420], C = [1380, 250, 420, 420];
  const hl = si >= 1 ? 14 * ease(clamp((L - sentT(st,1)) / 3)) : -1;
  const q = si >= 2 ? 14 - 11 * ease(clamp((L - sentT(st,2)) / 2.5)) : 14;
  st.panels.push({ rect: A, mode: 3, param: 8, q: [0.66, 0.22, 0.05, 0.09], alpha: fin(L,0) });
  st.panels.push({ rect: B, mode: 4, param: si >= 1 ? hl : 14, alpha: fin(L,0.3) });
  st.panels.push({ rect: C, mode: 5, param: q, alpha: fin(L, si >= 1 ? sentT(st,1) : 99) });
  frameBox(c, A, COL.dim, fin(L,0), '8×8 像素块'); frameBox(c, B, st.accent, fin(L,0.3), '64 个 DCT 基函数');
  frameBox(c, C, si >= 3 ? COL.I : '#ffcc4d', fin(L, sentT(st,1)), si >= 2 ? '量化：高频 → 0' : '变换系数（能量集中在左上）');
  arrow(c, 560, 460, 730, 460, COL.dim, fin(L,0.5), 3); arrow(c, 1190, 460, 1360, 460, COL.dim, fin(L, sentT(st,1)), 3);
  text(c, 'F(u,v) = ¼·C(u)C(v)·ΣΣ f(x,y)·cos[(2x+1)uπ/16]·cos[(2y+1)vπ/16]', 960, 760, {s:30, mono:true, al:'center', a:fin(L,0.8), c:COL.txt});
  text(c, 'Ahmed, Natarajan & Rao, "Discrete Cosine Transform", IEEE Trans. Computers, 1974', 960, 810, {s:22, al:'center', c:COL.dim, a:fin(L,1)});
  if(si >= 3){ const a = fin(L, sentT(st,3)); text(c, '整个流程里，只有量化是有损的', 960, 900, {s:40, w:700, al:'center', c:COL.I, a, glow:COL.I}); }
};

S.rdo = (c, st) => {
  const si = sentIdx(st), L = st.L; st.fx = 2;
  const eqA = fin(L, si >= 1 ? sentT(st,1) : 0.3);
  c.save(); c.globalAlpha = eqA; c.font = `800 96px ${MONO}`; c.textBaseline = 'alphabetic';
  const parts = [['J', '#fff'], [' = ', COL.dim], ['D', COL.I], [' + ', COL.dim], ['λ', '#ffcc4d'], ['·', COL.dim], ['R', COL.P]];
  let tw = parts.reduce((s,p) => s + c.measureText(p[0]).width, 0), x = 960 - tw/2;
  parts.forEach(p => { c.fillStyle = p[1]; c.shadowColor = p[1]; c.shadowBlur = 20; c.fillText(p[0], x, 250); x += c.measureText(p[0]).width; }); c.restore();
  const G = [200, 330, 900, 560];
  card(c, G[0]-40, G[1]-30, G[2]+80, G[3]+70, fin(L,0.2));
  const ax = fin(L, 0.4); arrow(c, G[0], G[1]+G[3], G[0]+G[2], G[1]+G[3], COL.dim, ax, 2); arrow(c, G[0], G[1]+G[3], G[0], G[1], COL.dim, ax, 2);
  text(c, 'R 码率 →', G[0]+G[2], G[1]+G[3]+36, {s:24, c:COL.P, al:'right', a:ax}); text(c, 'D 失真', G[0]+12, G[1]+20, {s:24, c:COL.I, a:ax});
  const f = r => 0.06 + 0.9/(1 + 6*r); // normalised D(R)
  const px = r => G[0] + r*G[2], py = d => G[1] + G[3] - d*G[3];
  c.save(); c.globalAlpha = ax; c.strokeStyle = '#ffffff99'; c.lineWidth = 3; c.beginPath();
  for(let i = 0; i <= 100; i++){ const r = i/100*0.95+0.02; i ? c.lineTo(px(r), py(f(r))) : c.moveTo(px(r), py(f(r))); } c.stroke(); c.restore();
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 60; i++){ const r = rnd()*0.9+0.03, d = f(r) + rnd()*0.35; text(c, '•', px(r), py(Math.min(d,0.98)), {s:22, c:'#8aa0c8', al:'center', a:ax*fin(L,0.6+i*0.02,0.3)}); }
  const lam = 0.25 + 1.8*(0.5+0.5*Math.sin(st.t*0.7));
  const r0 = clamp((Math.sqrt(0.9*6/lam) - 1)/6, 0.02, 0.95); const d0 = f(r0);
  const ta = fin(L, si >= 2 ? sentT(st,2) : 99);
  if(ta > 0){ const k = -lam*G[3]/G[2]; c.save(); c.beginPath(); c.rect(G[0], G[1], G[2], G[3]); c.clip(); c.globalAlpha = ta; c.strokeStyle = '#ffcc4d'; c.lineWidth = 2.5; c.setLineDash([10,6]);
    c.beginPath(); c.moveTo(px(r0)-260, py(d0) + 260*k*-1); c.lineTo(px(r0)+260, py(d0) - 260*k*-1); c.stroke(); c.restore();
    c.save(); c.globalAlpha = ta; c.fillStyle = '#fff'; c.shadowColor = '#ffcc4d'; c.shadowBlur = 20; c.beginPath(); c.arc(px(r0), py(d0), 10, 0, 7); c.fill(); c.restore();
    text(c, '斜率 = −λ  →  最优模式', px(r0)+24, py(d0)-20, {s:24, c:'#ffcc4d', a:ta}); }
  const lx = 1250; const la = fin(L, sentT(st,2));
  [['D', '失真：SSE / SATD', COL.I], ['R', '码率：编码这个选择要花的比特', COL.P], ['λ', '汇率：1 比特值多少失真', '#ffcc4d']].forEach((r,i) => {
    text(c, r[0], lx, 420+i*90, {s:56, mono:true, w:800, c:r[2], a:fin(L, sentT(st,2)+i*0.3)}); text(c, r[1], lx+80, 412+i*90, {s:28, a:fin(L, sentT(st,2)+i*0.3)}); });
  text(c, 'H.264 参考：λ_mode = 0.85 · 2^((QP−12)/3)', lx, 720, {s:24, mono:true, c:COL.dim, a:fin(L, sentT(st,3))});
  if(si >= 4) text(c, '所有参数 = 调汇率 + 调搜索范围', lx, 800, {s:30, w:700, c:st.accent, a:fin(L, sentT(st,4)), glow:st.accent});
  text(c, 'Sullivan & Wiegand, "Rate-Distortion Optimization for Video Compression", IEEE SPM, 1998', 960, 940, {s:22, al:'center', c:COL.dim, a:fin(L,1)});
};

// --- I / P / B ---
function strip(c, st, hi){
  const types = ['I','B','B','P','B','B','P'], sizes = {I:1, P:0.38, B:0.16};
  const x0 = 130, y0 = 140, w = 220, h = 124, g = 20, T0 = 20;
  types.forEach((ty, i) => { const r = [x0 + i*(w+g), y0, w, h]; const a = fin(st.L, i*0.08, 0.4);
    st.panels.push({ rect: r, mode: hi.includes(i) || hi.length === 0 ? 0 : 11, vt: T0 + i*0.3, alpha: a });
    frameBox(c, r, COL[ty], a * (hi.includes(i) || hi.length === 0 ? 1 : 0.35));
    text(c, ty + i, r[0]+10, r[1]+36, {s:28, w:800, c:COL[ty], a, mono:true});
    c.save(); c.globalAlpha = a; c.fillStyle = COL[ty] + '99'; c.fillRect(r[0], r[1]+h+14, w*sizes[ty], 14); c.restore(); });
  text(c, '帧大小', x0, y0+h+60, {s:20, c:COL.dim, a:fin(st.L,0.5)});
}
S.ipb_i = (c, st) => { const si = sentIdx(st), L = st.L; strip(c, st, [0]);
  const M = [680, 380, 900, 506]; st.panels.push({ rect: M, mode: 0, vt: 20, alpha: fin(L, 0.3) }); frameBox(c, M, COL.I, fin(L,0.3));
  const n = Math.floor(clamp((L - 0.8)/ (st.D - 2)) * 14*8);
  c.save(); for(let k = 0; k < 14*8; k++){ const bx = k % 14, by = Math.floor(k/14); const x = M[0]+bx*M[2]/14, y = M[1]+by*M[3]/8;
    c.strokeStyle = k < n ? COL.I + 'cc' : 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.strokeRect(x, y, M[2]/14, M[3]/8);
    if(k === n){ c.fillStyle = COL.I + '55'; c.fillRect(x, y, M[2]/14, M[3]/8); arrow(c, x-14, y+M[3]/16, x+4, y+M[3]/16, '#fff', 1, 2, 8); arrow(c, x+M[2]/28, y-14, x+M[2]/28, y+4, '#fff', 1, 2, 8); } } c.restore();
  text(c, 'I', 160, 520, {s:160, w:800, mono:true, c:COL.I, glow:COL.I, gb:40, a:fin(L,0.2)});
  text(c, 'Intra · 帧内编码', 160, 600, {s:36, w:700, a:fin(L,0.4)});
  ['只用本帧信息', '可独立解码', '随机访问 / 拖动落点', '体积最大'].forEach((s,i) => text(c, '· ' + s, 160, 670 + i*50, {s:28, c: i===3 ? COL.I : COL.txt, a:fin(L, sentT(st, Math.min(i,1)) + i*0.4)}));
};
S.ipb_p = (c, st) => { const si = sentIdx(st), L = st.L; strip(c, st, [0, 3]);
  const T0 = 20.0, dt = 0.6; const A = [140, 410, 760, 428], B = [1020, 410, 760, 428];
  st.panels.push({ rect: A, mode: 0, vt: T0, alpha: fin(L,0.2) }); st.panels.push({ rect: B, mode: 0, vt: T0 + dt, alpha: fin(L,0.4) });
  frameBox(c, A, COL.I, fin(L,0.2), '参考帧（已解码）'); frameBox(c, B, COL.P, fin(L,0.4), 'P 帧（当前）');
  const gx = 12, gy = 7, bw = B[2]/gx, bh = B[3]/gy; const cx1 = carX(T0)*B[2], cx2 = carX(T0+dt)*B[2], cy = (1-0.13)*B[3]; const dx = cx2 - cx1;
  const va = fin(L, si >= 1 ? sentT(st,1) + 0.5 : 99);
  c.save(); for(let j = 0; j < gy; j++) for(let i = 0; i < gx; i++){ const x = B[0]+i*bw, y = B[1]+j*bh; const ccx = i*bw + bw/2, ccy = j*bh + bh/2;
    const onCar = Math.abs(ccx - cx2) < 0.11*B[2]/1.78*1.0 + bw*0.5 && Math.abs(ccy - cy) < 0.07*B[3] + bh*0.3;
    c.globalAlpha = va; c.strokeStyle = onCar ? COL.P : 'rgba(255,255,255,0.15)'; c.lineWidth = onCar ? 2 : 1; c.strokeRect(x, y, bw, bh);
    if(onCar){ arrow(c, x+bw/2-dx, y+bh/2, x+bw/2, y+bh/2, '#ffcc4d', va, 3, 10); } else if(j < 3 || j > 5) { c.save(); c.globalAlpha = va*0.5; c.font = `500 14px ${MONO}`; c.fillStyle = '#9fb0cc'; c.fillText('skip', x+6, y+18); c.restore(); } }
  c.restore();
  if(si >= 2){ const a = fin(L, sentT(st,2)); card(c, 560, 870, 800, 64, a, COL.P); text(c, '“这块，从上一帧左边 10 像素处搬过来” = MV(−10, 0) + 残差', 960, 912, {s:26, al:'center', a}); }
  if(si >= 3) text(c, 'P ≈ I 的几分之一', 1780, 372, {s:28, al:'right', c:COL.P, a:fin(L, sentT(st,3)), w:700});
};
S.ipb_b = (c, st) => { const si = sentIdx(st), L = st.L; strip(c, st, [0, 1, 3]);
  const T0 = 20.0, dt = 0.9; const A = [100, 430, 540, 304], B = [690, 430, 540, 304], C = [1280, 430, 540, 304];
  st.panels.push({ rect: A, mode: 0, vt: T0, alpha: fin(L,0.2) }); st.panels.push({ rect: B, mode: 0, vt: T0+dt, alpha: fin(L,0.4) }); st.panels.push({ rect: C, mode: 0, vt: T0+2*dt, alpha: fin(L,0.6) });
  frameBox(c, A, COL.I, fin(L,0.2), '过去 (I0)'); frameBox(c, B, COL.B, fin(L,0.4), 'B 帧'); frameBox(c, C, COL.P, fin(L,0.6), '未来 (P3)');
  const aa = fin(L, 1.0);
  c.save(); c.globalAlpha = aa; c.strokeStyle = COL.I; c.lineWidth = 3; c.beginPath(); c.moveTo(A[0]+A[2]/2, A[1]+A[3]+10); c.quadraticCurveTo(A[0]+A[2], A[1]+A[3]+120, B[0]+B[2]/2-30, B[1]+B[3]+10); c.stroke();
  c.strokeStyle = COL.P; c.beginPath(); c.moveTo(C[0]+C[2]/2, C[1]+C[3]+10); c.quadraticCurveTo(C[0], C[1]+C[3]+120, B[0]+B[2]/2+30, B[1]+B[3]+10); c.stroke(); c.restore();
  text(c, 'B = ½ · ( 前向预测 + 后向预测 )', 960, 880, {s:34, w:700, al:'center', a:aa, glow:COL.B});
  if(si >= 1){ const a = fin(L, sentT(st,1)+1.0); const ox = carX(T0)*B[2]; const r = [B[0]+ox-0.11*B[2]/1.78*1.6, B[1]+(1-0.2)*B[3], 0.2*B[2]/1.78*1.6, 0.12*B[3]];
    c.save(); c.globalAlpha = a; c.setLineDash([6,5]); c.strokeStyle = '#ffcc4d'; c.lineWidth = 2.5; c.strokeRect(r[0], r[1], r[2], r[3]); c.restore();
    text(c, '被车挡住的背景 → 去未来帧里找', B[0]+B[2]/2, B[1]-50, {s:24, al:'center', c:'#ffcc4d', a}); }
  if(si >= 3) text(c, 'B ≈ I 的 1/5 甚至更小', 1820, 372, {s:28, al:'right', c:COL.B, a:fin(L, sentT(st,3)), w:700});
};
S.ipb_reorder = (c, st) => { const si = sentIdx(st), L = st.L; strip(c, st, []);
  const disp = ['I0','B1','B2','P3','B4','B5','P6'], dec = ['I0','P3','B1','B2','P6','B4','B5'];
  const x0 = 380, gw = 170, y1 = 450, y2 = 610;
  text(c, '显示顺序 (pts)', 120, y1+12, {s:28, c:COL.dim, a:fin(L,0.2)}); text(c, '解码顺序 (dts)', 120, y2+12, {s:28, c:COL.dim, a:fin(L,0.4)});
  const k = clamp((L - 1.0)/4);
  disp.forEach((d, i) => { const col = COL[d[0]]; chip(c, d, x0 + i*gw, y1-24, col, fin(L,0.2+i*0.05), {s:30, mono:true}); });
  dec.forEach((d, i) => { const col = COL[d[0]]; const a = fin(L, 1.0 + i*0.45, 0.4); chip(c, d, x0 + i*gw, y2-24, col, a, {s:30, mono:true});
    const j = disp.indexOf(d); if(a > 0) arrow(c, x0 + i*gw + 40, y2-30, x0 + j*gw + 40, y1+30, col, a*0.7, 2, 10); });
  const G = [380, 720, 1190, 150]; const ga = fin(L, si >= 1 ? sentT(st,1) + 1 : 99);
  if(ga > 0){ text(c, 'pts − dts', 120, G[1]+70, {s:28, c:'#ff9f43', a:ga}); c.save(); c.globalAlpha = ga; c.strokeStyle = '#ff9f43'; c.lineWidth = 3; c.shadowColor = '#ff9f43'; c.shadowBlur = 10; c.beginPath();
    const N = 21, kk = clamp((L - sentT(st,1) - 1)/3); for(let i = 0; i <= N*kk; i++){ const v = [0, 2, -1, -1][i % 4]; const x = G[0] + i*G[2]/N, y = G[1] + G[3]/2 - v*30; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = '#7bd88f'; c.shadowColor = '#7bd88f'; c.beginPath(); c.moveTo(G[0], G[1]+G[3]/2+80); c.lineTo(G[0]+G[2]*kk, G[1]+G[3]/2+80); c.stroke(); c.restore();
    text(c, '有 B：锯齿', G[0]+G[2]+20, G[1]+G[3]/2+8, {s:24, c:'#ff9f43', a:ga}); text(c, '无 B：零线', G[0]+G[2]+20, G[1]+G[3]/2+88, {s:24, c:'#7bd88f', a:ga}); }
  if(si >= 2) chip(c, '代价：延迟 → 通话 / 直播关掉 B 帧', 1240, 380, COL.I, fin(L, sentT(st,2)), {s:24});
};

S.timeline = (c, st) => { const si = sentIdx(st), L = st.L; st.fx = 3;
  const X = y => 300 + (y - 1987) / (2027 - 1987) * 1540;
  const lanes = [[346, 'ITU-T / MPEG', '#4da3ff'], [540, 'On2 / Google / AOM', '#ff6b6b'], [734, 'AVS（中国）', '#e6c04a']];
  const sweep = 1987 + 40 * ease(clamp((L - 0.5) / (st.D - 2)));
  lanes.forEach((ln, i) => { const on = si === i+1; card(c, 40, ln[0]-30, 250, 56, fin(L,0.2+i*0.2), on ? ln[2] : null); text(c, ln[1], 60, ln[0]+10, {s:24, w:700, c:ln[2], a: fin(L,0.2+i*0.2)*(si===0||on?1:0.45)}); });
  for(let y = 1990; y <= 2025; y += 5){ text(c, String(y), X(y), 880, {s:20, mono:true, c:COL.dim, al:'center', a:fin(L,0.3)}); }
  c.save(); c.globalAlpha = 0.8; c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 20; c.fillRect(X(sweep)-1, 260, 2, 580); c.restore();
  const nodes = [[0,1988,'H.261'],[0,1995,'MPEG-2'],[0,1996,'H.263'],[0,2003,'H.264'],[0,2013,'H.265'],[0,2020,'H.266'],
    [1,2000,'VP3'],[1,2003,'VP6'],[1,2004,'Theora'],[1,2010,'VP8'],[1,2013,'VP9'],[1,2018,'AV1'],[1,2026,'AV2'],
    [2,2006,'AVS1'],[2,2016,'AVS2'],[2,2019,'AVS3']];
  nodes.forEach((n, i) => { const ln = lanes[n[0]]; const a = clamp((sweep - n[1]) * 2 + 0.0); if(a <= 0) return;
    const x = X(n[1]), y = ln[0], up = (i % 2) ? -1 : 1;
    c.save(); c.globalAlpha = a; c.fillStyle = ln[2]; c.shadowColor = ln[2]; c.shadowBlur = 20; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.restore();
    text(c, n[2], x, y - 26*up + (up<0?20:0), {s:26, w:700, al:'center', a, c:'#fff'}); });
};

function codecCard(c, st, key){ const L = st.L, C = CODEC[key];
  card(c, 80, 150, 740, 790, fin(L,0), C.acc);
  text(c, C.name, 120, 240, {s:68, w:800, c:C.acc, glow:C.acc, gb:30, a:fin(L,0.1)});
  text(c, C.year, 122, 285, {s:26, c:COL.dim, a:fin(L,0.3), mono:true});
  const rows = [['痛点', C.pain], ['基线 / 档次', C.base], ['微调', C.tune], ['论文', C.paper]];
  let y = 330; rows.forEach((r, i) => { const a = fin(L, 0.6 + i*Math.max(0.6, st.D*0.16), 0.6);
    chip(c, r[0], 120, y, C.acc, a, {s:20}); y = wrap(c, r[1], 120, y + 76, 660, 38, {s: i===3 ? 21 : 27, a, c: i===3 ? COL.dim : COL.txt}) + 14; });
}
S.codec = (c, st) => { const key = st.seg.codec; codecCard(c, st, key); recFrame(c, st, 'side', 'VideoAnalyzer-Qt 实测 · ' + CODEC[key].name); };
S.rec = (c, st) => { const key = st.seg.codec; recFrame(c, st, 'full', 'VideoAnalyzer-Qt 实测录屏');
  if(key){ const C = CODEC[key]; chip(c, C.name, 240, 950, C.acc, fin(st.L,0.3), {s:26}); } };

S.profiles = (c, st) => { const si = sentIdx(st), L = st.L;
  const P = [['Baseline', ['I/P', 'CAVLC', '无 B 帧'], '视频通话 / WebRTC', 1], ['Main', ['+ B 帧', '+ CABAC', '+ 加权预测'], '广播电视', 2], ['High', ['+ 8×8 变换', '+ 量化矩阵'], '点播 / 存档默认', 3],
    ['High10', ['+ 10 bit'], '动漫压制 / HDR 前', 4], ['High 4:2:2', ['+ 4:2:2'], '演播室 / 采集', 4], ['High 4:4:4', ['+ 4:4:4', '+ 无损'], 'CG / 屏幕 / 母带', 4]];
  P.forEach((p, i) => { const x = 110 + i*290, h = 220 + i*80, y = 860 - h; const a = fin(L, si >= p[3] ? sentT(st, p[3]) : (i < 1 ? 99 : 99)); const on = si === p[3];
    card(c, x, y, 260, h, Math.max(a, 0.18), on ? st.accent : null);
    text(c, p[0], x+20, y+52, {s:32, w:800, c: on ? st.accent : COL.txt, a:Math.max(a,0.3)});
    p[1].forEach((f, j) => chip(c, f, x+18, y+80+j*54, on ? st.accent : '#6a7a99', a, {s:20}));
    text(c, p[2], x+130, 905, {s:22, al:'center', c:COL.dim, a}); });
  text(c, '复杂度 / 延迟 ↑    压缩率 ↑', 960, 200, {s:30, al:'center', c:COL.dim, a:fin(L,0.3)});
  arrow(c, 200, 230, 1760, 230, '#5a6a88', fin(L,0.4), 2);
};

S.tune = (c, st) => { const si = sentIdx(st), L = st.L; recFrame(c, st, 'side', 'VideoAnalyzer-Qt 实测 · H.264');
  card(c, 80, 150, 740, 790, fin(L,0), st.accent);
  const sec = (y, title, k) => { const on = si === k || (k === 1 && si === 2); text(c, title, 120, y, {s:30, w:800, c: on ? st.accent : COL.txt, a: fin(L, sentT(st,k)-0.2)*(on?1:0.6)}); return on; };
  sec(210, 'CRF 恒定质量 / VBV 限幅', 1);
  const ca = fin(L, sentT(st,1)); c.save(); c.globalAlpha = ca; const g = c.createLinearGradient(120,0,780,0); g.addColorStop(0, COL.B); g.addColorStop(1, COL.I); c.fillStyle = g; c.fillRect(120, 240, 660, 12); c.restore();
  [['0',0],['18',18/51],['23',23/51],['28',28/51],['51',1]].forEach(m => text(c, m[0], 120 + 660*m[1], 285, {s:20, mono:true, c:COL.dim, al:'center', a:ca}));
  if(si >= 2){ const a = fin(L, sentT(st,2)); c.save(); c.globalAlpha = a; c.strokeStyle = COL.P; c.lineWidth = 2; c.beginPath();
    for(let i = 0; i < 60; i++){ const v = Math.min(0.75, 0.4 + 0.5*Math.abs(Math.sin(i*0.7)*Math.sin(i*0.23))); const x = 120 + i*11, y = 360 - v*60; i ? c.lineTo(x,y) : c.moveTo(x,y); } c.stroke();
    c.setLineDash([6,5]); c.strokeStyle = COL.I; c.beginPath(); c.moveTo(120, 315); c.lineTo(780, 315); c.stroke(); c.restore(); text(c, 'maxrate', 780, 308, {s:18, c:COL.I, al:'right', a, mono:true}); }
  sec(430, 'preset：搜索力度', 3);
  const PR = ['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow','placebo'];
  const pa = fin(L, sentT(st,3)); const pk = si >= 3 ? 9*(0.5+0.5*Math.sin((L - sentT(st,3))*0.9 - 1.57)) : 5;
  c.save(); c.globalAlpha = pa; c.fillStyle = '#2a3550'; c.fillRect(120, 462, 660, 6); c.fillStyle = st.accent; c.fillRect(120, 462, 660*pk/9, 6);
  c.beginPath(); c.arc(120 + 660*pk/9, 465, 12, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
  text(c, PR[Math.round(pk)], 120 + 660*pk/9, 505, {s:22, mono:true, al:'center', a:pa, c:st.accent}); text(c, '快', 120, 540, {s:20, c:COL.dim, a:pa}); text(c, '压缩率高', 780, 540, {s:20, c:COL.dim, al:'right', a:pa});
  sec(600, 'tune：按片源微调', 4);
  const T = ['film','animation','grain','stillimage','psnr','ssim','fastdecode','zerolatency']; let tx = 120, ty = 625;
  T.forEach((t, i) => { const hl = si === 4 && Math.floor((L - sentT(st,4)) * 1.2) % T.length === i; const w = chip(c, t, tx, ty, hl ? st.accent : '#6a7a99', fin(L, sentT(st,4) + i*0.1), {s:20, mono:true, fill: hl ? 'aa' : '22'}); tx += w + 10; if(tx > 680){ tx = 120; ty += 50; } });
  sec(790, 'mb-tree：被引用越多，越值得给比特', 5);
  if(si >= 5){ const a = fin(L, sentT(st,5)); const xs = [140, 300, 460, 620, 760];
    xs.forEach((x, i) => { c.save(); c.globalAlpha = a; c.fillStyle = i === 0 ? st.accent : '#3a4a6a'; c.fillRect(x, 830, 56, 56); c.restore(); if(i) arrow(c, x, 858, xs[0]+60 + (i-1)*6, 858 - (i)*4, st.accent, a*0.7, 2, 8); });
    text(c, 'Garrett-Glaser, 2009', 780, 920, {s:18, c:COL.dim, al:'right', a}); }
};

S.grain = (c, st) => { const si = sentIdx(st), L = st.L;
  const A = [100, 220, 540, 304], B = [690, 220, 540, 304], C = [1280, 220, 540, 304];
  const k1 = si >= 1 ? sentT(st,1) : 99;
  st.panels.push({ rect: A, mode: 6, alpha: fin(L,0.2) }); st.panels.push({ rect: B, mode: 7, alpha: fin(L, k1+0.8) }); st.panels.push({ rect: C, mode: 8, alpha: fin(L, k1+2.6) });
  frameBox(c, A, '#c9b28a', fin(L,0.2), '源：带胶片颗粒'); frameBox(c, B, COL.B, fin(L,k1+0.8), '编码：去噪后的干净画面'); frameBox(c, C, st.accent, fin(L,k1+2.6), '解码端：按参数表合成颗粒');
  arrow(c, 650, 372, 680, 372, COL.dim, fin(L,k1+0.8), 3); arrow(c, 1240, 372, 1270, 372, COL.dim, fin(L,k1+2.6), 3);
  const ba = fin(L, si >= 2 ? sentT(st,2) : 99);
  [['直接编码带颗粒的源', 1.0, '#c9b28a'], ['AV1：干净画面 + 颗粒参数表', 0.58, st.accent]].forEach((b, i) => { const y = 600 + i*70;
    text(c, b[0], 100, y+24, {s:26, a:ba}); c.save(); c.globalAlpha = ba; c.fillStyle = b[2]; c.fillRect(560, y, 900*b[1]*ease(clamp((L - sentT(st,2))/1.2)), 32); c.restore(); });
  if(ba > 0) chip(c, '+ < 100 B / 帧', 1100, 668, '#fff', ba, {s:20, mono:true});
  const sa = fin(L, si >= 3 ? sentT(st,3) : 99);
  if(sa > 0){ text(c, 'SVT-AV1 preset', 100, 820, {s:26, a:sa, c:COL.dim}); for(let i = 0; i <= 13; i++){ const on = i === 8; chip(c, String(i), 320 + i*58, 795, on ? st.accent : '#6a7a99', sa, {s:18, mono:true, fill: on?'aa':'22'}); }
    const ta = fin(L, si >= 4 ? sentT(st,4) : 99); chip(c, 'tune 0 = VQ（主观）', 1180, 795, COL.B, ta, {s:20}); chip(c, 'tune 1 = PSNR', 1440, 795, COL.P, ta, {s:20}); }
  if(si >= 5) text(c, 'AV1 vs x265 ≈ −30% 码率 @ 同 VMAF', 960, 900, {s:36, w:800, al:'center', c:st.accent, glow:st.accent, a:fin(L, sentT(st,5))});
  text(c, 'Norkin & Birkbeck, "Film Grain Synthesis for AV1 Video Codec", DCC 2018', 1820, 950, {s:20, c:COL.dim, al:'right', a:fin(L,1)});
};

S.mtt = (c, st) => { const si = sentIdx(st), L = st.L;
  const M = [100, 170, 1100, 619]; const sc = M[2]/1920;
  st.panels.push({ rect: M, mode: 9, param: 128*sc, q: [0.4 + 0.6*clamp(L/4), 0.3, 0, 0], alpha: fin(L,0.2) });
  frameBox(c, M, st.accent, fin(L,0.2), 'QT-MTT：128 CTU 内四叉 + 二叉 + 三叉划分（示意）');
  const x = 1260; card(c, x, 170, 580, 330, fin(L,0.3), si <= 1 ? st.accent : null);
  text(c, '档次', x+30, 220, {s:28, w:800, a:fin(L,0.3), c:st.accent});
  [['Main10', '10 bit 是起点'], ['Main10 4:4:4', '屏幕 / CG'], ['Multilayer Main10', '空域 / SNR 可分级'], ['Still Picture', '静帧']].forEach((p, i) => {
    const a = fin(L, (i < 1 ? 0.5 : sentT(st, 1)) + i*0.25); text(c, p[0], x+30, 270+i*55, {s:26, w:700, mono:true, a}); text(c, p[1], x+550, 270+i*55, {s:22, c:COL.dim, al:'right', a}); });
  const G = [x, 530, 580, 330]; const ga = fin(L, si >= 2 ? sentT(st,2) : 99); card(c, G[0], G[1], G[2], G[3], ga, si >= 2 ? st.accent : null);
  text(c, 'VVenC preset：帕累托前沿', x+30, 575, {s:26, w:800, c:st.accent, a:ga});
  const pts = [['faster', 0.1, 0.70], ['fast', 0.28, 0.48], ['medium', 0.5, 0.34], ['slow', 0.72, 0.25], ['slower', 0.92, 0.20]];
  c.save(); c.globalAlpha = ga; c.strokeStyle = st.accent; c.lineWidth = 2.5; c.beginPath(); pts.forEach((p, i) => { const px = x+50+p[1]*480, py = 600 + p[2]*300; i ? c.lineTo(px,py) : c.moveTo(px,py); }); c.stroke(); c.restore();
  pts.forEach(p => { const px = x+50+p[1]*480, py = 600 + p[2]*300; c.save(); c.globalAlpha = ga; c.fillStyle = '#fff'; c.beginPath(); c.arc(px, py, 6, 0, 7); c.fill(); c.restore(); text(c, p[0], px, py - 14, {s:18, mono:true, al:'center', a:ga}); });
  text(c, '编码时间 →', x+560, 850, {s:18, c:COL.dim, al:'right', a:ga}); text(c, 'BD-rate ↓', x+40, 840, {s:18, c:COL.dim, a:ga});
  if(si >= 3) chip(c, 'qpa 1 = 感知  ·  qpa 0 = PSNR', 100, 860, st.accent, fin(L, sentT(st,3)), {s:24, mono:true});
};

S.av2 = (c, st) => { const si = sentIdx(st), L = st.L;
  const M = [100, 170, 1100, 619]; const sc = M[2]/1920;
  const k3 = si >= 3 ? sentT(st,3) : 1e9; const stage = L < 2 ? 0 : L < 4 ? 1 : L < k3 ? 2 : 3;
  const w = [0,1,2,3].map(i => i === stage ? 1 : (i < stage ? 0.18 : 0));
  st.panels.push({ rect: M, mode: 10, param: sc*1.2, q: w, alpha: fin(L,0.2) });
  frameBox(c, M, st.accent, fin(L,0.2));
  [['16 (MPEG-2/H.264)', '#9a9a9a'], ['64 (HEVC/VP9)', '#4dccff'], ['128 (AV1/VVC)', '#4dff80'], ['256 (AV2)', '#ff9933']].forEach((s, i) => chip(c, s[0], 100 + i*275, 810, s[1], i <= stage ? (i === stage ? 1 : 0.5) : 0.15, {s:20, mono:true}));
  const x = 1260; const a1 = fin(L, si >= 2 ? sentT(st,2) : 99);
  card(c, x, 170, 580, 300, Math.max(a1, fin(L,0.3)*0.5), st.accent);
  text(c, 'AVM v11 · RA vs AV1', x+30, 220, {s:24, c:COL.dim, mono:true, a:fin(L,0.3)});
  text(c, '−28.6%', x+30, 320, {s:84, w:800, mono:true, c:st.accent, glow:st.accent, a:a1}); text(c, 'PSNR-YUV', x+400, 318, {s:24, mono:true, a:a1});
  text(c, '−32.6%', x+30, 420, {s:84, w:800, mono:true, c:'#fff', a:a1}); text(c, 'VMAF', x+400, 418, {s:24, mono:true, a:a1});
  const ta = fin(L, si >= 3 ? sentT(st,3) : 99); card(c, x, 500, 580, 230, ta);
  ['二次变换 IST', '网格编码量化 TCQ', '奇偶隐藏 PH', '跨色度变换 CCTX', 'SB 256'].forEach((t, i) => chip(c, t, x + 24 + (i%2)*280, 525 + Math.floor(i/2)*62, st.accent, fin(L, sentT(st,3)+i*0.2), {s:20}));
  const sa = fin(L, si >= 4 ? sentT(st,4) : 99); card(c, x, 750, 580, 150, sa, COL.I);
  text(c, '现状：仅 AVM 参考编码器', x+30, 800, {s:26, w:700, a:sa}); text(c, '单遍 · < 1 fps · 档次止于 10 bit', x+30, 850, {s:24, c:COL.dim, a:sa});
  text(c, 'AV2 Spec v1.0.0 (2026) · Norkin, AV2 overview · arXiv:2601.02712', 100, 930, {s:20, c:COL.dim, a:fin(L,1)});
};

S.evolution = (c, st) => { const si = sentIdx(st), L = st.L; st.fx = 2;
  const cols = ['MPEG-2', 'H.264', 'HEVC', 'VVC / AV2'];
  const rows = [['最大块', ['16', '16', '64', '128 / 256'], [16,16,64,256]], ['划分', ['固定 MB', 'MB 分区', '四叉树', '多类型树'], [1,2,3,4]],
    ['帧内方向', ['DC', '9', '35', '67'], [1,9,35,67]], ['MV 精度', ['1/2', '1/4', '1/4', '1/16 + 仿射'], [2,4,4,16]],
    ['环路滤波', ['—', '去块', '+SAO', '+ALF / CDEF'], [0,1,2,4]], ['熵编码', ['VLC', 'CABAC', 'CABAC', '多模型 / 多符号'], [1,3,3,4]]];
  const x0 = 360, cw = 360, y0 = 230, rh = 112;
  cols.forEach((cl, j) => text(c, cl, x0 + j*cw + cw/2, 190, {s:30, w:800, al:'center', c: j === 3 ? st.accent : COL.txt, a:fin(L,0.2+j*0.1)}));
  const rowSent = [1, 2, 3, 3, 4, 5];
  rows.forEach((r, i) => { const k = rowSent[i]; const a = fin(L, si >= k ? sentT(st,k) + (i===3?1.2:0) : 99); const on = si === k;
    card(c, 80, y0 + i*rh, 1760, rh - 14, Math.max(a, 0.15), on ? st.accent : null);
    text(c, r[0], 110, y0 + i*rh + 60, {s:30, w:800, a:Math.max(a,0.3), c: on ? st.accent : COL.txt});
    const mx = Math.max(...r[2]);
    r[1].forEach((v, j) => { const x = x0 + j*cw + 20; const bwid = (cw - 60) * (r[2][j] / mx) * ease(clamp((L - sentT(st,k))/1.0 - j*0.15));
      c.save(); c.globalAlpha = a*0.5; c.fillStyle = j === 3 ? st.accent : '#4a5a7a'; c.fillRect(x, y0 + i*rh + 70, bwid, 10); c.restore();
      text(c, v, x + (cw-60)/2, y0 + i*rh + 52, {s:28, al:'center', mono:/^[0-9\/ +—]/.test(v), a, w:600}); }); });
};

S.choose = (c, st) => { const si = sentIdx(st), L = st.L;
  const G = [120, 220, 760, 600]; card(c, G[0]-30, G[1]-60, G[2]+60, G[3]+120, fin(L,0));
  text(c, '同画质码率', G[0], G[1]-10, {s:26, c:COL.B, a:fin(L,0.2)}); text(c, '编码复杂度 (log)', G[0]+400, G[1]-10, {s:26, c:COL.I, a:fin(L,0.2)});
  [['MPEG-2', 1.0, 0.1], ['H.264', 0.5, 0.3], ['HEVC', 0.27, 0.55], ['VVC', 0.14, 0.8]].forEach((g, i) => { const y = G[1] + 40 + i*140; const k = ease(clamp((L - 0.5 - i*0.4)/1.0));
    text(c, g[0], G[0], y+30, {s:26, w:700, a:k});
    c.save(); c.globalAlpha = k; c.fillStyle = COL.B; c.fillRect(G[0]+130, y+50, 240*g[1]*k, 26); c.fillStyle = COL.I; c.fillRect(G[0]+430, y+50, 300*g[2]*k, 26); c.restore(); });
  text(c, '每代 ≈ ½ 码率，≈ 10× 编码复杂度', G[0], G[1]+G[3]+30, {s:28, w:700, c:st.accent, a:fin(L,1.5)});
  const cards = [['要兼容一切', 'H.264', '#4da3ff'], ['效率 + 硬件解码', 'HEVC / AV1', '#3dd6c6'], ['为未来准备', 'H.266 · AVS3 · AV2', '#c56bff']];
  cards.forEach((cd, i) => { const a = fin(L, si >= i+1 ? sentT(st, i+1) + 0.3 : 99); const y = 200 + i*240;
    card(c, 1000, y, 820, 200, a, cd[2]); text(c, cd[0], 1040, y+70, {s:30, c:COL.dim, a}); text(c, cd[1], 1040, y+150, {s:58, w:800, c:cd[2], glow:cd[2], a}); });
};

S.outro = (c, st) => { const L = st.L; st.fx = 4; st.fxp = [clamp((L - (st.D - 2.2)) / 2.0), 0, 0, 0];
  recFrame(c, st, 'outro', 'github · VideoAnalyzer-Qt', st.D - 4.0);
  text(c, '压缩的本质', 120, 330, {s:44, c:COL.dim, a:fin(L,0.2)});
  text(c, '比特 × 画质 × 算力', 120, 430, {s:76, w:800, glow:st.accent, gb:40, a:fin(L,0.5)});
  text(c, '之间的交易', 120, 510, {s:44, c:COL.dim, a:fin(L,0.8)});
  ['I / P / B', 'J = D + λR', '档次 = 能力边界', '微调 = 调汇率与搜索'].forEach((s, i) => chip(c, s, 120, 590 + i*64, ['#ff4d5e','#ffcc4d','#3d8bff','#2fd27a'][i], fin(L, 1.5 + i*0.6), {s:24, mono: i < 2}));
  const ea = fin(L, st.D - 3.4, 0.6); text(c, '下期见', 960, 560, {s:110, w:800, al:'center', glow:st.accent, gb:50, a:ea});
};

S.refs = (c, st) => { const L = st.L; st.fx = 2;
  text(c, 'References', 120, 170, {s:44, w:800, glow:st.accent, a:fin(L,0)});
  const R = ['[1] N. Ahmed, T. Natarajan, K. R. Rao. Discrete Cosine Transform. IEEE Trans. Computers, 1974.',
    '[2] G. J. Sullivan, T. Wiegand. Rate-Distortion Optimization for Video Compression. IEEE SPM, 1998.',
    '[3] K. Rijkse. H.263: Video Coding for Low-Bit-Rate Communication. IEEE Commun. Mag., 1996.',
    '[4] T. Wiegand et al. Overview of the H.264/AVC Video Coding Standard. IEEE TCSVT, 2003.',
    '[5] D. Marpe, H. Schwarz, T. Wiegand. Context-Based Adaptive Binary Arithmetic Coding in H.264/AVC. IEEE TCSVT, 2003.',
    '[6] H. Schwarz, D. Marpe, T. Wiegand. Analysis of Hierarchical B Pictures and MCTF. ICME, 2006.',
    '[7] J. Bankoski et al. Technical Overview of VP8, an Open Source Video Codec for the Web. ICME, 2011.',
    '[8] G. J. Sullivan, J.-R. Ohm, W.-J. Han, T. Wiegand. Overview of the HEVC Standard. IEEE TCSVT, 2012.',
    '[9] D. Mukherjee et al. The Latest Open-Source Video Codec VP9 – An Overview and Preliminary Results. PCS, 2013.',
    '[10] A. Norkin, N. Birkbeck. Film Grain Synthesis for AV1 Video Codec. DCC, 2018.',
    '[11] J. Han et al. A Technical Overview of AV1. Proceedings of the IEEE, 2021.',
    '[12] B. Bross et al. Overview of the Versatile Video Coding (VVC) Standard and its Applications. IEEE TCSVT, 2021.',
    '[13] J. Zhang et al. Recent Development of AVS Video Coding Standard: AVS3. PCS, 2019.',
    '[14] AOMedia. AV2 Bitstream & Decoding Process Specification v1.0.0, 2026 · Transform and Entropy Coding in AV2, arXiv:2601.02712.'];
  R.forEach((r, i) => text(c, r, 120, 240 + i*50, {s:23, a:fin(L, 0.3 + i*0.12), c: i%2 ? COL.txt : '#c8d4ea'}));
  text(c, '录屏素材：VideoAnalyzer-Qt · 配音：manbo-tts · 音效：Minecraft 26.3 sounds · BGM：C418 - Minecraft / Aria Math / Strad · Mili - Grown-Up\'s Paradise', 120, 980, {s:22, c:COL.dim, a:fin(L,1.5)});
};

window.SC = { scenes: S, chrome, REC, CODEC,
  accentOf: seg => (seg.codec && CODEC[seg.codec]) ? CODEC[seg.codec].acc : ({'二 · I/P/B':'#ff4d5e','四 · 总结':'#ffcc4d','结尾':'#4da3ff','参考文献':'#8fb3ff'}[seg.ch] || '#4da3ff') };
})();
