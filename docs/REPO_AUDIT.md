# Repository audit — T00

**Scope:** read-only inventory on 2026-10-12. No build, browser run, dependency install, or HTML modification was performed. Runtime behavior is **UNVERIFIED** unless explicitly stated otherwise.

## Findings

- This folder is not a Git repository (`git status --short --branch` returned “not a git repository”). No package manifest or recognized build configuration/script was found in the inspected tree. There is no established build/run command.
- The intended product is a self-contained offline HTML presentation for Topic 6, with 15 scenes / 8 chapters, one shared Three.js scene system, fallback rendering, presenter controls/notes, four quizzes, and an editor/export flow. The authoritative requirements are in `SPEC.md` and `AGENTS.md`.
- Existing `reforming_vietnam_political_system_3d.html` is a 10-slide static draft. It contains HTML/CSS and visual layout, including early map canvases, but has **no script tags** and no interaction/runtime. The map image elements have no `src`. It is not the planned or verified playable presentation. Preserve it as user material; do not overwrite until a replacement passes the specified offline/export checks.
- `build/` contains a partial implementation/source package: `shell.html`, `style.css`, `content.json`, `SPEAKER_SCRIPT.md`, a Three.js runtime source and its license. The shell still has unresolved `__CSS__`, `__DATA__`, `__THREE__`, `__WORLD__`, and `__APP__` placeholders; no world/app runtime source or assembler/build script is present. The data parses as JSON and describes 15 scenes, 14 references and four quiz entries; this is a static inventory only, not runtime validation. Six Monogrid sample frames exist in `build/qa/`.
- Reference/source materials present include the detailed project plan, original PPTX, scanned History textbook PDF, group rubric DOCX, 63/34 map text data and reference images, several reference HTML files, and the Monogrid MP4. The user requested viewing the video from 00:46 onward; sample frames in `build/qa/` align with that request. These materials have not been validated for legal/content accuracy as part of T00.

## Milestone comparison

| Milestone in SPEC | Current evidence | T00 assessment |
|---|---|---|
| Content/storyboard and sourced claims | `build/content.json`, `build/SPEAKER_SCRIPT.md`; 15 scene records and 14 refs are present | Draft content artifacts exist; accuracy and consistency against all source documents are **UNVERIFIED** |
| Shared 3D renderer and scene/beat navigation | Shell has world/fallback canvases and controls; required runtime placeholders are empty | Not implemented as a runnable bundle; **UNVERIFIED** |
| Scenes 1–15, including 3D maze, 63→34, citizen journey and final card | Static draft has 10 slides; JSON source has 15 planned scene records | Final scenes/visuals/transitions are **UNVERIFIED**; draft HTML does not meet scene count |
| Four interactive quizzes | JSON has four quiz entries; static draft has no JS | Interaction, scoring, explanations and answer handling **UNVERIFIED** |
| Presenter notes/timer, editor, undo/redo, image tools and export | Shell contains UI placeholders/controls, but no runtime or export implementation | All behavior **UNVERIFIED** |
| Offline, responsive, accessibility and resilience checks | No completed artifact or test report found | **UNVERIFIED**; no evidence of browser/device testing |

## Architecture and run/build status

The current work-in-progress is intended to assemble `build/shell.html` with the content, CSS, Three.js, world engine and app runtime into one HTML file. Only the shell, CSS, JSON, script, and vendored Three.js/license are present. There is no assembler, `package.json`, or other build script. Therefore there is currently **no verified run/build instruction**. Opening the existing static draft in a browser may display its static markup, but it does not provide the specified presentation controls or prove the draft works; browser behavior was not tested in T00.

## Immediate risks / missing pieces

1. Missing world-engine source, app-runtime source, and build/assembly script leave shell placeholders unresolved.
2. The actual HTML entry point is the old 10-slide draft; it lacks all JavaScript and external map image references are unset.
3. No Git checkpoint exists, so changes cannot currently be reviewed or rolled back with Git.
4. No browser, offline, export/reopen, keyboard, touch, responsive, quiz, or WebGL fallback QA has been run.
5. Claim/source validation, textbook page checking, and completeness of citations/notes remain **UNVERIFIED**.

## Safe starting instructions

- Preserve all root reference files and `reforming_vietnam_political_system_3d.html`.
- Treat `build/content.json` and `build/SPEAKER_SCRIPT.md` as draft source inputs, not proof of a completed site.
- There is no current build command. Do not tell presenters to use the draft as a finished deck. Once an assembler and runtime exist, document its command and test the generated HTML offline before designating it as the final deliverable.
