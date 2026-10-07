import {continueRender, delayRender, staticFile} from 'remotion';

const list: [string, string][] = [
  ['Noto Sans SC', 'NotoSansSC.ttf'],
  ['Noto Serif SC', 'NotoSerifSC.ttf'],
  ['JetBrains Mono', 'JetBrainsMono.ttf'],
  ['Orbitron', 'Orbitron.ttf'],
  ['Rajdhani', 'Rajdhani.ttf'],
  ['Unbounded', 'Unbounded.ttf'],
];

let started = false;

export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 180000});
  Promise.all(
    list.map(([family, file]) =>
      new FontFace(family, `url('${staticFile('fonts/' + file)}')`, {weight: '100 900'})
        .load()
        .then((ff) => {
          document.fonts.add(ff);
        }),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
