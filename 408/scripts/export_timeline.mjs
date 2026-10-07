import {build} from 'esbuild';
import fs from 'node:fs';
await build({
  stdin: {
    contents: `import {SHOTS, TOTAL, ACT_RANGES} from './src/timeline';
      import fs from 'node:fs';
      fs.writeFileSync('audio/timeline.json', JSON.stringify({total: TOTAL, acts: ACT_RANGES, shots: SHOTS.map(s => ({id: s.id, start: s.start, end: s.end, mood: s.mood, act: s.act, cues: s.cues}))}, null, 1));
      console.log('shots', SHOTS.length, 'total frames', TOTAL, 'sec', TOTAL/60);`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'out/_timeline.mjs',
  loader: {'.tsx': 'tsx', '.ts': 'ts', '.json': 'json'},
  jsx: 'automatic',
  logLevel: 'error',
  banner: {js: "import {createRequire} from 'module'; const require = createRequire(import.meta.url);"},
});
await import(process.cwd() + '/out/_timeline.mjs?' + Date.now());
