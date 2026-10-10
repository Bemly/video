import * as THREE from 'three';
import { SX, SY, SZ, FX, FY, FZ } from './world.js';
import { makeSprites, SPR_N, SW, SH } from './sprites.js';
import { VERT, FRAG, POST } from './shader.js';

const MAX_ENT = 12;
export const defaultOpt = () => ({ look: 2, outline: 1, shadow: 1, field: 1, glitch: 1 });

export class Renderer {
  constructor(canvas, world, { scale = 1 } = {}) {
    this.world = world; this.scale = scale;
    const r = this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.autoClear = false;
    const tex3 = (data, w, h, d, fmt, filter) => {
      const t = new THREE.Data3DTexture(data, w, h, d);
      t.format = fmt; t.type = THREE.UnsignedByteType; t.minFilter = t.magFilter = filter;
      t.unpackAlignment = 1; t.needsUpdate = true; return t;
    };
    this.tVox = tex3(world.vox, SX, SY, SZ, THREE.RGFormat, THREE.NearestFilter);
    this.tField = tex3(world.fieldU8, FX, FY, FZ, THREE.RedFormat, THREE.LinearFilter);
    this.tSpr = tex3(makeSprites(), SW, SH, SW * SPR_N, THREE.RedFormat, THREE.NearestFilter);
    const v3 = () => new THREE.Vector3();
    this.u = {
      uVox: { value: this.tVox }, uField: { value: this.tField }, uSpr: { value: this.tSpr },
      uCamPos: { value: v3() }, uCamR: { value: v3() }, uCamU: { value: v3() }, uCamF: { value: v3() },
      uTanFov: { value: 0.6 }, uAspect: { value: 1 }, uTime: { value: 0 }, uPhi: { value: 0 }, uSigma: { value: 0 }, uEye: { value: 0 }, uPx: { value: 0.001 },
      uEnt: { value: Array.from({ length: MAX_ENT }, () => new THREE.Vector4()) },
      uEntP: { value: Array.from({ length: MAX_ENT }, () => new THREE.Vector4()) },
      uEntN: { value: 0 }, uT0: { value: v3() }, uT1: { value: v3() }, uLook: { value: v3() }, uOpt: { value: new THREE.Vector4(2, 1, 1, 1) },
    };
    this.pu = { uTex: { value: null }, uTime: { value: 0 }, uSigma: { value: 0 }, uGlitch: { value: 1 }, uRes: { value: new THREE.Vector2(1, 1) } };
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const mk = (frag, uniforms) => {
      const m = new THREE.Mesh(geo, new THREE.RawShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false }));
      m.frustumCulled = false; const s = new THREE.Scene(); s.add(m); return s;
    };
    this.scene = mk(FRAG, this.u); this.post = mk(POST, this.pu);
    this.cam = new THREE.Camera();
    this.rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    this.pu.uTex.value = this.rt.texture;
  }
  setWorld(world) {
    if (this.world === world) return;
    this.world = world; world.voxDirty = true;
    this.tVox.image.data = world.vox; this.tField.image.data = world.fieldU8;
  }
  setSize(w, h) {
    this.w = w; this.h = h;
    this.gl.setSize(w, h, false);
    this.rt.setSize(Math.round(w * this.scale), Math.round(h * this.scale));
    this.u.uAspect.value = w / h; this.pu.uRes.value.set(w, h);
  }
  // view: { cam:{pos,target,fov}, time, phi, sigma, eye, ents:[{p,yaw,model,w,tint,size}], tether:[a,b], look:[x,y,z], opt }
  render(view) {
    const u = this.u, W = this.world;
    if (W.voxDirty) { this.tVox.needsUpdate = true; W.voxDirty = false; }
    W.packField(); this.tField.needsUpdate = true;
    const p = new THREE.Vector3(...view.cam.pos), f = new THREE.Vector3(...view.cam.target).sub(p).normalize();
    const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(r, f);
    u.uCamPos.value.copy(p); u.uCamF.value.copy(f); u.uCamR.value.copy(r); u.uCamU.value.copy(up);
    const tan = Math.tan(((view.cam.fov || 60) * Math.PI) / 360);
    u.uTanFov.value = tan; u.uPx.value = (2 * tan) / (this.h * this.scale);
    u.uTime.value = view.time; u.uPhi.value = view.phi; u.uSigma.value = view.sigma; u.uEye.value = view.eye;
    const o = { ...defaultOpt(), ...(view.opt || {}) };
    u.uOpt.value.set(o.look, o.outline, o.shadow, o.field);
    const n = Math.min(MAX_ENT, view.ents.length);
    for (let i = 0; i < n; i++) {
      const e = view.ents[i];
      u.uEnt.value[i].set(e.p[0], e.p[1], e.p[2], e.yaw);
      u.uEntP.value[i].set(e.model, e.w, e.tint || 0, e.size || 0.115);
    }
    u.uEntN.value = n;
    u.uT0.value.set(...view.tether[0]); u.uT1.value.set(...view.tether[1]); u.uLook.value.set(...view.look);
    this.pu.uTime.value = view.time; this.pu.uSigma.value = view.sigma; this.pu.uGlitch.value = o.glitch;
    this.gl.setRenderTarget(this.rt); this.gl.render(this.scene, this.cam);
    this.gl.setRenderTarget(null); this.gl.render(this.post, this.cam);
  }
}

// assemble what the shader needs from the simulation state
export function viewOf(sim, cam, phi, opt) {
  const [A, B] = sim.bodies, split = sim.split;
  const tint = Math.min(1, Math.max(0, (split - 0.06) / 0.5));
  const frame = Math.floor(sim.walk) % 2;
  const body = (b, w) => ({ p: [b.p[0], b.vy, b.p[2]], yaw: sim.yaw, model: frame, w, tint });
  const ents = [body(A, 0), body(B, 1)];
  for (const e of sim.ents) ents.push({ p: e.p, yaw: e.yaw, model: e.model, w: e.w, tint: 0, size: e.model === 3 ? 0.15 * (1 + 0.06 * Math.sin(sim.t * 3 + e.seed * 20)) : 0.118 });
  return {
    cam, time: sim.t, phi, sigma: sim.sigmaS, eye: sim.eye, ents,
    tether: [[A.p[0], A.vy + 1.0, A.p[2]], [B.p[0], B.vy + 1.0, B.p[2]]],
    look: sim.mid, opt,
  };
}
