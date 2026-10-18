# Scene 2 — static 3D exhibition

The original flat diagram is replaced with an oblique exhibition of distinct sculptural forms. Ivory people occupy the foreground centre; wine-red leadership, a brass colonnade, open interlocking members and smoked-glass volumes distinguish the institutions. Shared ground conduits represent connection, not an invented reporting hierarchy. All original audience claims and presenter scripts remain unchanged.

## Applied skills
Installed skill folders were inspected. Applied `threejs-geometry` (bevelled extrusions, lathe and tube geometry), `threejs-materials` (physical materials and transmission), `threejs-lighting` (key/rim lights and environment reflection), and `threejs-fundamentals` (scene-local ownership, shared perspective camera). Read `gsap-core`; no GSAP implementation or dependency was introduced.

## Application files
- `build/cinematic-system.mjs` — new Scene 2 geometry, lighting, local PMREM environment, static camera and label anchors.
- `build/cinematic-scenes.mjs` — Scene 2 labels and audience layout only.
- `build/cinematic.css` — scoped exhibition styles and portrait overrides.
- `build/cinematic-worlds.mjs` — remove Scene 2 from the old scaffold registration list; other worlds unchanged.
- `build/cinematic-registration.mjs` — register the new Scene 2 module.
- `build/assemble-cinematic.mjs` — bundle the module into the existing application.
- `dist/reforming_vietnam_complete.html` — updated presentation, 2,436,785 bytes.

## Verification
- Before/after captures: all three beats, 1600×900 and 390×844 portrait.
- Each after capture reports actual WebGL mode; focused checks also assert an actual WebGL2RenderingContext, not the 2D fallback.
- 19 targeted assertions: unchanged data, 15 scenes/37 beats/three Scene 2 beats, Next/Previous, boundary navigation, Replay, label overlap and errors.
- Existing 37-check interaction harness covers quiz, editor undo/redo, saved edits, export/reopen, notes and audio. See `interaction-results.json` for the executed result.
- No new scene-transition, number-animation or GSAP system. No changes to Scene 3 visuals.

## Limits and next step
Visual judgement remains for user review. WebGL ran through Chromium/SwiftShader; native GPU and projector performance are unverified. The sculptures are visual metaphors, not institutional buildings, official emblems or a formal organogram. No asset downloads or new dependencies were needed. Stop here; animation follows only after visual approval.
