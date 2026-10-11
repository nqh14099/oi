# AGENTS.md — REFORMING VIETNAM’S POLITICAL SYSTEM

## Product constraints
- Build a presenter-controlled, cinematic, academically responsible **15-scene / 8-chapter** presentation for Topic 6, History of the Communist Party of Vietnam. Main presentation text and speaker script: English; editor UI: Vietnamese; Vietnamese audience gloss optional and OFF by default.
- Final deliverable: one self-contained HTML file that opens directly via `file://` and retains all essential presentation functionality without Internet, npm, a server, or neighboring asset files.
- The presentation must work offline by default. Optional Internet access may enhance the experience through explicitly approved assets or resources, but must never be required for core presentation functionality.
- Bundle the core JavaScript runtime, Three.js, essential scene data, styles, and required assets into the final HTML. Any optional online resource must have a local fallback or graceful failure behavior.
- Do not depend on remote fonts, CDN scripts, or network requests for essential functionality. Only introduce optional remote resources when they provide a clear visual benefit and can be safely omitted offline.
- Development source may be modular; the final deliverable remains one self-contained HTML file.
- **Do not overwrite the existing user HTML** until the replacement has passed offline/export tests. Keep the existing source and references intact.
- Exactly 15 scenes: 1–2 introduction/system, 3 procedural maze, 4 history, 5 restructuring 63→34/two tiers, 6 integrity, 7 public service, 8–10 responsibilities/vision, 11–14 four quizzes, 15 thank-you only.
- Audience must understand core claims through visual causality even without following English. Short visible text, detailed citations and speaking notes outside audience stage.
- **Never conflate** party policy, enacted institutional change, expected benefit, and independently demonstrated outcome. Historical and legal claims require a source entry or explicit uncertainty. Stylized visuals are NOT geographic, administrative, or impact evidence.

## Visual + interaction contract
- 1600×900 reference stage, scalable 16:9; mobile portrait uses an actually readable stacked layout. Safe margins ~5%. Background near-black/burgundy, gold/ivory; navy for depth; cyan denotes digital public services; green denotes simplified maze routes (not interchangeable).
- One shared Three.js/WebGL2 renderer/camera infrastructure, DOM for text/quiz, SVG for diagrams; fallback 2D when WebGL2 unavailable/lost. Provide reduced-motion mode and controllable quality. System-font fallback; no remote fonts.
- Space / Right / PageDown: next beat, then scene. Left / PageUp: previous beat, then scene. F fullscreen, G overview, Escape dismiss top overlay, E editor, R replay beat, M mute, N private presenter notes. Ignore global navigation shortcuts while typing/choosing in form controls. Support wheel cooldown and touch swipe with on-screen alternatives.
- Default audio OFF, enabled by user gesture; no endless soundtrack. Stop stale animation/sound tasks on navigation and when document hidden.
- A single data model is source of truth for content, scenes, beats, assets, citations, quizzes and export. Persist only real edits, not temporary runtime/editor state.
- Scene 3: same stylized citizen as Scene 7; genuinely 3D thick red cables become physically reorganized clear green routes; always label "Illustrative workflow". Scene 5: **63 3D symbolic blocks → 34 3D symbolic blocks** (11 unchanged symbolic blocks + 52 rearranged symbolically into 23); no false province merger map; "Stylized illustration". Scene 7: Submit → Process → Track → Receive, with connected "Help" station.
- Quiz 11–14: exactly 4 options A–D each, answer sequence D / A / C / B, explanations hidden until Submit, Reset, no automatic advance. The quiz body/explanations are specified verbatim in `SPEC.md`: do not improvise or change answers.
- Content clock baseline: ~11 minutes speaking PLUS ~4–6 minutes quiz, unconfirmed limit. Do not introduce a shortened exam mode unless asked separately.
- Team listed in source: Phạm Tiến Mạnh; Nguyễn Tuấn Hưng; Peeters Hải Nam; Nguyễn Quang Huy. Keep roles and actual work UNASSIGNED until user confirms. Topic 6 is NOT automatically group number 6.

## Agent efficiency and integrity
- Implement **exactly one task per turn**. Read this file, `docs/HANDOFF.md`, and only the relevant spec section and directly affected source files. Do NOT re-read a 400-line spec or scan the entire repository on every task unless needed to diagnose a concrete failure.
- Make a minimal, scoped diff. Do not regenerate the entire application, refactor unrelated modules, add speculative functionality, or silently change confirmed content.
- Use existing dependencies, scripts and architecture. Introduce a new dependency only when essential, record reason/license, and guarantee bundling into the offline output. Never rely on external runtime network calls.
- Run the **smallest targeted check** for the task. At milestone gates run a full smoke test; do not loop through full test suites automatically. Never say an unrun check passed.
- If a task is already implemented, assess its acceptance criteria and change only observed gaps. If essential assets or claims are missing, report missing inputs and build only defensible fallback; do not invent facts.
- End every task with <= 8 lines: changed paths; implemented behavior; exact checks/results; open issues; next task. Update `docs/HANDOFF.md` and `docs/TASK_STATUS.md` compactly. Do not print full file contents or huge logs.
