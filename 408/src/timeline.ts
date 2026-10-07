import React from 'react';
import type {Cue} from './components/Problem';
import {FLASH, IRIS, RISE, ShotDef, SLIDE, Trans, ZOOM} from './components/Shot';
import {COL} from './theme';
import {Intro} from './scenes/Intro';
import {DSGraph, DSList, DSSort, DSTitle, DSTree} from './scenes/DS';
import {COIEEE, COMemory, COPipeline, COTitle, COVonNeumann} from './scenes/CO';
import {OSDeadlock, OSPaging, OSProcess, OSPV, OSSched, OSTitle} from './scenes/OS';
import {CNCwnd, CNGlobe, CNStack, CNTcp, CNTitle} from './scenes/CN';
import {Logo} from './scenes/Finale';
import * as GX from './scenes/v2/Galaxy';
import * as DA from './scenes/v2/ds_a';
import * as DB from './scenes/v2/ds_b';
import * as CO2 from './scenes/v2/co';
import * as OS2 from './scenes/v2/os';
import * as CN2 from './scenes/v2/cn';
import * as FIN from './scenes/v2/fin';

export type Mood = 'intro' | 'galaxy' | 'title' | 'concept' | 'problem' | 'montage' | 'logo';
type Entry = {id: string; C: React.FC; dur: number; mood: Mood; tin?: Trans; cues?: Cue[]};

const DSGraphNoZoom: React.FC = () => React.createElement(DSGraph, {zoom: false});

const E = (id: string, C: React.FC, dur: number, mood: Mood = 'concept', tin?: Trans, cues?: Cue[]): Entry => ({id, C, dur, mood, tin, cues});

const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98];
const V1: Record<string, Cue[]> = {
  ds_list: [[128, 'blip', 64], [160, 'whoosh'], [196, 'tick'], [206, 'whoosh']],
  ds_bst: [...PENTA.map((n, i): Cue => [15 + 15 * i, 'blip', n]), ...PENTA.map((_, r): Cue => [196 + 7 * r, 'tick'])],
  ds_quick: [[24, 'riser2'], [290, 'gliss']],
  ds_dijkstra: [...new Array(10).fill(0).map((_, k): Cue => [90 + 30 * k, 'blip', PENTA[k] + 12]), [430, 'whoosh']],
  co_vn: [...[0, 1, 2, 3, 4].map((k): Cue => [6 + 12 * k, 'blip', 57 + [0, 3, 7, 10, 12][k]])],
  co_ieee: [...new Array(32).fill(0).map((_, k): Cue => [150 + 3 * k, 'tick']), [262, 'bell', 88]],
  co_pipe: [...new Array(9).fill(0).map((_, k): Cue => [30 + 30 * k, 'tick']), [300, 'bell', 81]],
  co_mem: [[16, 'tick'], [32, 'tick'], [48, 'tick'], [64, 'tick'], [406, 'bell', 84], [488, 'error'], [500, 'whoosh'], [530, 'bell', 88]],
  os_proc: [48, 90, 150, 210, 240, 270, 330].map((t, i): Cue => [t, 'blip', 72 + i * 2]),
  os_sched: [[256, 'chime']],
  os_pv: new Array(9).fill(0).map((_, i): Cue => [40 + 34 * i + 24, 'blip', i % 2 ? 76 : 79]),
  os_page: [[176, 'riser2']],
  os_dead: [[158, 'error'], [180, 'tick'], [187, 'tick'], [194, 'tick'], [201, 'tick']],
  cn_stack: [[84, 'blip', 75], [120, 'blip', 78], [156, 'blip', 81], [200, 'riser2'], [262, 'blip', 84], [296, 'blip', 81], [330, 'blip', 78], [400, 'chime']],
  cn_tcp: [[96, 'bell', 81], [176, 'bell', 84], [256, 'bell', 88], [272, 'chime']],
  cn_cwnd: [[184, 'error'], [295, 'blip', 88]],
  cn_globe: new Array(8).fill(0).map((_, i): Cue => [40 + 18 * i, 'whoosh']),
};

export const ACT_DEFS: {key: string; color: string; entries: Entry[]}[] = [
  {
    key: 'intro',
    color: COL.intro,
    entries: [E('intro', Intro, 960, 'intro'), E('galaxy', GX.Galaxy, 960, 'galaxy', FLASH, GX.GalaxyCues)],
  },
  {
    key: 'ds',
    color: COL.ds,
    entries: [
      E('ds_title', DSTitle, 240, 'title', IRIS(COL.ds)),
      E('ds_list', DSList, 360, 'concept', ZOOM, V1.ds_list),
      E('ds_p_relink', DA.DSRelink, 1920, 'problem', RISE, DA.DSRelinkCues),
      E('ds_stackq', DA.DSStackQueue, 720, 'concept', ZOOM, DA.DSStackQueueCues),
      E('ds_p_catalan', DA.DSCatalan, 1800, 'problem', RISE, DA.DSCatalanCues),
      E('ds_p_kmp', DA.DSKmp, 1920, 'problem', ZOOM, DA.DSKmpCues),
      E('ds_traverse', DA.DSTraverse, 840, 'concept', SLIDE, DA.DSTraverseCues),
      E('ds_p_rebuild', DA.DSRebuild, 1560, 'problem', RISE, DA.DSRebuildCues),
      E('ds_bst', DSTree, 360, 'concept', ZOOM, V1.ds_bst),
      E('ds_p_avl', DA.DSAvl, 1440, 'problem', RISE, DA.DSAvlCues),
      E('ds_huffman', DA.DSHuffman, 1200, 'concept', ZOOM, DA.DSHuffmanCues),
      E('ds_bfsdfs', DB.DSBfsDfs, 720, 'concept', SLIDE, DB.DSBfsDfsCues),
      E('ds_dijkstra', DSGraphNoZoom, 600, 'concept', ZOOM, V1.ds_dijkstra),
      E('ds_kruskal', DB.DSKruskal, 960, 'concept', SLIDE, DB.DSKruskalCues),
      E('ds_p_aoe', DB.DSAoe, 1920, 'problem', RISE, DB.DSAoeCues),
      E('ds_bsearch', DB.DSBsearch, 840, 'concept', ZOOM, DB.DSBsearchCues),
      E('ds_p_hash', DB.DSHash, 1920, 'problem', RISE, DB.DSHashCues),
      E('ds_p_btree', DB.DSBtree, 1440, 'problem', ZOOM, DB.DSBtreeCues),
      E('ds_race', DB.DSRace, 1320, 'concept', RISE, DB.DSRaceCues),
      E('ds_quick', DSSort, 360, 'concept', ZOOM, V1.ds_quick),
      E('ds_heap', DB.DSHeap, 1320, 'concept', SLIDE, DB.DSHeapCues),
      E('ds_merge', DB.DSMerge, 960, 'concept', ZOOM, DB.DSMergeCues),
    ],
  },
  {
    key: 'co',
    color: COL.co,
    entries: [
      E('co_title', COTitle, 240, 'title', IRIS(COL.co)),
      E('co_vn', COVonNeumann, 360, 'concept', ZOOM, V1.co_vn),
      E('co_ring', CO2.CORing, 960, 'concept', SLIDE, CO2.CORingCues),
      E('co_p_overflow', CO2.COOverflow, 1560, 'problem', RISE, CO2.COOverflowCues),
      E('co_ieee', COIEEE, 360, 'concept', ZOOM, V1.co_ieee),
      E('co_floatline', CO2.COFloatLine, 960, 'concept', SLIDE, CO2.COFloatLineCues),
      E('co_adder', CO2.COAdder, 1200, 'concept', ZOOM, CO2.COAdderCues),
      E('co_mem', COMemory, 600, 'concept', RISE, V1.co_mem),
      E('co_p_cachebits', CO2.COCacheBits, 1680, 'problem', ZOOM, CO2.COCacheBitsCues),
      E('co_p_matrix', CO2.COMatrix, 1680, 'problem', RISE, CO2.COMatrixCues),
      E('co_vm', CO2.COVm, 1440, 'concept', ZOOM, CO2.COVmCues),
      E('co_addr', CO2.COAddr, 960, 'concept', SLIDE, CO2.COAddrCues),
      E('co_p_datapath', CO2.CODatapath, 1320, 'problem', RISE, CO2.CODatapathCues),
      E('co_pipe', COPipeline, 480, 'concept', ZOOM, V1.co_pipe),
      E('co_p_hazard', CO2.COHazard, 1560, 'problem', RISE, CO2.COHazardCues),
      E('co_p_io', CO2.COIo, 1680, 'problem', ZOOM, CO2.COIoCues),
    ],
  },
  {
    key: 'os',
    color: COL.os,
    entries: [
      E('os_title', OSTitle, 240, 'title', IRIS(COL.os)),
      E('os_syscall', OS2.OSSyscall, 840, 'concept', ZOOM, OS2.OSSyscallCues),
      E('os_proc', OSProcess, 360, 'concept', SLIDE, V1.os_proc),
      E('os_sched', OSSched, 360, 'concept', ZOOM, V1.os_sched),
      E('os_p_sched', OS2.OSSchedCmp, 1680, 'problem', RISE, OS2.OSSchedCmpCues),
      E('os_pv', OSPV, 360, 'concept', ZOOM, V1.os_pv),
      E('os_p_rw', OS2.OSRw, 1680, 'problem', RISE, OS2.OSRwCues),
      E('os_dead', OSDeadlock, 240, 'concept', ZOOM, V1.os_dead),
      E('os_p_banker', OS2.OSBanker, 1800, 'problem', RISE, OS2.OSBankerCues),
      E('os_page', OSPaging, 360, 'concept', ZOOM, V1.os_page),
      E('os_p_replace', OS2.OSReplace, 1800, 'problem', RISE, OS2.OSReplaceCues),
      E('os_p_inode', OS2.OSInode, 1440, 'problem', ZOOM, OS2.OSInodeCues),
      E('os_p_disk', OS2.OSDisk, 1440, 'problem', RISE, OS2.OSDiskCues),
    ],
  },
  {
    key: 'cn',
    color: COL.cn,
    entries: [
      E('cn_title', CNTitle, 240, 'title', IRIS(COL.cn)),
      E('cn_stack', CNStack, 480, 'concept', ZOOM, V1.cn_stack),
      E('cn_p_shannon', CN2.CNShannon, 1560, 'problem', RISE, CN2.CNShannonCues),
      E('cn_p_csma', CN2.CNCsma, 1440, 'problem', ZOOM, CN2.CNCsmaCues),
      E('cn_p_window', CN2.CNWindow, 1800, 'problem', RISE, CN2.CNWindowCues),
      E('cn_p_subnet', CN2.CNSubnet, 1800, 'problem', ZOOM, CN2.CNSubnetCues),
      E('cn_p_frag', CN2.CNFrag, 1320, 'problem', RISE, CN2.CNFragCues),
      E('cn_tcp', CNTcp, 360, 'concept', ZOOM, V1.cn_tcp),
      E('cn_fin', CN2.CNFin, 1080, 'concept', SLIDE, CN2.CNFinCues),
      E('cn_cwnd', CNCwnd, 360, 'concept', RISE, V1.cn_cwnd),
      E('cn_globe', CNGlobe, 480, 'concept', ZOOM, V1.cn_globe),
      E('cn_p_web', CN2.CNWeb, 1920, 'problem', RISE, CN2.CNWebCues),
    ],
  },
  {
    key: 'fin',
    color: '#8ab4ff',
    entries: [
      E('fin_montage', FIN.Montage2, 960, 'montage', IRIS('#9ec5ff'), FIN.Montage2Cues),
      E('fin_galaxy', GX.GalaxyEnd, 480, 'galaxy', ZOOM, GX.GalaxyEndCues),
      E('fin_logo', Logo, 720, 'logo', FLASH),
    ],
  },
];

export type TShot = ShotDef & {mood: Mood; act: number; cues: Cue[]; dur: number};

export const SHOTS: TShot[] = (() => {
  const out: TShot[] = [];
  let t = 0;
  ACT_DEFS.forEach((a, ai) =>
    a.entries.forEach((e) => {
      out.push({id: e.id, C: e.C, start: t, end: t + e.dur, tin: e.tin, mood: e.mood, act: ai, cues: e.cues ?? [], dur: e.dur});
      t += e.dur;
    }),
  );
  return out;
})();

export const TOTAL = SHOTS[SHOTS.length - 1].end;

export const ACT_RANGES = ACT_DEFS.map((a, i) => {
  const s = SHOTS.filter((x) => x.act === i);
  return {key: a.key, color: a.color, s: s[0].start, e: s[s.length - 1].end};
});

export const _t = [SLIDE, RISE, ZOOM];
