import {geoContains} from 'd3-geo';
import {feature} from 'topojson-client';
import fs from 'node:fs';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topo, topo.objects.land);
const N = 36000, pts = [];
const g = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
  const lat = Math.asin(y) * 180 / Math.PI;
  const lon = ((Math.atan2(Math.sin(th) * r, Math.cos(th) * r) * 180 / Math.PI) + 540) % 360 - 180;
  if (geoContains(land, [lon, lat])) pts.push(+lon.toFixed(2), +lat.toFixed(2));
}
fs.writeFileSync('src/globe_dots.json', JSON.stringify(pts));
console.log('dots', pts.length / 2);
