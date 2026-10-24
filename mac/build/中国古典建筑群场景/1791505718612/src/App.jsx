import { createCanvas } from 'react-canvas';

const canvas = createCanvas({
  dpr: window.devicePixelRatio || 1,
});

canvas.style.width = '100%';
canvas.style.height = '100%';

export default canvas;
