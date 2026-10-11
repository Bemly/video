import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Remotion staticFile() 在 Player 里默认返回绝对路径（/xxx），部署到
// bili.bemly.moe/winterjs/ 子路径下会 404。设置 staticBase 为相对路径
// 后，staticFile() 会返回 ./xxx，相对当前页面解析，子路径部署可用。
// 源码见 remotion/packages/core/src/static-file.ts inner().
(window as unknown as Record<string, unknown>).remotion_staticBase = '.';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
