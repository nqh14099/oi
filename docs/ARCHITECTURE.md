# Source and delivery architecture

## Current source-of-truth artifacts

- `build/content.json` — canonical schema-versioned scene, beat, private script, citation and quiz content data; contract in `docs/DATA_SCHEMA.md`.
- `build/style.css` — draft presentation and interface styles.
- `build/shell.html` — HTML template with insertion points for styles, data and runtime code.
- `build/SPEAKER_SCRIPT.md` — preserved printable presenter script/reference; synchronization or generation from canonical data remains a later task.
- `build/vendor/three.cjs` and `build/vendor/THREE-LICENSE.txt` — local Three.js source and license.
- Root-level documents, media, map references and the existing `reforming_vietnam_political_system_3d.html` remain source/reference material. They are preserved in place and are not generated outputs.

## Intended source-to-final-HTML pipeline

1. Edit canonical content and private presenter scripts in `build/content.json`; validate with `node scripts/validate-presentation.mjs`. Do not independently duplicate script edits in runtime data and the printable reference.
2. Implement the shared world renderer and application/navigation runtime as local source modules under `build/` (not present yet). Keep styles in `build/style.css` and the shell in `build/shell.html`.
3. Add a deterministic local assembler that validates required inputs, safely embeds CSS, JSON, Three.js, runtime modules and required assets into the shell, and writes a single standalone file to `dist/reforming_vietnam_political_system_3d.html`.
4. Verify the generated file by opening it directly with `file://`, with networking unavailable, then test export/reopen and the required interactions before treating it as a delivery candidate.
5. Keep the existing root `reforming_vietnam_political_system_3d.html` untouched until the candidate passes those checks. `/dist/` is ignored by Git because it is generated output; source in `build/` remains tracked.

## Current implementation state

This is a target architecture, not a claim that the pipeline exists. The shell still contains placeholders; world/app runtime modules and assembler are missing. There is no package manifest or verified build command. Do not use the current draft HTML as evidence of a working product. Current proven checkpoint: Git baseline `884743aee1875691d320fc80afadb0c32cd50290`.

T03 adds dependency-free schema/validation modules under `build/`, a standalone CLI under `scripts/`, and targeted native Node tests under `tests/`. The validator checks content structure and project invariants, not academic truth or runtime behavior. No build pipeline or presentation runtime was introduced.
