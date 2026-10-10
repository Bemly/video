// One ray, two worlds: a DDA walk through a voxel grid whose texels hold (world A id, world B id).
export const VERT = /* glsl */ `
in vec3 position;
out vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `
precision highp float; precision highp int; precision highp sampler3D;
uniform sampler3D uVox;    // rg = material id in world A / world B
uniform sampler3D uField;  // conflict field, half resolution
uniform sampler3D uSpr;    // voxel sprites
uniform vec3 uCamPos, uCamR, uCamU, uCamF;
uniform float uTanFov, uAspect, uTime, uPhi, uSigma, uEye, uPx;
uniform vec4 uEnt[12];     // xyz = feet, w = yaw
uniform vec4 uEntP[12];    // model, world, split tint, voxel size
uniform int uEntN;
uniform vec3 uT0, uT1, uLook;
uniform vec4 uOpt;         // look (0 grey, 1 union, 2 dual), outline, shadow, field
in vec2 vUv;
out vec4 outColor;

const vec3 SIZE = vec3(128., 40., 64.);
const vec3 SUN_A = vec3(-0.5215, 0.7421, 0.4212);
const vec3 SUN_B = vec3(0.3802, 0.8604, -0.3402);
const vec3 HOT1 = vec3(1.0, 0.16, 0.72), HOT2 = vec3(0.82, 1.0, 0.2);
const float GHOST = 0.13;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p) { p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

ivec2 vox(ivec3 c) {
  if (any(lessThan(c, ivec3(0))) || any(greaterThanEqual(c, ivec3(SIZE)))) return ivec2(0);
  return ivec2(texelFetch(uVox, c, 0).rg * 255. + .5);
}
bool sol(int id) { return id > 0 && id < 15; }
bool solW(int w, ivec3 c) { ivec2 m = vox(c); return w == 0 ? sol(m.x) : w == 1 ? sol(m.y) : (sol(m.x) || sol(m.y)); }

vec3 palA(int id) {
  if (id == 1) return vec3(.86, .80, .65); if (id == 2) return vec3(.40, .34, .38); if (id == 3) return vec3(.70, .33, .26);
  if (id == 4) return vec3(.74, .69, .61); if (id == 5) return vec3(.25, .17, .17); if (id == 6) return vec3(1., .80, .32);
  return vec3(.88, .68, .24);
}
vec3 palB(int id) {
  if (id == 1) return vec3(.20, .33, .42); if (id == 2) return vec3(.90, .40, .52); if (id == 3) return vec3(.45, .27, .62);
  if (id == 4) return vec3(.74, .86, .78); if (id == 5) return vec3(.96, .95, .86); if (id == 6) return vec3(.88, .95, .22);
  if (id == 7) return vec3(.20, .58, .44); return vec3(.05, .03, .09);
}
vec3 fringe(vec3 p) { // interference bands between the two worlds
  float b = sin(dot(p, vec3(2.1, 3.3, 1.7)) * 1.5 - uTime * 6.);
  return b > 0. ? HOT1 : HOT2;
}

float shadowW(int w, vec3 p, vec3 L) {
  ivec3 c = ivec3(floor(p)); vec3 sg = sign(L); ivec3 st = ivec3(sg);
  vec3 inv = 1. / L, tD = abs(inv), tM = (vec3(c) + max(sg, 0.) - p) * inv;
  for (int i = 0; i < 44; i++) {
    if (tM.x < tM.y && tM.x < tM.z) { tM.x += tD.x; c.x += st.x; }
    else if (tM.y < tM.z) { tM.y += tD.y; c.y += st.y; }
    else { tM.z += tD.z; c.z += st.z; }
    if (c.y >= int(SIZE.y) || c.x < 0 || c.z < 0 || c.x >= int(SIZE.x) || c.z >= int(SIZE.z)) return 0.;
    if (solW(w, c)) return 1.;
  }
  return 0.;
}

// cel shading for one voxel face: flat bands, ink on silhouettes and creases
vec3 shadeW(int w, int id, ivec3 c, vec3 n, vec3 p, float t, bool wet, out float edge) {
  int nw = uOpt.x < 1.5 ? 2 : w;
  vec3 base = id == 14 ? mix(vec3(.97, .94, 1.), vec3(.72, .96, .92), .5 + .5 * sin(dot(p, vec3(1.3, 2.1, 1.7)) + uTime * 2.)) : (w == 0 ? palA(id) : palB(id));
  bool emis = (w == 0 && id == 6) || (w == 1 && (id == 5 || id == 6)) || id == 14;
  if (uOpt.x < .5) { base = vec3(.74); emis = false; }
  else base *= .94 + .12 * hash13(vec3(c) + float(w) * 7.);
  ivec3 nI = ivec3(n), du, dv; vec2 fr;
  if (abs(n.x) > .5) { du = ivec3(0, 0, 1); dv = ivec3(0, 1, 0); fr = fract(p.zy); }
  else if (abs(n.y) > .5) { du = ivec3(1, 0, 0); dv = ivec3(0, 0, 1); fr = fract(p.xz); }
  else { du = ivec3(1, 0, 0); dv = ivec3(0, 1, 0); fr = fract(p.xy); }
  float ed = 1., ao = 1.; bool s1, s2;
  s1 = solW(nw, c - du); s2 = solW(nw, c - du + nI); if (!s1 || s2) ed = min(ed, fr.x); if (s2) ao = min(ao, fr.x);
  s1 = solW(nw, c + du); s2 = solW(nw, c + du + nI); if (!s1 || s2) ed = min(ed, 1. - fr.x); if (s2) ao = min(ao, 1. - fr.x);
  s1 = solW(nw, c - dv); s2 = solW(nw, c - dv + nI); if (!s1 || s2) ed = min(ed, fr.y); if (s2) ao = min(ao, fr.y);
  s1 = solW(nw, c + dv); s2 = solW(nw, c + dv + nI); if (!s1 || s2) ed = min(ed, 1. - fr.y); if (s2) ao = min(ao, 1. - fr.y);
  float px = t * uPx, wd = max(.06, 1.6 * px);
  edge = uOpt.y > .5 ? 1. - smoothstep(wd - px, wd + px, ed) : 0.;
  vec3 L = w == 0 ? SUN_A : SUN_B;
  float ndl = dot(n, L);
  float lv = ndl > .55 ? 1. : ndl > .1 ? .6 : .28;
  if (uOpt.z > .5) {
    if (lv > .3 && shadowW(nw, p + n * .02, L) > .5) lv = .28;
    if (n.y > .5) for (int i = 0; i < uEntN; i++) { // blob shadows: only from things in the same world
      if (int(uEntP[i].y + .5) != w) continue;
      vec3 d = uEnt[i].xyz - p;
      if (d.y > -.3 && d.y < 7. && dot(d.xz, d.xz) < .2 + d.y * .02) lv = min(lv, .28);
    }
    if (ao < .2) lv = max(0., lv - .2);
  }
  vec3 dark = w == 0 ? vec3(.50, .40, .53) : vec3(.34, .45, .66);
  vec3 lit = w == 0 ? vec3(1.04, 1., .93) : vec3(.93, 1., 1.05);
  if (uOpt.x < .5) { dark = vec3(.42); lit = vec3(1.); }
  vec3 col = emis ? base : base * mix(dark, lit, lv);
  if (wet && n.y > .5) { // caustics, as flat stripes
    float k = sin(p.x * 2.3 + sin(p.z * 1.9 + uTime * .9) * 1.6 + uTime * .7) * sin(p.z * 2.7 - uTime * .6);
    col += step(.55, k) * vec3(.10, .16, .15);
  }
  return col;
}

vec3 sprCol(int model, int id) {
  if (model < 2) { if (id == 1) return vec3(.24, .20, .30); if (id == 2) return vec3(.96, .93, .86); if (id == 3) return vec3(.95, .87, .78); if (id == 4) return vec3(1., .88, .45); return vec3(.12, .10, .14); }
  if (model == 2) { if (id == 1) return vec3(.40, .08, .12); if (id == 2) return vec3(.64, .16, .15); if (id == 3) return vec3(.05, .03, .05); return vec3(1., .82, .3); }
  if (id == 1) return vec3(.80, .93, .97); if (id == 2) return vec3(.50, .74, .93); if (id == 3) return vec3(.63, .5, .87); if (id == 4) return vec3(.9, 1., .3); return vec3(.06, .03, .1);
}
int sprAt(int model, ivec3 c) {
  if (any(lessThan(c, ivec3(0))) || c.x > 7 || c.y > 15 || c.z > 7) return 0;
  return int(texelFetch(uSpr, ivec3(c.x, c.y, c.z + model * 8), 0).r * 255. + .5);
}
bool entHit(int i, vec3 ro, vec3 rd, out float tHit, out vec3 col) {
  vec4 e = uEnt[i], ep = uEntP[i];
  float s = ep.w; int model = int(ep.x + .5), w = int(ep.y + .5);
  float cy = cos(e.w), sy = sin(e.w);
  vec3 q = ro - e.xyz;
  vec3 lo = vec3(q.x * cy - q.z * sy, q.y, q.x * sy + q.z * cy) / s + vec3(4., 0., 4.);
  vec3 ld = vec3(rd.x * cy - rd.z * sy, rd.y, rd.x * sy + rd.z * cy) / s + 1e-6;
  vec3 inv = 1. / ld, a0 = -lo * inv, a1 = (vec3(8., 16., 8.) - lo) * inv, tmn = min(a0, a1), tmx = max(a0, a1);
  float tn = max(max(tmn.x, tmn.y), tmn.z), tf = min(min(tmx.x, tmx.y), tmx.z);
  if (tf < max(tn, 0.)) return false;
  float t = max(tn, 0.);
  vec3 sg = sign(ld); ivec3 st = ivec3(sg);
  ivec3 c = ivec3(clamp(floor(lo + ld * (t + 1e-4)), vec3(0.), vec3(7., 15., 7.)));
  vec3 tD = abs(inv), tM = (vec3(c) + max(sg, 0.) - lo) * inv;
  vec3 n = tn == tmn.x ? vec3(-sg.x, 0., 0.) : tn == tmn.y ? vec3(0., -sg.y, 0.) : vec3(0., 0., -sg.z);
  for (int k = 0; k < 34; k++) {
    int id = sprAt(model, c);
    if (id > 0) {
      vec3 hp = lo + ld * t; ivec3 nI = ivec3(n), du, dv; vec2 fr;
      if (abs(n.x) > .5) { du = ivec3(0, 0, 1); dv = ivec3(0, 1, 0); fr = fract(hp.zy); }
      else if (abs(n.y) > .5) { du = ivec3(1, 0, 0); dv = ivec3(0, 0, 1); fr = fract(hp.xz); }
      else { du = ivec3(1, 0, 0); dv = ivec3(0, 1, 0); fr = fract(hp.xy); }
      float ed = 1.;
      if (sprAt(model, c - du) == 0 || sprAt(model, c - du + nI) > 0) ed = min(ed, fr.x);
      if (sprAt(model, c + du) == 0 || sprAt(model, c + du + nI) > 0) ed = min(ed, 1. - fr.x);
      if (sprAt(model, c - dv) == 0 || sprAt(model, c - dv + nI) > 0) ed = min(ed, fr.y);
      if (sprAt(model, c + dv) == 0 || sprAt(model, c + dv + nI) > 0) ed = min(ed, 1. - fr.y);
      vec3 nw = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);
      float ndl = dot(nw, w == 0 ? SUN_A : SUN_B);
      vec3 base = sprCol(model, id);
      bool emis = id == 4;
      col = emis ? base : base * mix(vec3(.52, .44, .60), vec3(1.03), ndl > .5 ? 1. : ndl > .05 ? .6 : .25);
      vec3 tint = w == 0 ? vec3(1., .52, .22) : vec3(.25, .85, 1.);
      col = mix(col, tint * (emis ? 1.2 : dot(col, vec3(.4)) + .35), ep.z * .7);
      float wd = max(.16, 1.6 * t * uPx / s);
      if (uOpt.y > .5) col = mix(col, mix(vec3(.08, .05, .1), tint * .35, ep.z), 1. - smoothstep(wd * .7, wd, ed));
      tHit = t; return true;
    }
    if (tM.x < tM.y && tM.x < tM.z) { t = tM.x; tM.x += tD.x; c.x += st.x; n = vec3(-sg.x, 0., 0.); }
    else if (tM.y < tM.z) { t = tM.y; tM.y += tD.y; c.y += st.y; n = vec3(0., -sg.y, 0.); }
    else { t = tM.z; tM.z += tD.z; c.z += st.z; n = vec3(0., 0., -sg.z); }
    if (any(lessThan(c, ivec3(0))) || c.x > 7 || c.y > 15 || c.z > 7) break;
  }
  return false;
}

vec3 sky(vec3 rd) {
  float h = rd.y;
  // A: ash sky, black sun
  float ka = floor(smoothstep(-.05, .75, h) * 7.) / 7.;
  vec3 a = mix(vec3(.95, .87, .68), vec3(.52, .45, .56), ka);
  float sd = dot(rd, SUN_A);
  float ang = atan(dot(rd, normalize(cross(SUN_A, vec3(0., 1., 0.)))), dot(rd, normalize(cross(cross(SUN_A, vec3(0., 1., 0.)), SUN_A))));
  float ray = .5 + .5 * sin(ang * 12. + uTime * .2);
  if (sd > .9925 - ray * .004) a = vec3(1., .96, .82);
  if (sd > .9962) a = vec3(.10, .06, .09);
  if (h < 0.) a = mix(vec3(.80, .73, .60), vec3(.60, .54, .50), clamp(-h * 4., 0., 1.));
  // B: the drowned sky
  float kb = floor(smoothstep(-.3, 1., h) * 7.) / 7.;
  vec3 b = mix(vec3(.03, .09, .14), vec3(.10, .44, .47), kb);
  b += step(.72, sin(rd.x * 13. + rd.z * 8. + uTime * .25)) * smoothstep(.15, .9, h) * vec3(.04, .09, .08);
  vec3 g = floor(rd * 42.); float tw = hash13(g);
  if (tw > .985) b += vec3(.25, .4, .38) * (.5 + .5 * sin(uTime * 2. + tw * 90.));
  vec3 c = uOpt.x < .5 ? mix(vec3(.80, .84, .90), vec3(.45, .56, .72), smoothstep(-.1, .8, h)) : mix(a, b, uPhi);
  // the thing that watches from between the worlds
  if (uEye > .01) {
    vec3 E = normalize(vec3(.78, .56, 0.)), ex = vec3(0., 0., -1.), ey = cross(ex, E);
    float f = dot(rd, E);
    if (f > .3) {
      vec2 q = vec2(dot(rd, ex), dot(rd, ey)) / f;
      float open = uEye * (.9 + .1 * sin(uTime * .8));
      float lid = open * .17 * (1. - q.x * q.x / .13) - abs(q.y);
      float inside = q.x * q.x < .13 ? lid : -1.;
      vec2 ic = vec2(clamp((uLook.z - 31.5) * -.003, -.06, .06), -.025 * open + (uLook.x - 64.) * -.0004);
      float ir = length(q - ic);
      vec3 ec = vec3(.94, .90, .72);
      if (hash12(floor(q * 60.)) > .93) ec = vec3(.85, .45, .45);
      if (ir < .125) ec = mix(HOT2, HOT1, step(.5, fract(atan(q.y - ic.y, q.x - ic.x) * 2.5 + ir * 20. - uTime * .5)));
      if (ir < .125 && ir > .112) ec = vec3(.08, .04, .12);
      if (abs(q.x - ic.x) < .014 + .02 * (1. - open) + .012 * sin(uTime * 1.3) && abs(q.y - ic.y) < .095) ec = vec3(.03, .01, .06);
      float a2 = smoothstep(.02, .12, uEye);
      if (inside > 0.) c = mix(c, inside < .012 ? vec3(.07, .03, .1) : ec, a2);
      else if (inside > -.012 && q.x * q.x < .135) c = mix(c, vec3(.07, .03, .1), a2);
    }
  }
  return c;
}

void main() {
  vec2 ndc = vUv * 2. - 1.;
  vec3 ro = uCamPos, rd = normalize(uCamF + uCamR * ndc.x * uTanFov * uAspect + uCamU * ndc.y * uTanFov);
  rd += vec3(1e-5, 2e-5, 3e-5);
  bool dual = uOpt.x > 1.5;
  float visA = dual ? mix(1., GHOST, smoothstep(0., 1., uPhi)) : 1.;
  float visB = dual ? mix(GHOST, 1., smoothstep(0., 1., uPhi)) : 1.;

  // nearest two sprite hits
  float tE0 = 1e9, tE1 = 1e9; vec3 cE0 = vec3(0.), cE1 = vec3(0.); float aE0 = 1., aE1 = 1.; bool pE0 = false, pE1 = false;
  for (int i = 0; i < uEntN; i++) {
    float th; vec3 ch;
    if (!entHit(i, ro, rd, th, ch)) continue;
    bool pl = int(uEntP[i].x + .5) < 2;
    float al = pl ? 1. : (int(uEntP[i].y + .5) == 0 ? max(visA, .45) : max(visB, .45));
    if (th < tE0) { tE1 = tE0; cE1 = cE0; aE1 = aE0; pE1 = pE0; tE0 = th; cE0 = ch; aE0 = al; pE0 = pl; }
    else if (th < tE1) { tE1 = th; cE1 = ch; aE1 = al; pE1 = pl; }
  }

  vec3 col = vec3(0.); float T = 1., fa = 0., tStop = 1e9;
  vec3 inv = 1. / rd, b0 = -ro * inv, b1 = (SIZE - ro) * inv, tmn = min(b0, b1), tmx = max(b0, b1);
  float tn = max(max(tmn.x, tmn.y), tmn.z), tf = min(min(tmx.x, tmx.y), tmx.z);
  if (tf > max(tn, 0.)) {
    bool inside = tn < 0.;
    float t = max(tn, 0.);
    vec3 sg = sign(rd); ivec3 st = ivec3(sg);
    ivec3 c = ivec3(clamp(floor(ro + rd * (t + 1e-3)), vec3(0.), SIZE - 1.));
    vec3 tD = abs(inv), tM = (vec3(c) + max(sg, 0.) - ro) * inv;
    vec3 n = tn == tmn.x ? vec3(-sg.x, 0., 0.) : tn == tmn.y ? vec3(0., -sg.y, 0.) : vec3(0., 0., -sg.z);
    ivec2 prev = inside ? vox(c) : ivec2(0);
    int shadowsLeft = 2;
    for (int i = 0; i < 260; i++) {
      ivec2 m = vox(c);
      float tNext = min(tM.x, min(tM.y, tM.z)), seg = tNext - t;
      // sprites that sit before this cell
      if (tE0 < t) { col += T * aE0 * cE0; T *= 1. - aE0; tE0 = tE1; cE0 = cE1; aE0 = aE1; pE0 = pE1; tE1 = 1e9; }
      if (tE0 < t) { col += T * aE0 * cE0; T *= 1. - aE0; tE0 = 1e9; }
      if (T < .02) { tStop = t; break; }

      bool sa = sol(m.x), sb = sol(m.y), psa = sol(prev.x), psb = sol(prev.y);
      bool wa = m.y == 15, pwa = prev.y == 15;
      vec3 p = ro + rd * t;
      float f = uOpt.w > .5 ? texture(uField, (vec3(c) + .5) / SIZE).r : 0.;

      // water surface (world B only)
      if (dual && ((wa && !pwa && !psb) || (pwa && !wa && !sb))) {
        vec3 wc = vec3(.20, .70, .74); float al = .42;
        if (abs(n.y) > .5) {
          float k = sin(p.x * 1.9 + sin(p.z * 1.3 + uTime * .7) * 1.5 + uTime) * sin(p.z * 2.3 + uTime * .5);
          if (abs(k - .55) < .035) { wc = vec3(.92, 1., .98); al = .85; }
        } else if (fract(p.y) > .86 && wa) { wc = vec3(.92, 1., .98); al = .8; }
        al *= visB;
        col += T * al * wc; T *= 1. - al;
      }
      if ((sa && !psa) || (sb && !psb)) {
        float edge, eb; vec3 sc; float al;
        bool wet = pwa || wa;
        if (sa && sb) {
          sc = shadeW(0, m.x, c, n, p, t, false, edge);
          vec3 sc2 = shadeW(1, m.y, c, n, p, t, wet, eb);
          if (dual) { sc = mix(sc, sc2, uPhi); sc = mix(sc, mix(vec3(.17, .10, .11), vec3(.05, .07, .17), uPhi), max(edge, eb)); }
          else sc = mix(sc, vec3(.12, .09, .12), edge);
          al = 1.;
        } else {
          int w = (sa && !psa) ? 0 : 1;
          float vis = w == 0 ? visA : visB, gh = 1. - (vis - GHOST) / (1. - GHOST);
          sc = shadeW(w, w == 0 ? m.x : m.y, c, n, p, t, w == 1 && wet, edge);
          vec3 tint = w == 0 ? vec3(1., .74, .40) : vec3(.36, .88, .98);
          vec3 ink = w == 0 ? vec3(.17, .10, .11) : vec3(.05, .07, .17);
          sc = mix(sc, tint * (dot(sc, vec3(.33)) * .8 + .3), gh * .75);
          sc = mix(sc, mix(ink, tint, gh), edge);
          al = mix(vis, max(vis, .9), edge);
          if (!dual) { al = 1.; }
        }
        if (f > .03) { // matter caught in the conflict field
          float hatch = step(.5, fract((p.x + p.y + p.z) * 2.5 - uTime * 1.5));
          sc = mix(sc, fringe(p) * (.75 + .25 * hatch), clamp(f * 1.6 - .1, 0., .8) * (.55 + .45 * hatch));
          al = max(al, clamp(f * 2., 0., 1.));
        }
        col += T * al * sc; T *= 1. - al;
        if (T < .02) { tStop = t; break; }
      }
      // media: water, ghost matter, conflict field
      if (wa && dual) { float ab = (1. - exp(-seg * .075)) * visB; col += T * ab * vec3(.05, .27, .36); T *= 1. - ab; }
      if (dual && sa != sb) { float ab = (1. - exp(-seg * .05)) * (sa ? 1. - visA : 1. - visB); col += T * ab * (sa ? vec3(.9, .6, .3) : vec3(.25, .7, .85)); T *= 1. - ab; }
      if (f > .02) {
        float g = 1. - exp(-f * f * seg * .32);
        col += T * g * fringe(vec3(c) * .35) * (.7 + .3 * step(.5, hash13(vec3(c) + floor(uTime * 12.))));
        T *= 1. - g * .6; fa += g * 2.;
      }

      prev = m; t = tNext;
      if (tM.x < tM.y && tM.x < tM.z) { tM.x += tD.x; c.x += st.x; n = vec3(-sg.x, 0., 0.); }
      else if (tM.y < tM.z) { tM.y += tD.y; c.y += st.y; n = vec3(0., -sg.y, 0.); }
      else { tM.z += tD.z; c.z += st.z; n = vec3(0., 0., -sg.z); }
      if (any(lessThan(c, ivec3(0))) || any(greaterThanEqual(c, ivec3(SIZE)))) break;
    }
  }
  bool x0 = tE0 < 1e8 && tE0 >= tStop && pE0, x1 = tE1 < 1e8 && tE1 >= tStop && pE1;
  if (tE0 < tStop) { col += T * aE0 * cE0; T *= 1. - aE0; if (aE0 > .9) tStop = tE0; }
  if (tE1 < tStop) { col += T * aE1 * cE1; T *= 1. - aE1; }
  col += T * sky(rd);
  // the player's bodies stay faintly visible through matter, so a split is never hidden
  if (x1) col = mix(col, cE1, .38);
  if (x0) col = mix(col, cE0, .38);

  // the tether between the two bodies
  if (uOpt.w > .5 && uSigma > .03) {
    vec3 ab = uT1 - uT0, ao = ro - uT0;
    float A = dot(rd, ab), B = dot(ab, ab), C = dot(rd, ao), D = dot(ab, ao);
    float s = clamp((D - A * C) / max(B - A * A, 1e-5), 0., 1.);
    float tr = A * s - C;
    if (tr > 0. && tr < tStop) {
      vec3 pc = uT0 + ab * s;
      float jag = (hash12(vec2(floor(s * 9.), floor(uTime * 16.))) - .5) * .22 * min(1., sqrt(B));
      float d = length(ro + rd * tr - pc - vec3(0., jag, 0.));
      float wdt = .05 + .07 * uSigma;
      if (d < wdt) { col = mix(col, d < wdt * .45 ? vec3(1.) : fringe(pc * 3.), .95); fa += .6; }
    }
  }
  outColor = vec4(col, clamp(fa, 0., 1.));
}
`;

export const POST = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uTime, uSigma, uGlitch;
uniform vec2 uRes;
in vec2 vUv;
out vec4 outColor;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec2 uv = vUv;
  float a = texture(uTex, uv).a;
  float row = floor(uv.y * uRes.y / 8.), tick = floor(uTime * 20.);
  float tear = (hash12(vec2(row, tick)) - .5) * step(.95 - uSigma * .22, hash12(vec2(row * 1.7, tick + 3.))) * uSigma * .035 * uGlitch;
  float ca = (a * .0035 + uSigma * .0012) * uGlitch;
  vec3 c;
  c.r = texture(uTex, uv + vec2(tear + ca, 0.)).r;
  c.g = texture(uTex, uv + vec2(tear, 0.)).g;
  c.b = texture(uTex, uv + vec2(tear - ca, 0.)).b;
  vec2 q = uv - .5;
  c *= 1. - dot(q, q) * .38;
  c += (hash12(uv * uRes + fract(uTime) * 71.) - .5) * .014;
  outColor = vec4(c, 1.);
}
`;
