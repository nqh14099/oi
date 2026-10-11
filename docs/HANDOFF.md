# Handoff

- **Current task:** T02 academic content audit completed; audit checkpoint pending in this turn.
- **Entry artifacts:** `build/shell.html` (template with unresolved placeholders), `build/content.json` (15 scene records, 14 refs, four quiz entries), `build/style.css`, `build/SPEAKER_SCRIPT.md`, and `build/vendor/three.cjs` plus license.
- **Existing HTML:** `reforming_vietnam_political_system_3d.html` is a 10-slide static draft with no scripts; preserve it.
- **Build/run:** no package manifest or assembler/build script; no verified command.
- **Git:** initialized on branch `main`; baseline includes all 40 existing files. `.gitignore` excludes only generated delivery/test outputs, local dependencies/caches, and OS metadata.
- **Architecture:** intended local source-to-single-HTML pipeline documented in `docs/ARCHITECTURE.md`; assembler and runtime are still missing.
- **Audit:** see `docs/CONTENT_AUDIT.md`. Key open items: Hanoi 126/support sources timed out; textbook pages/bibliography and explicit 63 baseline citation need checking; oral follow-up is after Quiz 1 in script but after Quiz 2 in SPEC; Scene 7 Help station needs explicit representation. User confirms the rubric file headed “Ho Chi Minh’s Ideology” applies to this History of the Communist Party of Vietnam presentation.
- **Unverified:** runtime, answer hiding, all interactions/visuals, offline/export, responsive/accessibility, and the above academic evidence gaps.
- **Next task:** T03 — scene data/schema/tests; carry the T02 evidence and rubric issues forward, and do not treat the audit PASS as closure of those issues.
