# Handoff

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
