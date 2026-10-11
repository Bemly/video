import React from "react";
import { useCurrentFrame } from "remotion";
import { CastPlayer } from "../components/CastPlayer";
import { Shot } from "../components/Shot";
import type { SceneViewProps } from "../Video";

/** REPL：实机录像（Linux 编译的 winterjs）按台词分段对齐；第 3 句插作者 macOS 真机截图。 */
export const Repl: React.FC<SceneViewProps> = ({ starts }) => {
  const f = useCurrentFrame();
  const macShot = f >= starts[3] && f < starts[4];
  return (
    <>
      <div style={{ opacity: macShot ? 0 : 1 }}>
        <CastPlayer
          name="repl" x={90} y={110} w={1740} h={660} title="winterjs --repl"
          map={[
            [starts[1], 0], [starts[1] + 45, 1.2], [starts[2], 5.1],          // 进入 REPL，雪花提示符
            [starts[2] + 10, 6.0], [starts[2] + 55, 7.45], [starts[2] + 75, 9.54], // 键入 WinterJS.media. + Tab
            [starts[3], 9.6], [starts[4], 12.2],
            [starts[4] + 70, 15.65], [starts[5], 19.6],                        // .doc 整篇文档
            [starts[5] + 25, 22.6], [starts[5] + 40, 22.7],                    // 顶层 await
          ]}
        />
      </div>
      {macShot && (
        <Shot src="shots/repl-image.png" x={90} y={110} w={1740} h={660} at={starts[3]} title="winterjs repl — macOS 真机"
          zoom={[[starts[3], 1, 0.5, 0.4], [starts[3] + 50, 1.25, 0.62, 0.35]]} />
      )}
    </>
  );
};
