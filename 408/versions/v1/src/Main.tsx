import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './components/Background';
import {FLASH, IRIS, RISE, ShotDef, Shots, SLIDE, ZOOM} from './components/Shot';
import {ActHUD} from './components/ui';
import {COL} from './theme';
import {Intro} from './scenes/Intro';
import {DSGraph, DSList, DSSort, DSTitle, DSTree} from './scenes/DS';
import {COIEEE, COMemory, COPipeline, COTitle, COVonNeumann} from './scenes/CO';
import {OSDeadlock, OSPaging, OSProcess, OSPV, OSSched, OSTitle} from './scenes/OS';
import {CNCwnd, CNGlobe, CNStack, CNTcp, CNTitle} from './scenes/CN';
import {Logo, Montage} from './scenes/Finale';

export const TOTAL = 9360;

export const SHOTS: ShotDef[] = [
  {id: 'intro', start: 0, end: 960, C: Intro},
  {id: 'ds_title', start: 960, end: 1200, C: DSTitle, tin: IRIS(COL.ds)},
  {id: 'ds_list', start: 1200, end: 1500, C: DSList, tin: ZOOM},
  {id: 'ds_tree', start: 1500, end: 1800, C: DSTree, tin: SLIDE},
  {id: 'ds_sort', start: 1800, end: 2160, C: DSSort, tin: RISE},
  {id: 'ds_graph', start: 2160, end: 2760, C: DSGraph, tin: ZOOM},
  {id: 'co_title', start: 2760, end: 3000, C: COTitle, tin: IRIS(COL.co)},
  {id: 'co_vn', start: 3000, end: 3300, C: COVonNeumann, tin: ZOOM},
  {id: 'co_ieee', start: 3300, end: 3600, C: COIEEE, tin: SLIDE},
  {id: 'co_pipe', start: 3600, end: 4020, C: COPipeline, tin: ZOOM},
  {id: 'co_mem', start: 4020, end: 4560, C: COMemory, tin: RISE},
  {id: 'os_title', start: 4560, end: 4800, C: OSTitle, tin: IRIS(COL.os)},
  {id: 'os_proc', start: 4800, end: 5160, C: OSProcess, tin: ZOOM},
  {id: 'os_sched', start: 5160, end: 5460, C: OSSched, tin: SLIDE},
  {id: 'os_pv', start: 5460, end: 5820, C: OSPV, tin: ZOOM},
  {id: 'os_page', start: 5820, end: 6120, C: OSPaging, tin: RISE},
  {id: 'os_dead', start: 6120, end: 6360, C: OSDeadlock, tin: ZOOM},
  {id: 'cn_title', start: 6360, end: 6600, C: CNTitle, tin: IRIS(COL.cn)},
  {id: 'cn_stack', start: 6600, end: 7020, C: CNStack, tin: ZOOM},
  {id: 'cn_tcp', start: 7020, end: 7380, C: CNTcp, tin: SLIDE},
  {id: 'cn_cwnd', start: 7380, end: 7740, C: CNCwnd, tin: RISE},
  {id: 'cn_globe', start: 7740, end: 8160, C: CNGlobe, tin: ZOOM},
  {id: 'fin_montage', start: 8160, end: 8640, C: Montage, tin: IRIS('#9ec5ff')},
  {id: 'fin_logo', start: 8640, end: 9360, C: Logo, tin: FLASH},
];

export const Main: React.FC<{mute?: boolean}> = ({mute}) => (
  <AbsoluteFill style={{background: COL.bg}}>
    <Background />
    <Shots shots={SHOTS} />
    <ActHUD />
    {!mute && <Audio src={staticFile('music.wav')} />}
  </AbsoluteFill>
);
