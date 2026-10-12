// Player / renderer. One WebGL2 canvas, one fragment program per scene, text from a canvas-built atlas.
//   live:    open index.html, click to play (audio is the clock)
//   offline: index.html?render&w=1920&h=1080&fps=30&mb=8  — steps frames and POSTs raw frames to tools/render.mjs
(async function () {
  'use strict';
  const { LIB, MAIN, SCENES } = window.FILM;
  const BEAT = 5 / 12, B0 = 0.365, END = 100;          // 144 BPM; comb-fit phase 0.365 s; accents fall on beats = 0 (mod 4)
  const qs = new URLSearchParams(location.search);
  const RENDER = qs.has('render');
  const FPS = +(qs.get('fps') || 30);
  const cv = document.getElementById('c');
  const errBox = document.getElementById('err');
  const fail = m => { console.error(m); errBox.textContent += m + '\n'; errBox.hidden = false; };

  const gl = cv.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: RENDER, powerPreference: 'high-performance' });
  if (!gl) return fail('WebGL2 is not available in this browser.');
  const canFloat = !!gl.getExtension('EXT_color_buffer_float');
  const MB = canFloat ? Math.max(1, +(qs.get('mb') || (RENDER ? 8 : 1))) : 1;   // motion-blur sub-frames

  // timeline -----------------------------------------------------------------
  let n = -B0 / BEAT;
  const NONE = { d: '1e3', c: 'K' }, TYPE = { morph: 0, flip: 1, whip: 2, none: 3 };
  SCENES.forEach((s, i) => { s.n0 = n; n += s.d; s.n1 = n; s.prev = i ? SCENES[i - 1] : { hand: NONE, tout: 'none' }; s.hand = s.hand || NONE; s.tout = s.tout || 'morph'; });

  // text atlas -----------------------------------------------------------------
  const AT = 4096;
  const FONT = {
    sans: 'system-ui, -apple-system, "SF Pro Display", "Helvetica Neue", "PingFang SC", sans-serif',
    cn: '"PingFang SC", "Hiragino Sans GB", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Monaco, monospace',
  };
  const mc = document.createElement('canvas').getContext('2d');
  const fontOf = (tx, ch) => `${tx.i ? 'italic ' : ''}${tx.w || 500} ${Math.round(ch * .72)}px ${FONT[tx.f || 'sans']}`;
  let px = 0, py = 0, rowH = 0; const cells = new Map();
  const cell = tx => {                                  // shelf-pack; draw once the height is known
    const key = JSON.stringify(tx); if (cells.has(key)) return cells.get(key);
    const ch = tx.ch || 128; mc.font = fontOf(tx, ch);
    const w = Math.ceil(mc.measureText(tx.s).width) + 16;
    if (px + w + 8 > AT) { px = 0; py += rowH + 8; rowH = 0; }
    const c = { tx, x: px, y: py, w, ch }; px += w + 8; rowH = Math.max(rowH, ch);
    cells.set(key, c); return c;
  };
  for (const s of SCENES) s.cells = (s.texts || []).map(cell);
  let ATH = 1024; while (ATH < py + rowH) ATH *= 2;
  const ac = document.createElement('canvas'); ac.width = AT; ac.height = ATH;
  const ax = ac.getContext('2d');
  ax.fillStyle = '#000'; ax.fillRect(0, 0, AT, ATH); ax.fillStyle = '#fff'; ax.textBaseline = 'alphabetic';
  for (const c of cells.values()) { ax.font = fontOf(c.tx, c.ch); ax.fillText(c.tx.s, c.x + 8, c.y + Math.round(c.ch * .745)); }
  for (const s of SCENES) { s.tr = new Float32Array(48); s.cells.forEach((c, i) => s.tr.set([c.x / AT, c.y / ATH, c.w / AT, c.ch / ATH], i * 4)); }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, ac);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // programs -------------------------------------------------------------------
  const VS = `#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const HEAD = `#version 300 es
precision highp float;
uniform vec2 uRes,uAT;uniform float uBeat,uD,uGB;uniform sampler2D uTex;uniform vec4 uTR[12];
out vec4 fragColor;
`;
  const sh = (type, src, label) => {
    const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(o);
      const ln = +(/ERROR: \d+:(\d+)/.exec(log) || [])[1];
      fail(`[${label}] ${log}${ln ? '    > ' + src.split('\n')[ln - 1] : ''}`);
      return null;
    }
    return o;
  };
  const vs = sh(gl.VERTEX_SHADER, VS, 'vs');
  const program = (fs, label) => {
    const f = sh(gl.FRAGMENT_SHADER, fs, label); if (!f) return null;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, f);
    gl.bindAttribLocation(pr, 0, 'a'); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { fail(`[${label}] ${gl.getProgramInfoLog(pr)}`); return null; }
    const u = {}; const nu = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nu; i++) { const nm = gl.getActiveUniform(pr, i).name.replace('[0]', ''); u[nm] = gl.getUniformLocation(pr, nm); }
    return { pr, u };
  };
  const bg = program(HEAD + `uniform float uDith;
float hash(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
void main(){float S=min(uRes.y,uRes.x*.5625)*.5;vec2 p=(gl_FragCoord.xy-.5*uRes)/S;
  float v=max(.912-.0215*dot(p,p),.78)+uDith*(hash(gl_FragCoord.xy)-.5)/255.;fragColor=vec4(vec3(v),1.);}`, 'bg');
  const copy = program(HEAD + `uniform sampler2D uS;uniform float uW,uDith;
float hash(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 c=texelFetch(uS,ivec2(gl_FragCoord.xy),0).rgb*uW;fragColor=vec4(c+uDith*(hash(gl_FragCoord.xy)-.5)/255.,1.);}`, 'copy');
  for (const s of SCENES) {
    const a = s.prev.hand, b = s.hand;      // hand-off shape shared with the previous / next scene (q = position, u = beats from the cut)
    s.prog = program(`${HEAD}#define TIN ${TYPE[s.prev.tout]}\n#define TOUT ${TYPE[s.tout]}\n#define HCI ${a.ci || a.c}\n#define HCO ${b.c}\n${LIB}\nfloat hsI(vec2 q,float u){return ${a.d};}\nfloat hsO(vec2 q,float u){return ${b.d};}\n${s.glsl}\n${MAIN}`, s.name);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // float targets for temporal accumulation --------------------------------------
  let fbA, fbAcc, tA, tAcc, fbW = 0, fbH = 0;
  const target = () => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, cv.width, cv.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.activeTexture(gl.TEXTURE0);
    return [f, t];
  };
  const ensureTargets = () => {
    if (fbW === cv.width && fbH === cv.height) return;
    [fbA, tA] = target(); [fbAcc, tAcc] = target(); fbW = cv.width; fbH = cv.height;
  };

  // drawing ----------------------------------------------------------------------
  const sceneAt = beat => SCENES.find(s => beat < s.n1) || SCENES[SCENES.length - 1];
  function drawAt(T, dith) {
    const beat = (T - B0) / BEAT, s = sceneAt(beat);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.disable(gl.BLEND);
    gl.useProgram(bg.pr); gl.uniform2f(bg.u.uRes, cv.width, cv.height); gl.uniform1f(bg.u.uDith, dith);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!s.prog) return;
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(s.prog.pr);
    gl.uniform2f(s.prog.u.uRes, cv.width, cv.height);
    gl.uniform1f(s.prog.u.uBeat, beat - s.n0); gl.uniform1f(s.prog.u.uD, s.n1 - s.n0); gl.uniform1f(s.prog.u.uGB, beat);
    gl.uniform1i(s.prog.u.uTex, 0); gl.uniform4fv(s.prog.u.uTR, s.tr); gl.uniform2f(s.prog.u.uAT, AT, ATH);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function blit(texture, w, dith) {
    gl.useProgram(copy.pr); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(copy.u.uS, 1); gl.uniform1f(copy.u.uW, w); gl.uniform1f(copy.u.uDith, dith);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.activeTexture(gl.TEXTURE0);
  }
  function frame(T, dt) {
    if (MB <= 1) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); drawAt(T, 1); return; }
    ensureTargets();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbAcc); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    for (let j = 0; j < MB; j++) {                       // 180° shutter
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbA); drawAt(T + (j + .5) / MB * dt * .5, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbAcc); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); blit(tA, 1 / MB, 0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.disable(gl.BLEND); blit(tAcc, 1, 1);
  }

  // offline render ---------------------------------------------------------------
  if (RENDER) {
    cv.width = +(qs.get('w') || 1920); cv.height = +(qs.get('h') || 1080);
    document.getElementById('start').remove();
    const N = Math.round(END * FPS), from = +(qs.get('from') || 0), to = Math.min(N, +(qs.get('to') || N)), step = +(qs.get('step') || 1);
    if (!errBox.hidden) await fetch('/log', { method: 'POST', body: errBox.textContent });
    const pix = new Uint8Array(cv.width * cv.height * 4);
    for (let i = from; i < to; i += step) {
      frame(i / FPS, 1 / FPS);
      gl.readPixels(0, 0, cv.width, cv.height, gl.RGBA, gl.UNSIGNED_BYTE, pix);   // raw RGBA, bottom-up
      await fetch('/frame?i=' + i, { method: 'POST', body: pix });
    }
    await fetch('/done', { method: 'POST' });
    return;
  }

  // live player --------------------------------------------------------------------
  const audio = document.getElementById('snd'), start = document.getElementById('start'), bar = document.getElementById('bar');
  const fit = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d);
  };
  addEventListener('resize', fit); fit();
  let base = +(qs.get('t') || 0), stamp = performance.now(), last = -1, playing = false;
  const now = () => playing ? Math.min(END, base + (performance.now() - stamp) / 1000) : base;
  const seek = t => { base = Math.max(0, Math.min(END - .05, t)); stamp = performance.now(); audio.currentTime = base; };
  const play = async () => { start.hidden = true; audio.currentTime = base; try { await audio.play(); } catch (e) {} playing = true; stamp = performance.now(); };
  const pause = () => { base = now(); playing = false; audio.pause(); };
  start.addEventListener('click', play);
  cv.addEventListener('click', () => playing ? pause() : play());
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(now() + 5 * BEAT * 4 / 5);
    else if (e.code === 'ArrowLeft') seek(now() - 5 * BEAT * 4 / 5);
    else if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    else if (e.key === 'r' || e.key === 'R') { seek(0); }
  });
  document.getElementById('track').addEventListener('click', e => seek(e.offsetX / e.currentTarget.clientWidth * END));
  let idle; addEventListener('mousemove', () => { document.body.classList.add('active'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.remove('active'), 1800); });
  (function loop() {
    // audio is the master clock; re-anchor whenever it drifts from the smooth local clock
    if (playing && !audio.paused && Math.abs(audio.currentTime - now()) > .06) { base = audio.currentTime; stamp = performance.now(); }
    const T = now();
    if (playing && T >= END) { playing = false; base = END - .001; audio.pause(); start.hidden = false; base = 0; }
    frame(T, 1 / 60);
    if (T !== last) { bar.style.width = (T / END * 100) + '%'; last = T; }
    requestAnimationFrame(loop);
  })();
  window.__film = { seek, play, pause, frame, SCENES };
})();
