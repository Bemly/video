import type React from "react";
import type { SceneViewProps } from "../Video";
import { Opening } from "./Opening";
import { Engine } from "./Engine";
import { Compare } from "./Compare";
import { History } from "./History";
import { VueScene } from "./Vue";
import { Takeover } from "./Takeover";
import { WinterCG } from "./WinterCG";
import { Repl } from "./Repl";
import { Native } from "./Native";
import { Outro } from "./Outro";

export const SCENE_VIEWS: Record<string, React.FC<SceneViewProps>> = {
  opening: Opening,
  engine: Engine,
  compare: Compare,
  history: History,
  vue: VueScene,
  takeover: Takeover,
  wintercg: WinterCG,
  repl: Repl,
  native: Native,
  outro: Outro,
};
