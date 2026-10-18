# Scene 4 — The archives of reform

## Source audit
The pasted `add-bestsellers-book-showcase` instructions were read. No matching installed SKILL.md was found in the workspace and the two user skill roots searched. Actual reference copies were found at `landing-pages/LandingPages.tsx`, `landing-pages/LandingPageFrame.tsx`, and `landing-pages/bestsellers-book-showcase.html`, rather than the original `src/` and `public/` paths.

The local HTML SHA-256 is `5315520b8a04dcd183bc5bce192fe120329826a91304986beda8537c18294843`. This does NOT match the supplied revision prefix `7c1ed1ca4a4c`. The HTML contains external Supabase image/video URLs; it does not have all media embedded as stated in the pasted skill. These original files were preserved unchanged. No byte-exact or original-renderer reuse claim is made.

Inspected source: CSS perspective book stack, separate front/back/page layers, serif cover hierarchy, selected-book detail state, pointer parallax, reduced-motion/video visibility handling, click/Escape behavior, and React iframe host permissions/lifecycle. Scene 4 is an independent Three.js implementation inspired by the stacked editorial composition, not an iframe port or shopping page. Source motion/media was not reused. No claim of full original-reference motion review.

## Three original covers
- **1986 / Đổi Mới:** ivory paper, engraved sunrise and cultivated fields; a visual metaphor for renewal of economic thinking.
- **2017 / Organisational renewal:** wine cloth, an ordered architectural framework; a metaphor for organisation and responsibility, not a real government building.
- **2025 / Local government reform:** deep navy cloth, a bridge between communities; a metaphor for connection, not evidence of achieved policy outcomes.

Each book has front/back boards, a curved spine, a textured paper block, page-edge geometry, and an independent cover hinge/group. Original 1024×1536 canvas illustrations and exact serif typography avoid generated-text misspellings. Existing scene data supplies dates/headings. Edited headings repaint the existing texture when rendered. All three beats are static selections; no fly-in, page-turn, camera path, GSAP, or scene transition was added.

## Files changed
- `build/cinematic-archives.mjs` — new Scene 4 geometry, cover artwork, materials, studio environment and static layouts.
- `build/cinematic-scenes.mjs` — Scene 4 DOM composition only.
- `build/cinematic.css` — archive-scoped desktop and portrait rules.
- `build/cinematic-worlds.mjs` — remove Scene 4 from the old supporting-world registration list.
- `build/cinematic-registration.mjs` — register the archive scene.
- `build/assemble-cinematic.mjs` — bundle the new module.
- `dist/reforming_vietnam_complete.html` — updated deliverable (2,449,404 bytes).
- Compact handoff/status entries and evidence under `work/scene4-archives/`.

## Assets and dependencies
No new library, downloaded model, font, image or video. Reuses vendored Three.js and system Georgia. Cover/paper/cloth/environment textures are generated locally by the new module. Applied the existing Three.js geometry/material/lighting guidance plus `threejs-textures` for sRGB colour maps, linear bump data, mipmapping and anisotropy. All texture/render-target ownership remains with the shared engine; no new animation loop or event listener.

## Verification and limits
- Actual Chromium WebGL2 context asserted, not fallback; all three beats captured at 1600×900 and 390×844 portrait. No app/page errors or horizontal overflow in those six states.
- 20 focused assertions: data unchanged, 15 scenes/37 beats, selected years 1986/2017/2025, Replay, Next/Previous, adjacent boundaries, and reference HTML hash unchanged.
- 37 interaction checks: quizzes, editor/undo/redo, persistence, export/reopen, presenter notes, audio and fallback. See machine-readable results alongside this document.
- Before backup: `backup/before.html`; comparison: `comparison.html`.
- Static render review only; native GPU, projector, and physical-device performance are unverified. The archived revision mismatch remains unresolved. Artwork is illustrative and is explicitly labelled as such.

Stop after Scene 4. Next: user visual approval before any animation work.
