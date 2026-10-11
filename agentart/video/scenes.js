// What is on screen, keyed to the narration. Cue syntax is documented at `at()`.
// Quoted file contents come from the Firefox repository's agent instructions.
function buildScenes() {
  const X = 110;

  // ---- 01 · Don't write prompts ---------------------------------------
  scene(1, [
    { k: 'text', t: '{d:Prompt Aesthetic  ·  提示词美学}', x: X, y: 150, size: 44, slide: 0, in: 0.4, out: "1.1@Don't write prompts-0.35" },
    { k: 'title', t: "{p:Don't} write prompts", in: "1.1@Don't write prompts", out: '1.3-0.3' },
    { k: 'fn', in: '1.2@I mean the big one', out: '1.3-0.3', draw(t, a, it) {
        const rows = Math.floor(4 + (t - it.t0) * 9);
        rich('{m:AGENTS.md}', X, 250, { size: 26, font: 'mono', alpha: a });
        const visible = 30, first = Math.max(0, rows - visible);
        ctx.save(); ctx.beginPath(); ctx.rect(X - 10, 270, 900, 620); ctx.clip();
        for (let i = first; i < rows; i++) skeleton(X, 285 + (i - first) * 20, 780, 1, 20, a * (i === rows - 1 ? 0.5 : 1), i + 3);
        ctx.restore();
        rich(`{d:lines} ${String(180 + rows * 37).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 1010, 330, { size: 40, font: 'mono', alpha: a });
      } },
    { k: 'text', t: 'explains {r:everything}', x: 1010, y: 420, size: 56, in: '1.2@tries to explain everything', out: '1.3-0.3' },

    { k: 'text', t: 'Firefox', x: X, y: 500, size: 190, in: '1.3@Firefox', out: '1.4-0.2' },
    { k: 'text', t: '{d:tens of millions of lines of code}', x: X + 6, y: 590, size: 44, in: '1.3@Tens of millions', out: '1.4-0.2' },
    { k: 'text', t: '{b:C++}', x: X + 6, y: 690, size: 48, font: 'mono', in: '1.3@C++', out: '1.4-0.2' },
    { k: 'text', t: '{o:Rust}', x: X + 150, y: 690, size: 48, font: 'mono', in: '1.3@Rust', out: '1.4-0.2' },
    { k: 'text', t: '{y:JavaScript}', x: X + 320, y: 690, size: 48, font: 'mono', in: '1.3@JavaScript', out: '1.4-0.2' },
    { k: 'text', t: '{p:Kotlin}', x: X + 660, y: 690, size: 48, font: 'mono', in: '1.3@Kotlin', out: '1.4-0.2' },

    { k: 'text', t: '{m:firefox/}AGENTS.md', x: X, y: 300, size: 40, font: 'mono', in: '1.4', out: '1.5-0.3' },
    { k: 'fn', in: '1.4@enormous', out: '1.5-0.3', draw(t, a, it) {
        const land = at('1.4@seventy-three');
        const n = t < land ? Math.floor(1000 + hash(Math.floor(t * 24)) * 98000) : 73;
        const k = fin(t, land, 0.5);
        rich(t < land ? `{d:${n.toLocaleString('en-US')}}` : '{p:73}', X - 8, 620, { size: 300 + 20 * (1 - k), alpha: a });
        rich('lines', X + 390, 620, { size: 72, alpha: a * k });
      } },

    { k: 'code', x: X, y: 330, size: 30, lh: 50, in: '1.5', lines: [
        '{m:firefox/AGENTS.md}',
        '',
        '{b:# Global instructions}',
        'Limit the amount of comments you put in the code to a',
        { s: 'strict minimum. You should {y:almost never add comments},', hl: ['1.5@Almost never add comments'] },
        'except sometimes on non-trivial code, …',
      ] },
    { k: 'text', t: "{d:Code Aesthetic —} {p:Don't} write comments  {g:✓}", x: X, y: 720, size: 46, in: "1.5@So, we're off" },
  ]);
  FX.field.push([at('1.3@Firefox'), at('1.4-0.3')]);

  // ---- 02 · Scope > Prompts -------------------------------------------
  scene(2, [
    { k: 'title', t: '{p:Scope} > Prompts', in: '2-0.2', out: '2.5-0.3' },
    { k: 'code', x: X, y: 270, size: 27, lh: 41, in: '2.1@One file', out: '2.3-0.3', lines: [
        '{m:AGENTS.md}',
        { s: '{b:## Build}', in: '2.1@Build steps' },
        { s: '  make deps && make build MODE=release', in: '2.1@Build steps+0.1' },
        { s: '{b:## Tests}', in: '2.1@test commands' },
        { s: '  ./run-tests --shard 1/8 --retries 2', in: '2.1@test commands+0.1' },
        { s: '{b:## Style}', in: '2.1@style rules' },
        { s: '  two spaces, no emoji, snake_case in Python', in: '2.1@style rules+0.1' },
        { s: '{b:## Architecture}', in: '2.1@architecture' },
        { s: '  parser → interpreter → JIT → garbage collector', in: '2.1@architecture+0.1' },
        { s: '  The collector is generational and incremental.', in: '2.1@architecture+0.2', hl: ['2.2@The agent still reads', '2.3-0.3'], hlc: 'r' },
        { s: '  Nursery objects are tenured after one minor GC…', in: '2.1@architecture+0.3', hl: ['2.2@The agent still reads+0.15', '2.3-0.3'], hlc: 'r' },
        { s: '{b:## Known issues}', in: '2.1@a warning' },
        { s: '  test_sync_upload is flaky on Tuesdays', in: '2.1@a warning+0.1' },
      ] },
    { k: 'text', t: '{d:task}', x: 1010, y: 320, size: 28, font: 'mono', in: '2.2@Fixing a typo', out: '2.3-0.3' },
    { k: 'text', t: 'fix typo in {y:docs/README.md}', x: 1010, y: 372, size: 34, font: 'mono', in: '2.2@Fixing a typo', out: '2.3-0.3' },
    { k: 'fn', in: '2.2', out: '2.3-0.3', draw(t, a, it) {
        const k = io((t - it.t0) / 1.6);
        rich('{d:prompt loaded}', 1010, 500, { size: 28, font: 'mono', alpha: a });
        ctx.globalAlpha = a * 0.25; ctx.fillStyle = COL.m; rrect(1010, 524, 640, 14, 7); ctx.fill();
        ctx.globalAlpha = a; ctx.fillStyle = COL.r; rrect(1010, 524, 640 * k, 14, 7); ctx.fill(); ctx.globalAlpha = 1;
        rich(`{r:${Math.round(k * 100)}%}`, 1670, 540, { size: 34, font: 'mono', alpha: a });
      } },

    { k: 'code', x: X, y: 270, size: 28, lh: 43, in: '2.3', out: '2.5-0.3', fade: ['2.4@only read when', 0.45], lines: [
        '{m:firefox/AGENTS.md  ·  73 lines}',
        { s: '{b:# Global instructions}', in: '2.3@The root file' },
        { s: '{d:…what is true everywhere…}', in: '2.3@only what is true' },
        '',
        { s: 'When working on anything under any of', in: '2.3@Then it lists' },
        { s: 'the following directories:', in: '2.3@Then it lists+0.1' },
        { s: ' - {y:js/}', in: '2.3@five directories' },
        { s: ' - {y:gfx/wr/}', in: '2.3@five directories+0.12' },
        { s: ' - {y:layout/}', in: '2.3@five directories+0.24' },
        { s: ' - {y:security/nss/}', in: '2.3@five directories+0.36' },
        { s: ' - {y:browser/extensions/newtab/}', in: '2.3@five directories+0.48' },
        { s: 'Open {p:AGENTS.md} contained directly in the directory', in: '2.3@open the agents file', hl: ['2.3@open the agents file+0.2'], hlc: 'p' },
      ] },
    { k: 'code', x: 1100, y: 344, size: 30, lh: 80, in: '2.4', out: '2.5-0.3', lines: [
        { s: '{y:js/}AGENTS.md         {d:80 lines}', in: '2.4@The JavaScript engine', dim: '2.4@only read when' },
        { s: '{y:layout/}AGENTS.md     {d:31 lines}', in: '2.4@Layout has one', hl: ['2.4@only read when'], hlc: 'g' },
        { s: '{y:gfx/wr/}AGENTS.md    {d:123 lines}', in: '2.4@WebRender has one', dim: '2.4@only read when' },
        '',
        { s: '{g:$} cd layout/', in: '2.4@only read when-0.5', type: true },
      ] },

    { k: 'code', x: X, y: 300, size: 30, lh: 48, in: '2.5', lines: [
        '{m:# extract function}',
        '{p:def} {b:can_edit_message}(user, message):',
      ] },
    { k: 'text', t: "{d:The instruction didn't get shorter.}", x: X, y: 540, size: 60, in: '2.5@The instruction' },
    { k: 'text', t: 'It got a {p:scope}.', x: X, y: 680, size: 110, in: '2.5@It got a scope' },
  ]);

  // ---- 03 · Pointers > Prose ------------------------------------------
  scene(3, [
    { k: 'title', t: '{p:Pointers} > Prose', in: '3-0.2' },
    { k: 'code', x: X, y: 270, size: 28, lh: 46, in: '3.1', out: '3.2-0.3', lines: [
        '{m:layout/AGENTS.md  ·  31 lines}',
        '{b:## Start here}',
        { s: '{y:Read} the docs in `layout/docs/` before non-trivial work.', hl: ['3.1@Read this document first'] },
        '{b:## Review}',
        { s: '{y:Read} `layout/docs/LayoutCodeReviewerChecklist.md` as guidance', hl: ['3.1@Read this document first+0.12'] },
        '{b:## Testing}',
        { s: '{y:Read} `…/writing-tests/reftests.md` before writing a reftest', hl: ['3.1@Read this document first+0.24'] },
        { s: '{y:Read} `…/writing-tests/crashtest.md` before writing a crashtest', hl: ['3.1@Read this document first+0.36'] },
        '{b:## Debugging}',
        { s: '{y:Read} `layout/docs/LayoutDebugger.md` for usage.', hl: ['3.1@Read this document first+0.48'] },
      ] },

    { k: 'box', x: X, y: 270, w: 640, h: 150, in: '3.2', out: '3.3@It is a map-0.3' },
    { k: 'text', t: '{m:layout/AGENTS.md}', x: X + 26, y: 318, size: 24, font: 'mono', in: '3.2', out: '3.3@It is a map-0.3' },
    { k: 'text', t: '{y:Read} layout/docs/LayoutOverview.md', x: X + 26, y: 378, size: 27, font: 'mono', in: '3.2', out: '3.3@It is a map-0.3' },
    { k: 'arrow', x1: X + 660, y1: 345, x2: 990, y2: 345, in: '3.2@It points to', out: '3.3@It is a map-0.3' },
    { k: 'box', x: 1020, y: 270, w: 780, h: 200, c: 'g', in: '3.2@It points to+0.3', out: '3.3@It is a map-0.3' },
    { k: 'text', t: '{m:layout/docs/LayoutOverview.md}', x: 1046, y: 318, size: 24, font: 'mono', in: '3.2@It points to+0.3', out: '3.3@It is a map-0.3' },
    { k: 'text', t: 'frame tree · frame construction', x: 1046, y: 376, size: 27, font: 'mono', in: '3.2@It points to+0.4', out: '3.3@It is a map-0.3' },
    { k: 'text', t: 'reflow · fragmentation', x: 1046, y: 420, size: 27, font: 'mono', in: '3.2@It points to+0.5', out: '3.3@It is a map-0.3' },
    { k: 'text', t: '{g:maintained by the people who change the code}', x: 1020, y: 520, size: 30, in: '3.2@maintained by', out: '3.3@It is a map-0.3' },
    { k: 'code', x: X, y: 640, size: 25, lh: 40, in: '3.2@a copy inside', out: '3.3@It is a map-0.3', lines: [
        '{m:a copy, pasted into the prompt}',
        { s: 'The frame tree is built by the frame constructor, then', strike: '3.2@stale by Friday' },
        { s: 'reflowed top-down; fragmentation happens when…', strike: '3.2@stale by Friday+0.15' },
      ] },
    { k: 'text', t: '{r:stale by Friday}', x: 1020, y: 720, size: 44, in: '3.2@stale by Friday+0.3', out: '3.3@It is a map-0.3' },

    { k: 'code', x: X + 40, y: 280, size: 29, lh: 82, in: '3.3@It is a map', out: '3.5-0.3', fade: ['3.4', 0.6], lines: [
        '{m:js/AGENTS.md  ·  High-level architecture}',
        { s: '{y:src/frontend/}  {d:—}  parser and bytecode emitter', in: '3.3@Parser' },
        { s: '{y:src/vm/}        {d:—}  the runtime: interpreter, bytecode, Realm', in: '3.3@interpreter' },
        { s: '{y:src/jit/}       {d:—}  Baseline → Ion → Warp, CacheIR', in: '3.3@compilers' },
        { s: '{y:src/gc/}        {d:—}  generational, incremental, compacting GC', in: '3.3@garbage collector' },
      ] },
    { k: 'fn', in: '3.3@in the order', out: '3.4', draw(t, a, it) {
        // A script travelling down the pipeline.
        const stops = ['3.3@Parser', '3.3@interpreter', '3.3@compilers', '3.3@garbage collector'].map(at);
        const y0 = 280 + 82 - 10, x = X + 6;
        let pos = 0;
        stops.forEach((s, i) => { if (i > 0) pos += io((t - s + 0.2) / 0.5); });
        ctx.globalAlpha = a * 0.5; ctx.strokeStyle = COL.m; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 82 * 3); ctx.stroke();
        ctx.globalAlpha = a * fin(t, stops[0], 0.3); ctx.fillStyle = COL.p;
        ctx.beginPath(); ctx.arc(x, y0 + 82 * pos, 9, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      } },
    { k: 'text', t: 'A map tells you {p:where to look}.', x: X + 40, y: 760, size: 64, in: '3.4', out: '3.5-0.3' },
    { k: 'text', t: "{d:It doesn't try to be the territory.}", x: X + 40, y: 840, size: 40, in: "3.4@It doesn't try", out: '3.5-0.3' },

    { k: 'box', x: X, y: 300, w: 760, h: 300, in: '3.5' },
    { k: 'text', t: '{m:firefox/CLAUDE.md}', x: X + 36, y: 362, size: 28, font: 'mono', in: '3.5' },
    { k: 'text', t: '{p:@AGENTS.md}', x: X + 36, y: 500, size: 92, font: 'mono', in: '3.5@It is one line' },
    { k: 'text', t: '{d:1 line}', x: 940, y: 400, size: 64, in: '3.5@It is one line+0.2' },
    { k: 'text', t: 'one source of truth', x: 940, y: 500, size: 56, in: '3.5@One source of truth' },
    { k: 'text', t: '{d:for every tool}', x: 940, y: 566, size: 40, in: '3.5@for every tool' },
  ]);

  // ---- 04 · Tools > Prompts -------------------------------------------
  scene(4, [
    { k: 'title', t: '{p:Tools} > Prompts', in: '4-0.2' },
    { k: 'code', x: X, y: 300, size: 32, lh: 54, in: "4.1@You can't grep", out: '4.3-0.3', lines: [
        { s: '{g:$} grep -r "AudioContext" .', type: true, strike: '4.3' },
      ] },
    { k: 'fn', in: '4.1@Well, you can', out: '4.3-0.3', draw(t, a, it) {
        const s = Math.floor((t - it.t0) * 14);
        const dots = '.'.repeat(1 + Math.floor(t * 2.5) % 3);
        rich(`{d:searching${dots}}`, X, 364, { size: 30, font: 'mono', alpha: a });
        rich(`{r:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}}`, X + 300, 364, { size: 30, font: 'mono', alpha: a });
      } },
    { k: 'code', x: X, y: 500, size: 30, lh: 52, in: '4.2', out: '4.3@Firefox ships', lines: [
        { s: '{m:AGENTS.md}', in: '4.2' },
        { s: '{d:Please search carefully.}', in: '4.2@Search carefully', strike: '4.3@hand the agent' },
        { s: '{d:Restrict your paths.}', in: '4.2@Restrict', strike: '4.3@hand the agent+0.12' },
        { s: '{d:Be patient.}', in: '4.2@Be patient', strike: '4.3@hand the agent+0.24' },
      ] },
    { k: 'code', x: X, y: 300, size: 32, lh: 60, in: '4.3@Firefox ships', out: '4.4-0.3', lines: [
        { s: "{g:$} searchfox-cli --define {y:'AudioContext::AudioContext'}", in: '4.3@Ask it for a definition-0.6', type: true, typeDur: 1.2 },
        { s: '{d:→} dom/media/webaudio/AudioContext.cpp', in: '4.3@and it answers' },
        { s: '{g:✓ definition found}', in: '4.3@and it answers+0.25' },
      ] },
    { k: 'code', x: X, y: 300, size: 28, lh: 66, in: '4.4', out: '4.5-0.3', stagger: 0.14, lines: [
        '{m:firefox/AGENTS.md  ·  Tooling for Firefox work}',
        "searchfox-cli {c:--define} {y:'AudioContext::AudioContext'}   {m:# get function impl}",
        "searchfox-cli {c:--define} {y:'AudioSink'}                    {m:# get class definition}",
        "searchfox-cli {c:--path} ipdl {c:-q} {y:'MySearchTerm'}           {m:# text search, restricted on path}",
        'searchfox-cli {c:--id} AudioSink {c:-l} 150 {c:--cpp}             {m:# identifier search in C++}',
      ] },
    { k: 'text', t: '{d:the type system of prompting}', x: X, y: 330, size: 40, in: '4.5', out: '4.6-0.3' },
    { k: 'text', t: 'A sentence {r:asks} the model to behave.', x: X, y: 480, size: 62, in: '4.5@A sentence', out: '4.6-0.3' },
    { k: 'text', t: 'A tool makes the right thing the {g:easy} thing.', x: X, y: 600, size: 62, in: '4.5@A tool makes', out: '4.6-0.3' },
    { k: 'text', t: '{m:firefox/AGENTS.md  ·  Tooling for Firefox work}', x: X, y: 300, size: 28, font: 'mono', in: '4.6' },
    { k: 'code', x: X, y: 420, size: 44, lh: 76, font: 'sans', in: '4.6', lines: [
        { s: "“If you can't find something quickly,", in: "4.6@If you can't" },
        { s: ' it is {p:better to ask} than run local searches.”', in: '4.6@it is better to ask' },
      ] },
  ]);
  FX.confetti.push({ t: at('4.4@replace'), o: [-0.25, 0.0] });

  // ---- 05 · Lazy > Always ---------------------------------------------
  const skills = ['accessibility-frontend-review', 'android', 'android-new-module', 'bug-filing', 'documentation', 'file-good-first-bug',
    'find-reviewer', 'firefox-commits', 'firefox-desktop-frontend', 'fluent-migration', 'gecko-web-standard-implementation', 'js-perf-investigation',
    'media-patch-review', 'mozlint', 'nimbus-prefs', 'perf-regression-triage', 'perftest', 'profiler-analysis',
    'spec-trace', 'specmap', 'stack-reorganize', 'stack-split-commit', 'stmo', 'webspec-index'];
  scene(5, [
    { k: 'title', t: '{p:Lazy} > Always', in: '5-0.2' },
    { k: 'code', x: X, y: 330, size: 32, lh: 84, in: '5.1', out: '5.2-0.3', lines: [
        { s: '{y:perf-regression-triage/}   {d:SKILL.md · 137 lines + references/}', in: '5.1@Triaging' },
        { s: '{y:fluent-migration/}         {d:SKILL.md · 264 lines}', in: '5.1@Migrating' },
        { s: '{y:stack-split-commit/}       {d:SKILL.md · 96 lines + git.md, jj.md}', in: '5.1@Splitting' },
      ] },
    { k: 'text', t: '{m:firefox/.agents/skills/}', x: X, y: 262, size: 28, font: 'mono', in: '5.2', out: '5.3-0.3' },
    { k: 'fn', in: '5.2@twenty-four', out: '5.3-0.3', draw(t, a, it) {
        skills.forEach((name, i) => {
          const col = i % 3, row = Math.floor(i / 3), t0 = it.t0 + i * 0.07;
          const k = fin(t, t0, 0.4);
          rich(`{y:▸} ${name}`, X + col * 590, 330 + row * 68 + (1 - k) * 10, { size: 25, font: 'mono', alpha: a * k });
        });
        rich('{p:24} skills', 1560, 262, { size: 44, alpha: a * fin(t, it.t0 + 0.3) });
      } },

    { k: 'code', x: X, y: 270, size: 28, lh: 44, in: '5.3', out: '5.4@Their readme-0.3', lines: [
        '{m:.agents/skills/nimbus-prefs/SKILL.md}',
        '{d:---}',
        '{c:name}: nimbus-prefs',
        { s: '{c:description}: >', hl: ['5.3@Only the description'], hlc: 'g' },
        { s: '  Use this skill when a Firefox preference has to be remotely', hl: ['5.3@Only the description+0.08'], hlc: 'g' },
        { s: '  controllable: putting a new feature behind a pref so it can be', hl: ['5.3@Only the description+0.16'], hlc: 'g' },
        { s: '  experimented on, rolled out gradually, or disabled remotely…', hl: ['5.3@Only the description+0.24'], hlc: 'g' },
        '{d:---}',
      ] },
    { k: 'text', t: '{g:loaded every session}', x: 1330, y: 450, size: 40, in: '5.3@Only the description+0.4', out: '5.4@Their readme-0.3' },
    { k: 'fn', in: '5.3@One paragraph', out: '5.4@Their readme-0.3', draw(t, a, it) {
        skeleton(X, 650, 1000, 10, 24, a * 0.55, 5);
        rich('{d:415 lines · on disk until needed}', 1180, 780, { size: 38, alpha: a * fin(t, at('5.3@The other few hundred'), 0.5) });
      } },

    { k: 'code', x: X, y: 360, size: 40, lh: 70, font: 'sans', in: '5.4@Their readme', out: '5.5-0.3', lines: [
        "“…they carry an {r:always-on cost}: a skill's description is",
        " loaded into the agent's context on {r:every session}…”",
        '',
        { s: '“When in doubt, prefer a {p:marketplace plugin}.”', in: "5.4@If a skill isn't" },
        '',
        { s: '{m:— firefox/.agents/skills/README.md}', in: '5.4@Their readme+0.6' },
      ] },

    { k: 'code', x: X, y: 270, size: 28, lh: 46, in: '5.5', out: '5.6-0.3', lines: [
        '{m:.agents/skills/perf-regression-triage/SKILL.md}',
        '{c:description}: >',
        '  Handle a Perfherder performance regression bug end to end: …',
        { s: '  {g:Use when} the user has a Perfherder/browsertime regression bug …', hl: ['5.5@when to use them'], hlc: 'g' },
        { s: '  {r:Not for} simply running perf tests or pushing them to try …', hl: ['5.5@and when not to'], hlc: 'r' },
        { s: '  {y:(use perftest)}, … analyzing a profile you already have in hand', hl: ['5.5@Use the other skill'], hlc: 'y' },
        { s: '  {y:(use profiler-analysis)}, SpiderMonkey microbenchmarks', hl: ['5.5@Use the other skill+0.1'], hlc: 'y' },
        { s: '  {y:(use js-perf-investigation)}, …', hl: ['5.5@Use the other skill+0.2'], hlc: 'y' },
      ] },
    { k: 'text', t: 'description = {p:interface}', x: X, y: 740, size: 60, in: '5.5@becomes an interface', out: '5.6-0.3' },

    { k: 'code', x: X, y: 270, size: 29, lh: 50, in: '5.6', stagger: 0.09, lines: [
        '{m:.agents/skills/perf-regression-triage/SKILL.md}',
        '{c:allowed-tools}:',
        '  - Bash({y:./mach try perf --help}:*)',
        '  - Bash({y:treeherder-cli}:*)',
        '  - Bash({y:profiler-cli}:*)',
        '  - Bash({y:git log}:*)',
        '  - mcp__moz__get_bugzilla_bug',
        '  - Read',
        '  - Grep',
      ] },
    { k: 'text', t: "{d:That's not a prompt anymore.}", x: 1020, y: 430, size: 44, in: "5.6@That's not a prompt" },
    { k: 'text', t: "That's a {p:signature}.", x: 1020, y: 540, size: 84, in: "5.6@That's a signature" },
  ]);

  // ---- 06 · Triggers > Memory -----------------------------------------
  scene(6, [
    { k: 'title', t: '{p:Triggers} > Memory', in: '6-0.2' },
    { k: 'text', t: '{d:which guidance applies to this patch?}', x: X, y: 330, size: 48, in: '6.1@nobody should', out: '6.2-0.3' },
    { k: 'code', x: X, y: 266, size: 26, lh: 42, in: '6.2', out: '6.3-0.3', lines: [
        '{m:firefox/review-context.toml}',
        '{d:[[rules]]}',
        '{c:name} = {g:"Gecko WebIDL / web standard implementation"}',
        '{c:when} = { all = [',
        { s: '  { any_file = { ext = [{y:".webidl"}] } },', hl: ['6.2@a web interface definition', '6.2@If it touches front end'] },
        { s: '  { any_file = { ext = [{y:".h"}, {y:".cpp"}] } },', hl: ['6.2@a C++ file', '6.2@If it touches front end'] },
        '] }',
        { s: '{c:load} = [ {p:"…/gecko-web-standard-implementation/SKILL.md"} ]', hl: ['6.2@load the web standards', '6.2@If it touches front end'], hlc: 'p' },
        '',
        { s: '{d:[[rules]]}', in: '6.2@If it touches front end' },
        { s: '{c:name} = {g:"Firefox desktop frontend"}', in: '6.2@If it touches front end' },
        { s: '{c:when} = { any_file = { include = [{y:"browser/**"}, {y:"toolkit/**"}, {y:"devtools/**"}],', in: '6.2@If it touches front end+0.1', hl: ['6.2@If it touches front end+0.3'] },
        { s: '                      exclude = [{r:"**/test/**"}, {r:"**/tests/**"}] } }', in: '6.2@If it touches front end+0.2', hl: ['6.2@but not tests'], hlc: 'r' },
        { s: '{c:load} = [ {p:"…/firefox-desktop-frontend/SKILL.md"} ]', in: '6.2@If it touches front end+0.3', hl: ['6.2@load the front end'], hlc: 'p' },
      ] },
    { k: 'code', x: 1180, y: 300, size: 26, lh: 46, in: '6.2@If a patch touches', out: '6.3-0.3', lines: [
        '{d:patch}',
        '{g:M} dom/webidl/AudioContext.webidl',
        '{g:M} dom/media/webaudio/AudioContext.cpp',
      ] },
    { k: 'text', t: 'The prompt is selected by the {p:diff}.', x: X, y: 470, size: 76, in: '6.3' },
    { k: 'text', t: "{d:Not by somebody's memory.}", x: X, y: 570, size: 48, in: '6.3@Not by somebody' },
  ]);

  // ---- 07 · Prompts rot -----------------------------------------------
  scene(7, [
    { k: 'title', t: 'Prompts {r:rot}', in: '7-0.2' },
    { k: 'text', t: '{d:code has}', x: X, y: 300, size: 36, in: '7.1', out: '7.2-0.3' },
    { k: 'code', x: X, y: 370, size: 44, lh: 66, font: 'sans', in: '7.1+0.2', out: '7.2-0.3', stagger: 0.25, lines: ['Tests', 'Compiler checks', 'Linting'] },
    { k: 'text', t: '{d:prompts have}', x: 900, y: 300, size: 36, in: '7.1@Nothing checks-0.4', out: '7.2-0.3' },
    { k: 'text', t: '{r:nothing}', x: 900, y: 380, size: 72, in: '7.1@Nothing checks', out: '7.2-0.3' },

    { k: 'code', x: X, y: 290, size: 28, lh: 56, in: '7.2', out: '7.3@Reference a name-0.3', lines: [
        '{m:AGENTS.md  ·  last edited two years ago}',
        { s: 'Run the tests with {y:./run-tests.sh --legacy}', hl: ['7.2@goes out of date'], hlc: 'r' },
        '',
        { s: '{g:agent $} ./run-tests.sh --legacy', in: '7.2@The agent will just', type: true, typeDur: 0.9 },
        { s: '{r:sh: ./run-tests.sh: No such file or directory}', in: '7.2@Confidently' },
      ] },

    { k: 'code', x: X, y: 400, size: 56, lh: 90, font: 'sans', in: '7.3@Reference a name', out: '7.4-0.3', lines: [
        { s: '“{p:Reference a name}, not a position.', in: '7.3@Reference a name' },
        { s: ' {d:This text outlives the code it describes.}”', in: '7.3@This text outlives' },
        { s: '{m:— firefox/AGENTS.md}', in: '7.3@This text outlives+0.5' },
      ] },
    { k: 'code', x: X, y: 320, size: 32, lh: 70, in: '7.4', lines: [
        { s: '{r:✗} nsFlexContainerFrame.cpp, line 4312', in: '7.4@no line numbers', strike: '7.4@no line numbers+0.5' },
        { s: '{r:✗} "the function above"', in: '7.4@No, the function above', strike: '7.4@No, the function above+0.6' },
        '',
        { s: '{g:✓} nsFlexContainerFrame::Reflow', in: '7.4@Names' },
        { s: '{g:✓} searchfox.org/firefox-main/{y:rev/<sha>}/<path>#<line>', in: '7.4@links that are pinned' },
      ] },
  ]);

  // ---- 08 · Exceptions for Prompts ------------------------------------
  scene(8, [
    { k: 'title', t: '{p:Exceptions} for Prompts', in: '8-0.2' },
    { k: 'text', t: "What the code {r:can't} tell you", x: X, y: 290, size: 46, in: '8.2' },
    { k: 'code', x: X, y: 400, size: 30, lh: 50, in: '8.3', lines: [
        '{m:gfx/wr/AGENTS.md}',
        { s: 'Automated screenshots do {r:not} show WebRender output by default.', in: '8.3@A default screenshot' },
        { s: '{y:Never} conclude a rendering bug is fixed, or fails to', in: '8.3@So never conclude', hl: ['8.3@So never conclude+0.2'] },
        { s: 'reproduce, from a default screenshot.', in: '8.3@So never conclude+0.1', hl: ['8.3@So never conclude+0.3'] },
      ] },
    { k: 'code', x: X, y: 660, size: 30, lh: 50, in: '8.4', lines: [
        '{m:AGENTS.md}',
        { s: '{y:Never} submit patches to Phabricator without explicit user approval.', in: '8.4@Never submit', hl: ['8.4@Never submit+0.2'] },
      ] },
    { k: 'text', t: '{p:That} is what prompts are for.', x: X, y: 860, size: 52, in: '8.5@That is what' },
  ]);

  // ---- 09 · Structure > Prompts ---------------------------------------
  scene(9, [
    { k: 'title', t: 'How to {p:learn} a large project', in: '9-0.2', out: '9.4@Where should this live-0.3' },
    { k: 'text', t: '{d:for agents — and for people}', x: X, y: 250, size: 40, in: '9.1@For agents', out: '9.4@Where should this live-0.3' },
    { k: 'code', x: X, y: 380, size: 32, lh: 92, in: '9.2', out: '9.4@Where should this live-0.3', lines: [
        { s: '{p:1}  AGENTS.md                    {d:what is true everywhere}', in: '9.2@Start at the root' },
        { s: '{p:2}  <module>/AGENTS.md           {d:the map}', in: '9.2@Step into a module' },
        { s: '{p:3}  .agents/skills/*/SKILL.md    {d:description: the work that gets done here}', in: '9.2@Then skim' },
      ] },
    { k: 'text', t: '73 + 80 + 31 + 123 + 85  =  {p:392 lines}', x: X, y: 760, size: 60, font: 'mono', in: '9.3', out: '9.4@Where should this live-0.3' },

    { k: 'title', t: 'Where should this {p:live}?', in: '9.4@Where should this live', out: '9.5-0.3' },
    { k: 'code', x: X, y: 320, size: 44, lh: 96, font: 'sans', in: '9.4@A scope', out: '9.5-0.3', lines: [
        { s: "{p:Scope}     {d:a directory's own AGENTS.md}", in: '9.4@A scope' },
        { s: '{p:Pointer}   {d:a link to the doc that is maintained}', in: '9.4@a pointer' },
        { s: '{p:Tool}   {d:a command that makes the right thing easy}', in: '9.4@a tool' },
        { s: '{p:Skill}   {d:long knowledge, loaded on demand}', in: '9.4@a skill' },
        { s: '{p:Trigger}   {d:guidance selected by the diff}', in: '9.4@or a trigger' },
      ] },

    { k: 'text', t: "{p:Don't} write prompts.", x: X, y: 440, size: 120, in: "9.5@Don't write prompts", out: '9$+1.6' },
    { k: 'text', t: 'Build the place they belong.', x: X + 6, y: 560, size: 60, in: '9.5@Build the place', out: '9$+1.6' },
    { k: 'text', t: '{p:Structure} > Prompts', x: W / 2, y: 520, size: 130, align: 'center', in: '9$+2.0' },
    { k: 'text', t: '{d:Examples: Firefox source tree — AGENTS.md, .agents/skills, review-context.toml}', x: W / 2, y: 640, size: 28, align: 'center', in: '9$+2.6' },
    { k: 'text', t: "{d:Inspired by CodeAesthetic — Don't Write Comments}", x: W / 2, y: 686, size: 28, align: 'center', in: '9$+2.8' },
  ]);
  FX.confetti.push({ t: at('9$+2.0'), o: [0.0, 0.05] });
}

function drawCover() {
  const narrow = W < 1900, x = narrow ? 84 : 120;
  rich("{p:Don't} write prompts", x, 330, { size: narrow ? 142 : 178 });
  rich('{p:勿}写提示词', x - 4, 570, { size: narrow ? 190 : 168, font: 'zh', color: 'w' });
  rich('{p:>_ Prompt Aesthetic}', x + 4, 760, { size: 76, font: 'mono' });
  rich('{d:Firefox 的根 AGENTS.md 只有} {y:73} {d:行}', x + 4, 900, { size: 56, font: 'zh' });
}
