# CODEX TASKBOOK — REFORMING VIETNAM’S POLITICAL SYSTEM

**Mục đích:** kế hoạch vận hành Codex ít tốn quota, dựa trên tài liệu kế hoạch ngày 11/10/2026. Đây **không phải** mã nguồn website và **không phải** lệnh tự triển khai HTML. Chỉ bắt đầu code khi chính người dùng quyết định giao từng task.

## Cách dùng

1. **Nếu Codex đang chạy một nhiệm vụ khổng lồ:** dừng nhiệm vụ đó nếu có thể; sao lưu repo/branch hiện tại. Đừng giao một prompt "build entire project" nữa.
2. Chép **nội dung** file `AGENTS_reforming_vietnam_template.md` vào `<project>/AGENTS.md` *sau khi đối chiếu kiến trúc thực tế*. Với Codex thường `AGENTS.md` có thể tự được nạp làm chỉ dẫn repo; giữ file ngắn.
3. Đặt bản kế hoạch gốc ở `docs/SPEC.md`. Đây là tài liệu tham chiếu, **không copy lại vào mọi prompt**. Khi cần nguyên văn nội dung quiz, trích đúng từ SPEC.
4. Tạo `docs/TASK_STATUS.md` gồm `ID | status | commit | checked | issue`; `docs/HANDOFF.md` chỉ khoảng 30–80 dòng phản ánh state hiện tại.
5. **Mỗi lần dán MỘT prompt của MỘT task**. Đọc output và kiểm tra nghiệm thu (AC) rồi mới chuyển task tiếp theo. Không yêu cầu agent tự chạy hết danh sách.
6. Nếu task đã hoàn thành trong repo hiện tại, **không làm lại**: yêu cầu kiểm tra AC, ghi `PASS/NEEDS FIX` rồi đi tiếp. Ưu tiên giữ công sức từ 90% quota đã dùng.
7. Không cần dùng model mạnh nhất cho tất cả: logic scene 3D/bug tích hợp mới là phần đắt; dữ liệu/quiz/CSS/ghi chú dùng model tiết kiệm hơn nếu sẵn có. Tên model và giới hạn có thể thay đổi tùy tài khoản.
8. Sau mỗi mốc, **tự mở trình duyệt nhìn bằng mắt** và tạo Git checkpoint. Lỗi thực tế hãy đưa error + đường dẫn file + bước tái hiện cho Codex; không bảo "tìm và sửa mọi bug".

**Quy tắc nguồn:** Bản SPEC là thiết kế dự kiến, không chứng minh HTML đã có tính năng hay đã test. Nếu folder `CPV` có bản đồ, video Monogrid và reference HTML thì giữ nguyên, chỉ dùng làm reference; không nhúng video ~32 MB vào build. Đường dẫn cuối `D:/Downloads/CPV/reforming_vietnam_political_system_3d.html` chỉ dùng khi Codex có quyền ghi đường dẫn đó; nếu không, xuất vào `dist/` rồi copy thủ công.

**Dấu trạng thái:** TODO → IN_PROGRESS → PASS hoặc BLOCKED. Chỉ đánh PASS khi có kiểm tra tương ứng, không đánh PASS chỉ vì agent tuyên bố đã làm.

---

## GIAI ĐOẠN 0 — CỨU TIẾN ĐỘ VÀ KHÓA PHẠM VI

### T00 — Kiểm kê repo hiện tại, KHÔNG viết code
**Đầu vào:** workspace Codex hiện tại; `SPEC.md`/HTML/reference nếu có.  **Đầu ra:** `docs/REPO_AUDIT.md` và handoff ngắn. **AC:** biết chính xác phần nào đã có, phần nào hoạt động/chưa kiểm tra, cách chạy/build, file gốc cần bảo toàn. **Chi phí:** rất thấp.

**Prompt Codex**
```text
TASK T00 — READ-ONLY REPOSITORY AUDIT.
Do not implement, refactor, install packages, build the full project, or overwrite any existing HTML.
Inspect the folder/file tree, package/build scripts, Git status, and ONLY the main entry files needed to identify the current state. Compare actual files with the product milestones in docs/SPEC.md; read headings/sections rather than dumping the whole spec.
Write docs/REPO_AUDIT.md: existing artifacts, architecture, proven working features, incomplete features, missing assets, build/run instructions and immediate technical risks. Mark anything not tested as UNVERIFIED. Write a compact docs/HANDOFF.md and docs/TASK_STATUS.md listing tasks T00–T27.
Do not claim testing or a completed website. Stop after a short summary (<=8 lines).
```

### T01 — Tách workspace, chốt quy tắc agent và giữ bản gốc
**Đầu ra:** cấu trúc `src/`, `scripts/`, `tests/`, `docs/`, `dist/` thích hợp; AGENTS; giữ nguyên source gốc. **AC:** không làm mất tệp hiện có và chạy được dev workflow nếu đã có. **Chi phí:** thấp.

**Prompt Codex**
```text
TASK T01 — PREPARE SAFE DEVELOPMENT WORKSPACE.
Read AGENTS.md, docs/HANDOFF.md and docs/REPO_AUDIT.md only. Preserve the original HTML/reference images/videos untouched; never delete user work. If the repo already has a suitable modular layout, keep it.
Establish small directories for src/data, src/runtime, src/scenes, src/ui, src/styles, scripts, tests, docs and dist as needed. Keep docs/SPEC.md as the untouched master specification. Do not code scenes, add dependencies or run a full build.
Record actual paths and the minimal next files in docs/HANDOFF.md. Ensure .gitignore ignores transient build artifacts but not original references. Report changes and check performed, then stop.
```

### T02 — Chuẩn hóa nội dung/narration và nguồn (có thể làm bằng ChatGPT thường, không cần Codex)
**Đầu ra:** `docs/CONTENT_MATRIX.md`, `docs/SOURCE_REGISTER.md`, `docs/SPEAKER_SCRIPT.md`. **AC:** đủ 15 cảnh, mỗi beat có on-screen English, visual action, narrator text, source ID, time, next/previous state; không chế số liệu hoặc thành tựu. **Chi phí Codex:** tránh nếu có thể.

**Prompt Codex nếu cần**
```text
TASK T02 — CONTENT DATA ONLY; NO UI IMPLEMENTATION.
Read only the relevant sections of docs/SPEC.md (storyboard, quiz, timeline, references) and existing docs/content files. Create docs/CONTENT_MATRIX.md with all 15 scenes/beat states, key on-screen English phrases, visual causality, speaker-note intention, duration and source linkage. Create docs/SOURCE_REGISTER.md with stable IDs, publisher, title, URL/book page, supported claim and verification status; never label excerpt-only/unchecked materials fully verified.
Draft docs/SPEAKER_SCRIPT.md toward the existing ~11-minute main speaking allocation. Keep quiz text and D/A/C/B answers exactly as specified. Do not assign the four students unconfirmed roles or turn policy goals into verified results. Do not modify runtime, scene code or build scripts. List open source gaps explicitly and stop.
```

### T03 — Dữ liệu scene + schema + tests đầu tiên
**Đầu ra:** `src/data/presentation.js`, `src/data/validate.js`, test dữ liệu. **AC:** 15 ID scene độc lập, 4 quiz đúng đáp án, references có trạng thái, các đối tượng có ID ổn định. **Chi phí:** thấp–vừa.

**Prompt Codex**
```text
TASK T03 — CREATE THE SINGLE SOURCE-OF-TRUTH DATA MODEL.
Read AGENTS.md, docs/HANDOFF.md, docs/CONTENT_MATRIX.md and only current data modules. Implement a lightweight presentation data model with presentation/scenes/beats/objects/assets/references/quizzes and stable IDs. Prefer plain JavaScript modules to new dependencies. Keep content and runtime states separate; data must be safely serializable for future offline export.
Add a targeted validator/test asserting exactly 15 scenes in order, no independent references/open-discussion scene, Scene 15 visible text only 'Thank you for listening', exactly 4 quiz scenes with four answers each, answer keys D/A/C/B, and required 63→34 + two tiers facts. Do NOT build any UI or 3D. Run only the validator test. Update handoff and stop.
```

**GATE 0:** T00–T03 PASS mới mở rộng runtime. Nếu nội dung lịch sử, nguồn hoặc mô hình dữ liệu chưa ổn, không đổ hàng trăm dòng Three.js vào.

---

## GIAI ĐOẠN 1 — SƯỜN TRÌNH CHIẾU VÀ CHỨNG MINH OFFLINE SỚM

### T04 — Stage + design tokens + responsive
**Đầu ra:** stage 1600×900, CSS palette, vùng an toàn, portrait đọc được. **AC:** Chrome/Edge desktop hiển thị stage 16:9 không méo; điện thoại đọc được nội dung. **Chi phí:** thấp.

**Prompt Codex**
```text
TASK T04 — VISUAL STAGE SHELL ONLY.
Read AGENTS.md, handoff, existing entrypoint and CSS files. Build the minimal presenter stage with 1600x900 design coordinates, responsive 16:9 scaling, near-black/burgundy/gold/ivory tokens, safe margins, system fonts and a separate portrait stacked reading layout. Use one placeholder data-driven scene to demonstrate geometry; do not implement actual scenes or 3D yet.
Keep audience text readable, stage unclipped and controls accessible. No CDN and no CSS framework. Add a minimal responsive smoke check if a test runner already exists; otherwise document manual widths 1366x768, 1920x1080 and portrait. Do not touch quiz/editor/notes. Stop.
```

### T05 — Scene/beat state machine, deterministic navigation
**Đầu ra:** `src/runtime/state.js`, beat lifecycle. **AC:** tiến/lùi theo beat, hủy transition cũ, replay giữ state; không mất nội dung khi nhấn liên tục. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T05 — DETERMINISTIC SCENE/BEAT ENGINE.
Read AGENTS.md, handoff, presentation data schema and runtime modules only. Implement sceneId + beatIndex state with next/previous boundaries, enter/exit and transition cancellation tokens. Advancing during active animation must complete or settle the active beat before moving on, rather than silently skipping arguments. Replay must reset only the current beat's visual animation, not quiz answers or audio mute.
Provide a tiny controller UI sufficient for smoke tests. Add tests for first/last boundaries, rapid repeated navigation, reversing beats and state cleanup. Do not implement scenes/Three.js/editor. Run targeted runtime tests only. Stop.
```

### T06 — Keyboard, mouse, touch, overview, fullscreen
**Đầu ra:** input handler; G overview (15 entries); focus safety. **AC:** Space/Right/PageDown, Left/PageUp, F/G/E/R/M/N reserved; wheel cooldown, swipe; không hijack thao tác quiz. **Chi phí:** thấp–vừa.

**Prompt Codex**
```text
TASK T06 — PRESENTATION INPUT/OVERVIEW CONTROLS.
Read AGENTS.md, handoff and runtime input/UI files only. Implement Space/Right/PageDown next beat, Left/PageUp previous beat; F fullscreen, G 15-scene overview with clickable thumbnails, Escape closing only the topmost overlay, R replay, and placeholder hooks for E/M/N without fake features. Wheel next/prev uses a 650ms cooldown; swipe horizontal uses the same state transitions. Add visible accessible buttons as alternatives.
Ignore global shortcuts when focus is on input, textarea, select, contenteditable, quiz controls or modal interactions. Test focus safety and quick navigation. Do NOT modify scene content, animation system or export. Stop.
```

### T07 — One shared 3D renderer + real fallback
**Đầu ra:** single renderer/camera, lifecycle hooks, SVG/Canvas 2D fallback, WebGL context recovery. **AC:** chuyển scene không tích thêm canvas/material; fallback không xóa nội dung. **Chi phí:** cao → dùng reasoning mạnh nếu có.

**Prompt Codex**
```text
TASK T07 — SHARED THREE.JS RENDERER AND FALLBACK INFRASTRUCTURE.
Read AGENTS.md, handoff, runtime state, current rendering modules and only spec section 4 (visual/technology). Introduce one shared renderer, camera, scene lifecycle, resize and cleanup/dispose routines. Bundle Three.js locally for dev, with a build path for embedding it offline later; do not use CDN or a second renderer per scene. Add basic 3D scene stub with light/shadow/depth and explicit 2D SVG/Canvas fallback for WebGL2 unavailable/context loss.
Support high/low quality and reduced motion without losing content; stop animations when scene hidden. Test only mount→unmount→remount, renderer count and fallback triggered by a controlled flag. Do not build the maze/map yet. Stop.
```

### T08 — Đóng gói offline thử nghiệm, trước khi làm cảnh nặng
**Đầu ra:** `scripts/build.mjs`, `dist/offline_smoke.html`. **AC:** mở `file://` không network, thử app state được. **Chi phí:** vừa–cao; đây là GATE kỹ thuật quan trọng.

**Prompt Codex**
```text
TASK T08 — EARLY OFFLINE SINGLE-HTML BUILD PROOF.
Read AGENTS.md, handoff, current entrypoint, dev bundler and asset mechanism only. Implement a deterministic build script producing ONE HTML file with inline JS/CSS and locally embedded runtime/assets. Development npm/node is allowed; final file must work using file:// with network disabled and no adjacent dependencies. Preserve required third-party license notices. Do not package reference video.
Create a tiny offline-smoke page from existing minimal runtime, open/test it if browser automation is available, record actual result; otherwise explicitly mark browser-open test UNVERIFIED and provide exact manual steps. Verify generated HTML has no external script/style/font/fetch dependencies. Do NOT rewrite all 15 scenes, editor or quiz. Stop.
```

**GATE 1:** File thử nghiệm offline mở được + engine điều hướng ổn + không nhân đôi WebGL renderer. Nếu không qua, sửa đúng lỗi này trước khi tiếp tục.

---

## GIAI ĐOẠN 2 — CÁC CẢNH THEO GIÁ TRỊ THUYẾT TRÌNH

### T09 — Scene 1 & 2: Opening + political system diagram
**Đầu ra:** mạng điểm vàng và sơ đồ có nhãn Đảng–Nhà nước–MTTQ/tổ chức chính trị-xã hội, người dân là chủ thể. **AC:** không vẽ các vai trò như các nút ngang hàng hoặc Đảng đứng ngoài hệ thống. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T09 — SCENES 01 AND 02 ONLY.
Read AGENTS.md, handoff, content matrix for S01–S02, corresponding spec paragraph (Scene 2 political-system components), renderer API and scene files S01/S02 only. Implement cinematic gold-network opening and short beats defining the political system. The component diagram must distinguish Party leadership, State management, Fatherland Front/political-social organizations, and the people's role as subject/centre; it must not show identical institutional functions.
Keep on-screen English brief and cite source IDs in notes/data, not an audience reference slide. Maintain stage safety and reduced-motion states. Run only scene1–2 smoke/targeted visual check and stop. Do not touch later scenes.
```

### T10 — Scene 3A: Maze BEFORE (geometry, citizen, camera)
**Đầu ra:** nhân vật từ lưng + sợi dây đỏ mesh 3D thực + điểm chắn + nhãn illustrate. **AC:** dây có độ dày/che khuất; người xem hiểu repeated steps/unclear responsibility. **Chi phí:** rất cao.

**Prompt Codex**
```text
TASK T10 — SCENE 03 MAZE, BEFORE STATE ONLY.
Read AGENTS.md, handoff, only spec 'Cảnh 3 — mê cung dây 3D' and S03 file/renderer API. Create one reusable simplified 3D citizen asset (stable dimensions/materials, exported for later reuse in Scene 7). Build real thick tube/mesh red cables with 3D crossings, occlusion, subtle shadows and a recognizable blocked route; camera sits slightly above/behind the citizen. Add a document held by the citizen and short labels 'Repeated steps', 'Unclear responsibility', 'Illustrative workflow'.
Deliver only entrance→confusion beats, stable pause and controlled camera. No reform effect, map, editor or audio yet. Provide reduced-motion/2D equivalent conveying the same problem. Test S03 mounting, 3D depth and no memory leaks. Stop.
```

### T11 — Scene 3B: Apply Reform (transform thật, không đổi màu giả)
**Đầu ra:** animation red cables → green reorganized routes + replay, stable explanation. **AC:** hình học có đổi, không chỉ opacity/color; đủ ba động lực. **Chi phí:** rất cao.

**Prompt Codex**
```text
TASK T11 — SCENE 03 APPLY REFORM TRANSFORMATION ONLY.
Read AGENTS.md, handoff, S03 data/code and spec 'Nhịp 3 — Apply Reform'. Extend the current 3D maze with an explicit presenter-triggered sequence: focus tangled node → red-to-green propagation by cable groups → physically move/re-route cable geometry to clear flows → open camera framing → citizen advances and stops. Keep final state static while sequentially revealing Economic change / Administrative effectiveness / International integration.
The transformation must be actual 3D geometry movement, not a full-frame color swap or crossfade. Maintain 'Illustrative workflow'; do not invent before/after durations or effectiveness data. Implement deterministic rewind/replay and reduced-motion/fallback endpoint states. Test repeated Apply Reform, navigation away/back and state cleanup, then stop.
```

**GATE 2A:** Scene 3 phải được xem ở trạng thái before, moment chuyển và after; nếu không người ngoài không hiểu nút thắt → đường rõ, sửa visual trước task khác.

### T12 — Scene 4: 1986 → 2017 → 2025 timeline
**Đầu ra:** 3 mốc có visual khác nhau nhưng chung camera/ngôn ngữ; 1992/2011 chỉ notes. **AC:** không gán ba mốc là cùng loại sự kiện. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T12 — SCENE 04 HISTORICAL ANCHORS.
Read AGENTS.md, handoff, only content/spec for S04 and associated sources. Build three sequential visual beats: 1986 Đổi Mới context; 2017 Resolution 18 organizational reform; 2025 local-government restructuring. Make the timeline an animated spatial narrative with meaningful graphic differences rather than a row of dates. Include the historical bridge 1992 and 2011 only in speaker notes/Q&A, not extra timeline labels.
Keep on-screen wording small and sourced. Do not imply the milestones are the same kind of act or that earlier events automatically prove later implementation outcomes. Test scene forward/back/replay only. Stop.
```

### T13 — Scene 5A: 63 → 34 symbolic raised 3D blocks
**Đầu ra:** 63 mesh BEFORE, animated merge, 34 AFTER, correct counter. **AC:** số mesh đúng ở từng trạng thái, 11 unchanged/52→23 symbolic, camera chuyển có chủ đích. **Chi phí:** rất cao.

**Prompt Codex**
```text
TASK T13 — SCENE 05 SYMBOLIC 63-TO-34 3D TRANSFORMATION ONLY.
Read AGENTS.md, handoff, S05 code and spec '63 → 34 — cao trào 3D'. Inspect only available Vietnam map reference assets relevant to proportions/material style. Construct symbolic raised 3D blocks that suggest Vietnam's S-shape; these are NOT official boundaries or an exact province-merger map. Show 63 distinct objects BEFORE, then animate actual mesh lift/reposition/convergence into 34 distinct AFTER objects, with a synchronized counter and gold edge lighting. Symbolically preserve 11 units and regroup 52 into 23; never label false geographic mergers.
Keep 'Stylized illustration' visible. Avoid flat dissolve; provide before/after stable states, replay, reduced-motion equivalent and no fabricated service outcome claims. Add a deterministic count assertion 63/34 and test remount/replay only. Do not implement two-tier diagram or unrelated scenes. Stop.
```

### T14 — Scene 5B: comparison/two-tier/meaning
**Đầu ra:** before/after compare, Party direction→Law→implementation, two-tier diagram, source-backed meaning. **AC:** 1/7/2025 và cấp tỉnh/cấp xã, kết thúc cấp huyện; không phát biểu lợi ích đo lường không có nguồn. **Chi phí:** vừa–cao.

**Prompt Codex**
```text
TASK T14 — COMPLETE SCENE 05 EXPLANATION BEATS.
Read AGENTS.md, handoff, S05 and its content/source section only. On presenter advance AFTER the 63→34 transformation, display short meaning beats: 'What changed?' 34 provincial-level units and two-tier local government; 'Why does it matter?' expected clearer coordination; 'What determines success?' implementation capacity, accountability, public access. Add diagram Province-level → Commune-level and note district-tier ending 1 July 2025; include the source-backed Party direction → National Assembly law/resolution → Government/local implementation chain.
Preserve the existing working 3D effect; add Before/After/Comparison and replay without duplicate geometry. Keep detailed dates/sources in notes or secondary detail, never present goal as measured impact. Test S05 beat progression/fallback, then stop.
```

**GATE 2B:** 63/34 mesh count đúng, nhìn ra chuyển biến, có tầng nội dung phân tích sau cao trào và mở file offline còn hoạt động.

### T15 — Scene 6: integrity / "NO EXCEPTIONS"
**Đầu ra:** SVG ngọn lửa, Enforce/Prevent/Disclose, nhãn policy principle. **AC:** không đánh đồng nguyên tắc với kết quả. **Chi phí:** thấp–vừa.

**Prompt Codex**
```text
TASK T15 — SCENE 06 POLICY PRINCIPLE.
Read AGENTS.md, handoff, S06 references and only Scene 6 content. Create controlled SVG flame/light composition with 'NO EXCEPTIONS' and the always legible qualifier 'Policy principle'. Reveal 'Enforce / Prevent / Disclose' as the presentation's explanatory labels, not a verbatim official three-pillar quotation. Keep source linkage for the Political Report and relevant asset/income disclosure mechanism in notes.
Avoid overstating uniform real-world enforcement or using fire as evidence. Add calm reduced-motion endpoint. Change S06-specific source/styles only and run targeted scene check. Stop.
```

### T16 — Scene 7: citizen journey, reused citizen
**Đầu ra:** same character S03; Submit → Process → Track → Receive, Help connected. **AC:** cyan paths; no false processing times; status clear. **Chi phí:** rất cao.

**Prompt Codex**
```text
TASK T16 — SCENE 07 PUBLIC SERVICE JOURNEY.
Read AGENTS.md, handoff, only S07 content and the reusable citizen asset from S03. Reuse EXACTLY the same simplified 3D character proportions/materials. Build presenter-stepped journey through Submit → Process → Track → Receive with cyan route segments illuminating one at a time; place a 'Help' desk connected to the main route so a resident with limited digital literacy is not left out. Camera follows smoothly and pauses at each step.
Keep navy scene depth, distinguish cyan digital channel from S03 green simplified routing. Refer to Hanoi as a policy/implementation example only to the degree the verified sources support; do not fabricate outcomes, processing times or legal workflow. Include 2D/reduced-motion equivalent. Test S07 and the shared asset across S03/S07. Stop.
```

### T17 — Scenes 8–10: PART 03, group duties, three horizons
**Đầu ra:** 8 passage; 9 three commitments and blank assignment fields; 10 distinct status for 2025–26 / 2030 / 2045. **AC:** không tự nhận công việc đã làm hay biến mục tiêu thành thành tích. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T17 — SCENES 08, 09 AND 10 ONLY.
Read AGENTS.md, handoff, content matrix S08–S10 and their source sections. Make S08 a restrained PART 03 transition. Make S09 show Learn deeply / Participate / Act with integrity plus Academic / Team / Presentation responsibilities; preserve four supplied names with editable unassigned roles and no claims that work was completed. Make S10 a cinematic spatial progression: 2025–26 verified changes/implementation underway where sourced, 2030 policy Goal, 2045 Long-term goal. Distinguish status visually and textually, and end with transition to quizzes.
Keep visible text minimal and sourced. Do not add new scenes/flags/standalone sources. Test forward/back and 16:9/portrait readability for these scenes only. Stop.
```

### T18 — Scenes 11–14: 4 quiz đúng nguyên văn
**Đầu ra:** 4× A–D, Submit/Reset, feedback + explanation separate beat, hand-vote presenter flow. **AC:** D/A/C/B, không auto-advance hoặc fake polling. **Chi phí:** thấp–vừa.

**Prompt Codex**
```text
TASK T18 — ALL FOUR QUIZ SCENES ONLY.
Read AGENTS.md, handoff and exact question/options/explanation paragraphs in docs/SPEC.md for Scenes 11–14. Implement four questions verbatim, A–D choices each, correct keys D / A / C / B, selectable answer, explicit Submit, wrong/correct feedback, Reset and a readable next explanation beat. Do NOT show result/explanation before submission or auto-advance. Preserve user selection when stepping within the same quiz unless Reset is pressed.
Use an accessible 2x2 answer grid on wider stage and vertical layout on small screens. Presenter may select the majority of raised hands; do not fake percentage, hand counting or network voting. Unit-test score keys, lock/unlock behavior, navigation focus and Reset. Change only quiz code/data/styles. Stop.
```

### T19 — Scene 15: end card + state cleanup
**Đầu ra:** only thank-you on audience screen, notes hold verbal conclusion. **AC:** đủ 15; không thêm quốc kỳ / nguồn / tagline. **Chi phí:** thấp.

**Prompt Codex**
```text
TASK T19 — FINAL THANK-YOU SCENE AND SCENE-INTEGRATION SANITY CHECK.
Read AGENTS.md, handoff, scene 15 brief, scene registry and notes data. Build Scene 15 as restrained cinematic near-black + subtle gold lighting with ONLY the visible audience text 'Thank you for listening'. Put the longer wrap-up spoken paragraph in private presenter notes, not the stage. No flag, source slide, tagline, credits or new scene.
Perform one targeted smoke traversal from scene 1 to 15 (using deterministic simulated next-beat calls), assert 15 scene IDs and no scene overflow. Report failures; fix only registry/navigation issues caused by integration. Stop.
```

**GATE 2C:** T09–T19 kết thúc phải xem được trọn 15 cảnh *và dừng giải thích ở các nhịp*, chưa cần editor nâng cao. Ưu tiên chuẩn nội dung hơn mật độ hiệu ứng.

---

## GIAI ĐOẠN 3 — ĐIỀU KHIỂN, ÂM THANH VÀ NOTES

### T20 — Sound effects + mute/volume
**Đầu ra:** Web Audio procedural paper/stamp/tick/whoosh/settle cues. **AC:** muted default, gesture unlock, cue cancelled, silent mode vẫn hiểu. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T20 — PROCEDURAL SOUND DESIGN ONLY.
Read AGENTS.md, handoff and current transition/scene event API. Add Web Audio-generated paper, stamp, clock/tick, restrained whoosh and resolution cues tied to meaningful beats (especially Scene 3 and Scene 5). Initial mute ON. Audio starts only after explicit user gesture; M toggles mute; provide volume control. Stop/cancel stale cues on scene change and when hidden; lower/silence audio while speaker explains. No continuous background soundtrack, remote audio or 32MB reference video.
Test first load silent, mute after activation, rapid navigation and audio-disabled mode. Ensure every visual meaning survives with no sound. Avoid touching scene visuals or editor. Stop.
```

### T21 — Presenter notes + timer + two-window synchronization
**Đầu ra:** N open separate presenter window, private notes, references, speaker script, time; fallback print/download script. **AC:** không lộ notes trên stage, một state/time source. **Chi phí:** cao.

**Prompt Codex**
```text
TASK T21 — PRESENTER NOTES WITH SAFE FALLBACK.
Read AGENTS.md, handoff, current presentation state, notes dataset and output build constraints. Implement N to open a private presenter window of the same self-contained HTML with synchronized current scene/beat, script, source IDs, transitions and one shared timekeeper with Pause/Resume. Design an explicit 'presenter' mode that never exposes notes on the audience stage. Use cross-window messaging supported in local file contexts where possible and report browser limitations accurately.
If popups or synchronization fail, provide locally downloadable/printable speaker script; do not auto-display notes on the audience view. Do not pretend operating-system monitor/extend selection can be automated. Test allowed flows and mark blocked cases. Stop.
```

---

## GIAI ĐOẠN 4 — EDITOR VÀ VÒNG LƯU FILE (LÀM SAU KHI ĐÃ TRÌNH CHIẾU TỐT)

### T22 — Editor MVP: select/edit text + transforms
**Đầu ra:** E editor tiếng Việt, select, text drag Shift, image drag, 7 slider supported/disabled appropriately. **AC:** changes reflect state model, not raw DOM only. **Chi phí:** vừa–cao.

**Prompt Codex**
```text
TASK T22 — MINIMUM VIETNAMESE EDITOR, NO EXPORT YET.
Read AGENTS.md, handoff, data/object schema and editor-related spec subsection only. Add E-toggle editor (closed at presentation start); Vietnamese panels for selecting text/image, editing text/color, dragging image and Shift+dragging text; correct conversion between stage coordinates and viewport. Show seven requested controls (scale, rotation, opacity, font size, background-removal sensitivity, parallax depth, camera perspective); disable irrelevant controls for the selected object rather than modifying unrelated state.
Edits MUST write to the serializable data model, not just ephemeral DOM. Include Add Text and Remove selection when safe. Avoid image processing, undo/redo/export in this task. Test one edit survives scene switches in the current session. Stop.
```

### T23 — Image replace + transparent background preview
**Đầu ra:** upload PNG/JPEG/WebP, local image embed, basic uniform-background flood fill, apply/cancel. **AC:** không gọi nhầm AI; original preserved, preview real. **Chi phí:** vừa–cao.

**Prompt Codex**
```text
TASK T23 — EDITOR IMAGE REPLACEMENT / SIMPLE BACKGROUND REMOVAL.
Read AGENTS.md, handoff, current editor image object model and only related spec subsection. Add Replace Image (PNG/JPEG/WebP) preserving aspect ratio and embedding bytes via data URL or registered asset payload for offline export. Add genuine preview Before/After for simple approximately uniform backgrounds using edge flood fill + color distance and sensitivity; support Apply/Cancel, preserve original asset for revert. Do not claim AI segmentation or success on textured backgrounds.
Do not modify 3D mesh topology; image replacement is for image objects only. Add a targeted test verifying changed image survives object serialize/deserialize. Stop.
```

### T24 — Undo/redo transaction model
**Đầu ra:** transaction stack max 100, one drag/slider session→one undo; no binary copy every snapshot. **AC:** text/image/color/transform works both directions. **Chi phí:** vừa.

**Prompt Codex**
```text
TASK T24 — EDITOR UNDO/REDO TRANSACTIONS ONLY.
Read AGENTS.md, handoff, existing editor model/commands. Implement max-100 transaction-based undo/redo across text, image asset reference, transforms, color, object creation/deletion and background processing. Coalesce a single drag or slider gesture into one history entry; do NOT copy every image's binary payload into each history snapshot. Bind visible Undo/Redo controls with correct disabled states.
Targeted tests: edit text→undo→redo; drag→one undo; image replace→undo; new edit clears redo branch. No HTML export in this task. Stop.
```

### T25 — Export current edits into self-contained offline HTML
**Đầu ra:** Save File downloads a newly generated complete HTML; when reopened quiz reset, editor closed, modifications survive. **AC:** round-trip passes. **Chi phí:** rất cao → reasoning mạnh.

**Prompt Codex**
```text
TASK T25 — SELF-CONTAINED HTML EXPORT ROUND-TRIP.
Read AGENTS.md, handoff, current build pipeline, serializable presentation data and editor state only. Implement 'Lưu file' to produce a complete self-contained HTML with latest edits/assets, safely serialized and escaped (including </script> hazards), retaining JS/CSS/Three.js licenses and no remote imports/fetch/blob URLs/source-machine paths. On reopen, start in presentation mode with unsubmitted quizzes; preserve text/images/transforms/camera/parallax settings but not temporary editor UI/undo history.
Create a targeted end-to-end round-trip test: edit text, replace image, save HTML, reopen file:// with network disabled, verify modified data, quiz and navigation. If browser automation unavailable, supply manual steps and mark UNVERIFIED. Do not overhaul unrelated scenes. Stop.
```

### T26 — Validator + fallback resilience
**Đầu ra:** button Kiểm tra with real checks, WebGL loss, missing assets, reduced motion, popup blocked. **AC:** validator detects known injected faults; no false success claims. **Chi phí:** vừa–cao.

**Prompt Codex**
```text
TASK T26 — VALIDATOR AND TARGETED RESILIENCE.
Read AGENTS.md, handoff, current data validator/editor/fallback code only. Implement 'Kiểm tra' with deterministic checks for 15-scene integrity, missing/invalid assets, invisible or out-of-bounds objects, broken quiz answer references, unresolved source links/status, external runtime dependencies and recorded runtime failures. Separate ERROR vs WARNING; do not claim automated aesthetic/academic fact-checking.
Inject one intentionally oversized text object and one broken image in a test fixture; assert detection. Verify reduced motion, forced 2D fallback, WebGL context loss and popup-blocked notes have user-facing alternatives without removing content. Run targeted tests only. Stop.
```

**GATE 3:** Editor hoạt động thật; exported HTML mở lại offline và giữ thay đổi. Nếu fail, sửa T25 trước, đừng nâng animation lúc này.

---

## GIAI ĐOẠN 5 — ĐÁNH GIÁ CUỐI VÀ BÀN GIAO

### T27 — Full QA, performance, academic check, final release
**Đầu ra:** QA matrix + final one-file HTML + truthful handoff. **AC:** hoàn thành checklist; không nói đã kiểm tra thứ chưa thử. **Chi phí:** cao nhưng chỉ làm sau tất cả các gates.

**Prompt Codex**
```text
TASK T27 — FINAL INTEGRATION QA AND RELEASE; NO NEW FEATURES.
Read AGENTS.md, handoff, existing QA checklist and only files tied to failing checks. Build the complete single-file HTML and perform a bounded smoke pass: exactly 15 scenes and all beats; Scene 3 before/reform/after and same citizen in Scene 7; Scene 5 63→34 count/two tiers; D/A/C/B quizzes with explanations; time/notes safety; mute first; editor/undo/redo; exported-HTML reopen offline; file:// and no network runtime dependencies; reduced motion, forced 2D and 1366x768/1920x1080/portrait layouts where testing tools allow.
Fix only concrete reproducible P0/P1 defects. Do not add unrelated effects or rewrite layouts. Record real OS/browser/device, tests passed/failed/unverified, known limitations, final file size and license notices in docs/QA_REPORT.md. Keep original source intact. Place approved output in dist/reforming_vietnam_political_system_3d.html (copy to D:/Downloads/CPV only if writable/explicitly intended). Update handoff and stop.
```

---

## Prompt chung tối ưu quota cho MỌI lượt sửa lỗi (dán kèm bug cụ thể)

```text
BUG FIX ONLY — NO REDESIGN.
Observed behavior: [paste short reproducible symptom].
Expected behavior: [expected state].
Reproduction steps: [3–5 steps].
Console error/log excerpt: [only relevant lines].
Likely affected file(s): [paths or unknown].
Read AGENTS.md, HANDOFF.md and the smallest related files; locate root cause before editing. Make the minimum possible patch. Run ONE targeted reproduction check. Do not refactor unrelated files, rebuild all scenes or run the full test suite. Report the exact fix and observed result in <=8 lines.
```

## Prompt cứu quota ngay khi còn ít

```text
STOP NEW FEATURE WORK. Preserve the current source as-is. Perform a minimal handoff only: identify last implemented task, actual changed files, exact test statuses, known failures, missing inputs and the single next task. Update docs/HANDOFF.md (<=80 lines) and docs/TASK_STATUS.md. No full repo scan, no dependency install, no full build, no new functionality. Print a <=8-line handoff summary and stop.
```

## Checklist nghiệm thu của người dùng (không cần Codex suy nghĩ lại)
- [ ] Có bản sao nguồn ban đầu; Git checkpoint theo từng Gate.
- [ ] GATE 0: content/source + 15-scene data schema/4 quiz.
- [ ] GATE 1: stage + state engine + renderer/fallback + **offline smoke via file://**.
- [ ] GATE 2A: S03 visual before→reform→after + replay.
- [ ] GATE 2B: S05 63 mesh→34 mesh, meaningful 2-tier explanation.
- [ ] GATE 2C: trọn 15 scenes, 4 quiz, không thừa scene.
- [ ] GATE 3: editor and Save File round-trip offline.
- [ ] RELEASE: QA report có PASS/FAIL/UNVERIFIED; không có asset runtime ngoài HTML.

## Ưu tiên nếu quota tiếp tục thiếu
- **Must-have:** T00–T08, T09–T19, T18 quiz, audio M/mute, presenter's readable script/notes fallback, T25 offline release, T27 QA.
- **Defer complexity before content:** T23 flood-fill advanced, sophisticated shadows, camera-perspective editor, deep validator heuristics, popup syncing across browsers. **Không bỏ** các tính năng đã chốt mà không ghi rõ tính năng hoãn và xin quyết định từ người dùng trước bản release.
- **Nguyên tắc:** không tối ưu độ hoành tráng bằng cách hy sinh luận điểm hay tính ổn định. Nếu có thời gian dư mới nâng polish.
