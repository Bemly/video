import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Remotion staticFile() 永远返回以 / 开头的绝对路径（见
// remotion/packages/core/src/static-file.ts：inner() 之后还有一段
// `if (!preparsed.startsWith('/')) return '/' + preparsed`，所以设 '.' 会被
//  normalization 成 '/./xxx' 指到站点根而 404）。正确做法是按部署子路径设前缀：
// 线上 bili.bemly.moe/winterjs/ 下用 '/winterjs'，本地 vite dev/preview 在根下
// 用 ''（空字符串 falsy，走默认 '/xxx'）。
const STATIC_BASE = window.location.pathname.startsWith('/winterjs') ? '/winterjs' : '';
(window as unknown as Record<string, unknown>).remotion_staticBase = STATIC_BASE;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
