# Handoff

## 2026-10-18 — Scene 1 Living Flag: Cinematic Camera + Surface Particle Wordmark
- Redesigned `build/cinematic-wordmark.mjs` into a true living cloth particle wordmark sharing exact `clothSample` deformation, normal computation, time, and coordinates with `build/cinematic-flag.mjs`.
- Text is mapped into flag UV coordinates `[0.135, 0.280] x [0.485, 0.655]`, placed on the red silk fabric field to the left of the emblem. Wordmark points are added directly into `flag.group` and rendered inside the unified WebGL scene pass with bloom post-processing.
- Particle animation follows ThreeUI / Sublevel Studio dynamics: Phase A (0-1s) scattered stardust on cloth; Phase B (1-2.5s) smootherstep convergence with swirling trajectory and turbulence; Phase C (2.5-4s) letter completion with warm imperial gold pulse on VIETNAM'S; Phase D (>4s) living typography undulating with cloth waves and micro-shimmer.
- Reframed camera path in `build/cinematic-registration.mjs` with continuous Catmull-Rom/Hermite spline: Shot A (0-1s) extreme close-up grazing angle -> Shot B (1-2.5s) dynamic orbit revealing emblem and letter formation -> Shot C (2.5-4.2s) hero reveal framing -> ambient breathing drift (>4.2s), with 100% viewport coverage (no exposed rectangle edges or black voids at any point).
- Preserved DOM `.cover-title` for accessibility, Editor synchronization, and HTML export.
- Output: `dist/reforming_vietnam_complete.html` (3,096,162 bytes), 7.8s video `work/scene1-cinematic/scene1_living_flag.webm`, screenshots in `work/scene1-cinematic/`. Zero page errors across desktop & portrait.
- Next: visual and presentation review by user.

## 2026-10-17 — Scene 2 reference exhibition
- Rebuilt the Scene 2 installation from the supplied museum reference: suspended wine banner, extruded approved CPV emblem, civic colonnade, lotus, citizens, layered brass podiums and architectural backdrop. Neutral medallions are symbolic, not official logos.
- Scoped files: build/cinematic-system.mjs, build/cinematic.css, build/assemble-cinematic.mjs and dist/reforming_vietnam_complete.html. Academic data and navigation unchanged.
- Executed: 19 targeted assertions passed, actual WebGL2, all three desktop/portrait states captured without runtime errors or horizontal overflow; evidence and preserved previous HTML in work/scene2-reference/. Visual review used static screenshots, not continuous playback.
- Next: user visual review of Scene 2. No other scene work or new animation; native GPU/projector performance remains unverified.

## 2026-10-16 — Scene 4 archive collection
- Independent Three.js books in `build/cinematic-archives.mjs`; approved 1986/2017/2025 data preserved. Original engraved covers, textured paper/cloth, curved spines, individual pivots, scene-local studio environment; all three selection states static.
- Reference files in `landing-pages/` preserved. Local showcase hash `5315520b8a04...` differs from skill revision `7c1ed1ca4a4c`; remote media URLs also contradict embedded-only description. This is not a byte-exact port. Details in `work/scene4-archives/REVIEW.md`.
- Output `dist/reforming_vietnam_complete.html`; before backup and six before/six after images with gallery in `work/scene4-archives/`. Actual WebGL2 verified; 20 targeted assertions and interaction regression results recorded locally. No academic/source-reference edits or new dependencies.
- Next: user review of Scene 4 imagery; do not implement book animation or scene transitions. Native GPU/projector performance remains unverified.

## 2026-10-16 — Scene 2 static 3D exhibition
- New scene-local `build/cinematic-system.mjs` replaces old scaffold registration. Bevelled wine/brass/glass sculptures, ivory people, shared exhibition ground, local PMREM lighting and projected DOM labels. Static 3-beat composition; no new animations or transitions. Existing content/notes unchanged.
- Deliverable `dist/reforming_vietnam_complete.html`; before backup and all three beats at desktop/portrait: `work/scene2-redesign/`. Open `comparison.html` and `REVIEW.md` for evidence/files/limits.
- Executed: actual WebGL2 context confirmed; 19 targeted data/navigation/replay/label checks; six after captures have zero app/page errors and horizontal overflow. Existing interaction harness recorded separately in `interaction-results.json`.
- Next: user approval of static Scene 2. Do not advance to Scene 3 or animation. Native GPU/projector performance remains unverified; sculptures are illustrative, not institutional architecture or a formal organogram.

## 2026-10-16 — Cinematic number animation
- Implemented `build/cinematic-numbers.mjs`: shared count/target-digit reveal, stable semantic keys, canonical selectable text, pause/resume/replay/update/cancel, external progress, reduced motion. Runtime/bundler/CSS integration; Scene 3 canvas labels; Scene 5 new 34 metric follows actual map progress. No content/script/navigation changes.
- Output: `dist/reforming_vietnam_complete.html`; pre-task backup `work/number-animation/backup/before.html`. Evidence/inventory: `work/number-animation/evidence/index.html`, `results.json`, `final-results.json`, `interaction-results.json`.
- Executed: 103 number assertions including 37 beats at desktop and portrait; 37 interaction/export checks; 7 actual-map/stable-counter/OS-motion/mobile checks; 35 navigation/input tests. Corrected OS motion change handling and dynamic class whitespace causing unwanted replays. Academic data unchanged in browser comparison.
- Limit: sampled start/mid/end frames with software GL, not continuous playback or projector performance. Next: user motion review; no scene-transition redesign performed.

## 2026-10-16 — Visual redesign A–D, awaiting user review
- Latest master prompt supersedes the performance-baseline gate and single-file/offline restrictions. Visual refinement only; no new scene-transition system. Existing offline architecture retained because no new runtime dependency was needed.
- Deliverable: `dist/reforming_vietnam_complete.html` (2,416,655 bytes). Previous `dist/reforming_vietnam_political_system_3d.html` unchanged by SHA-256. Backups, exact copy edits, all-scene assessment and before/after gallery in `work/visual-redesign/` (`REVIEW.md`, `comparison.html`).
- Changes: typography/layout across deck, 3D archival folios in 4, connected flame/bowl in 6, proportion/labels in 7, quiet divider 8, actionable book/taskboard/evidence objects in 9, studio reflections/camera adjustments, enlarged quiz. Preserve flag geometry, citizen design, map polygon data, quiz D/A/C/B, refs and presenter scripts. Editorial copy list in `copy-changes.json`.
- Verified: 52 controller/input/world tests; 37 browser interaction checks including editor persistence/download/export reopen, notes, audio toggle, fallback; 37 desktop beats + 15 portrait states with zero console/app/page errors or horizontal overflow. Final Scene 3 portrait correction and Scene 7 normal-motion sample checked separately, errors empty. Software GL only; no continuous video/projector verification claim.
- Next: user visual approval, especially 4/6/9 and retained abstract 2/10. No Phase E without approval. Generalised map is not a legally verified boundary survey; academic audit gaps remain. New assets/dependencies: none (studio texture generated internally).

## 2026-10-16 — Optimization Phase 0 stopped at baseline gate
- Source filename now `dist/reforming_vietnam_political_system_3d.html`; protected script sizes/hashes match the brief. Original HTML unchanged (full SHA-256 verified).
- Existing bundled Playwright 1.62.1 loaded via absolute require; no installation needed. Harness/evidence: `work/optimization-baseline/measure.cjs`, `baseline.json`, scene 1–3 PNGs. Software Chromium only; no GPU FPS claim.
- Partial run: startup largest long task 5991 ms versus 5212 (+14.9%); Scene 3 first navigation 886.2 ms versus 1804 (-50.9%); Scene 3 draw calls 46 versus 46. Stopped before Phase 1 because deviation exceeds 30%. Scenes 4–15 not measured, no optimized HTML produced.
- Next: user decision on baseline conditions/reference. Observed default quality High; brief describes medium flag sampling. Do not optimize until the baseline discrepancy is resolved. No app-error query completed.

## Active handoff — 2026-10-15 Scenes 7 and 10 visual revision

- Completed the approved Impeccable critique follow-up in `build/cinematic-worlds.mjs`, `build/cinematic-scenes.mjs`, and `build/cinematic.css`: oblique service journey, smaller supports/larger explanatory props, continuous application transfer, separated Help branch; spatial year labels, open future thresholds, feathered contact grounding, readable goal qualifiers. Shared citizen, academic text, scene IDs and input/navigation contracts retained.
- Existing `dist/reforming_vietnam_complete.html` already includes these exact scene modules/styles plus the newer Scene 3 work below. Verified byte-identical relevant blocks against the reviewed candidate; preserved the newer bundle instead of overwriting it.
- Executed: 34/34 controller/world tests; desktop scene states and 390px portrait checks; settled replay for 7/10, reverse navigation, rapid destination for 10; latest final HTML reopened with HTTP(S) blocked, all 7 target beats WebGL/no app or browser errors. Motion reviewed through sampled frames/source, not continuous native-GPU playback.
- Next: user visual review of Scenes 7 and 10 in the final HTML. No further design loop or unrelated features; Scene 3 changes preserved. Academic verification gaps unchanged.

## Active handoff — 2026-10-14 Scene 3 procedural maze 2.5D redesign

- Scene 3 completely redesigned per brief: replaced rejected thick 3D tubes and floating paper props with elegant 2.5D luminous camera-facing ribbon paths, soft anti-aliased edge glow, champagne ambient depth particles, and an animated citizen application particle.
- Procedural network connects 4 stations: Reception → Review → Approval → Result. Confusing state features redundant detours with bottleneck pauses at Review/Approval. Reform morphs geometry into a direct route, retracts secondary loops, and propagates a luminous green light wave as the application glides to Result.
- Citizen stands stably at x = -3.85 with open book, framed cleanly without overlapping the Reception station.
- Bundle rebuilt: `dist/reforming_vietnam_complete.html` (2,408,914 bytes). CDP headless browser verified: 8/8 assertions passed, 0 errors, desktop and 390px portrait validated.
- Next: User visual review of Scene 3 in browser.

## Historical handoff — 2026-10-13 reference character

- User rejected the articulated mannequin and supplied an ivory, large-headed character holding an open book as the new visual authority. Implemented only this shared 3D character and its facing direction in Scenes 3 and 7.
- `build/cinematic-citizen.mjs`: continuous implicit-surface body with rounded arms/feet, enlarged smooth head, curved eye/blush/mouth geometry, layered open folder, localized material fill and existing gait compatibility. `cinematic-maze.mjs` / `cinematic-worlds.mjs`: face the character three-quarters toward the audience.
- Rebuilt `dist/reforming_vietnam_complete.html`. Browser inspection with HTTP(S) blocked: close view, both scenes, sampled walking pose and 390px portrait; app/browser error arrays empty, portrait overflow false. Assembly validates 15 scenes / 8 chapters. No continuous playback or projector-performance claim.
- Next: user review of the character proportions and material against the supplied image. Graphics remain the priority; defer other features. Previous visual pass below is history, not user approval.

## Active handoff — 2026-10-13 graphics pass

- Latest user direction: graphics first, especially Scenes 3 and 7; defer additional features. Online enhancements permitted, but the current output is self-contained.
- Output: `dist/reforming_vietnam_complete.html`; assemble with `node build/assemble-cinematic.mjs`. Saved work recovered; original presentation, standalone prototypes and reference decks preserved.
- Scene 3 uses dimensional red cables, paper trays and floating documents; cables physically reorganize into green routes. Caption remains separate from the spatial scene. The same citizen continues into Scene 7.
- Scene 7 has sculpted counters and distinct Submit / Process / Track / Receive props, camera-projected labels and a connected physical Help station. Direct sources: `cinematic-maze.mjs`, `cinematic-citizen.mjs`, `cinematic-worlds.mjs`, `cinematic-registration.mjs`.
- Earlier integration evidence: 52/52 focused controller/input/world tests; 70 browser assertions and exported-HTML reopening before the final graphics pass. Final graphics checks and limitations are recorded in `TASK_STATUS.md`; sampled frames are not continuous playback or native-GPU performance evidence.
- Academic verification gaps remain open. The visual result requires user review. Next: review these two compositions against the supplied reference decks; continue graphics only until the user directs otherwise.

## Historical T03 checkpoint

- **Current task:** T03 data schema and validator completed; see `docs/DATA_SCHEMA.md`.
- **Entry artifacts:** `build/shell.html` (template with unresolved placeholders), `build/content.json` (15 scene records, 14 refs, four quiz entries), `build/style.css`, `build/SPEAKER_SCRIPT.md`, and `build/vendor/three.cjs` plus license.
- **Existing HTML:** `reforming_vietnam_political_system_3d.html` is a 10-slide static draft with no scripts; preserve it.
- **Data check:** `node scripts/validate-presentation.mjs`; `node --test tests/data-validator.test.mjs` (41/41 pass). Native ES modules, no dependencies/package manifest. Assembler and presentation runtime remain absent.
- **Git:** initialized on branch `main`; baseline includes all 40 existing files. `.gitignore` excludes only generated delivery/test outputs, local dependencies/caches, and OS metadata.
- **Architecture:** intended local source-to-single-HTML pipeline documented in `docs/ARCHITECTURE.md`; assembler and runtime are still missing.
- **Data contract:** `build/data-schema.mjs` and `build/validate-data.mjs`; content retains numeric scene/chapter IDs, adds explicit order and globally unique beat IDs. Beat text is `audience`; speaking scripts are `presenter.script`. Quiz public question/options are separate from private assessment, with Submit/Reset contracts. Timing stays estimated; roles remain unassigned. Scene 3/7 share citizen identity; Scene 7 connected Help is now explicit metadata (visual implementation pending).
- **Audit:** see `docs/CONTENT_AUDIT.md`. Key open items: Hanoi 126/support sources timed out; textbook pages/bibliography and explicit 63 baseline citation need checking; oral follow-up is after Quiz 1 in script but after Quiz 2 in SPEC. User confirms the rubric file headed “Ho Chi Minh’s Ideology” applies to this History of the Communist Party of Vietnam presentation. T03 preserves all existing wording and references; no academic verification gaps were closed.
- **Unverified:** runtime, answer hiding, all interactions/visuals, offline/export, responsive/accessibility, and the above academic evidence gaps.
- **Next task:** T04 — Stage + design tokens + responsive (VISUAL STAGE SHELL ONLY), per CODEX_TASKBOOK.md. Read the new data contract before accessing beats/quizzes. Do not implement later runtime/3D tasks or treat data validation as academic verification.

## Scene 3 standalone prototype (2026-10-13)
- Added build/maze-scene.mjs, maze-prototype.mjs, maze-prototype.html and assemble-maze-prototype.mjs; output dist/procedural_maze_3d.html. Existing flag and presentation preserved.
- Verified offline WebGL render, intermediate reform frame, corrected final routes, reduced motion, 10 navigation assertions and portrait width 390/390. Full-speed continuous motion performance remains unverified: software-browser inspection timed out.
- Next: user visual review of this standalone scene; integration into full presentation is not included.

## Scene 5 standalone (2026-10-13)
- Delivered dist/restructuring_63_to_34.html; source build/restructure-scene.mjs, restructure-prototype.mjs/html and assemble-restructure-prototype.mjs.
- Verified offline rendering, exact 63/34 counts, 11 unchanged, 23 symbolic merger groups, replay/back/reduced motion (6 assertions), portrait no horizontal overflow. Sampled animated intermediate and final frames; no claim of native playback performance.
- Next: user review; full presentation integration remains outside this task.

## Scene 5 map correction (2026-10-13)
- User explicitly replaced symbolic square-block direction with geographic relief based on supplied map photos. Updated Scene 5 only; dist/restructuring_63_to_34.html now bundles 63 generalised province outlines, 23 unioned merger regions and 11 unchanged regions, plus labelled island insets.
- Source: https://github.com/nguyenduy1133/Free-GIS-Data pre-2025 outlines. Post-2025 dataset not used (duplicate province label found); merged geometry derived from original outlines. Geometry is generalised, not a legal survey. Build asset: build/assets/vietnam-map-regions.json.
- Browser: before/after/replay/back counts pass (63/34), animation reaches final hold, desktop/portrait inspected, errors empty. Next: user visual review.

## User-approved reference inputs (2026-10-13)
- Reference analysis only: welwelwel.html, usa-presentation_v8.html, index.html, and VẺ ĐEP CỦA VIỆT NAM.html. Opened representative states in browser; app/CSS motion code reviewed independently. No claim of continuous playback review or full-deck QA.
- Use USA for dominant serif title + layered national imagery; Vietnam for coherent cutout/photo layers and scene-specific visual identity; welwelwel for coordinated camera/object/title choreography; index for clear explanatory hierarchy and alternating compositions.
- Correction to working method: compose an authored, full-frame scene first; detail counts and shader effects do not establish visual quality. Current small central models and detached captions fall below these references. Preserve CPV content/palette/offline constraints; borrow composition principles, not unrelated branding or dependencies.
- No HTML edits during this reference-analysis turn. Next implementation should use these concrete references before geometry/effect tuning.
