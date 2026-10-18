# BÁO CÁO NGHIỆM THU — FINAL CINEMATIC INTEGRATION + THREEUI REFORM ARCHIVE

Ngày: 2026-10-18 · File chính: `reforming_monday_prensent.html` (bản trùng tên `reforming_vietnam_final.html`) · Build: `node build/assemble-final.mjs`

> Trạng thái trung thực: đã tích hợp, chạy trong Chromium thật với WebGL2 (SwiftShader, CPU) và kiểm thử tự động. Môi trường không có GPU: mỗi frame của Scene 2/3/6 mất 2–6 giây, nên **không thể quay/xác nhận chuyển động thời gian thực**; video bàn giao là *frame-stepped* (seek tiến độ chuyển cảnh), không phải playback 60 fps. Đánh giá thẩm mỹ cuối cùng vẫn cần duyệt trên máy có GPU/máy chiếu.

## 1. Kiểm toán & nguồn của từng Scene

| Thành phần | Lấy từ | Lý do |
|---|---|---|
| Nền tảng HTML, world engine, camera rig, navigation, input, numbers | `other ai/reforming_vietnam_scene6_hall_v11.html` | Bản đầy đủ nhất; là superset của v10 (đã chứa maze 3D v10) + `CPVHall` |
| Scene 1 — Living Flag (particle wordmark trên bề mặt vải, cùng `clothSample`) | `build/cinematic-flag.mjs`, `cinematic-wordmark.mjs`, `createFlagHero` trong `cinematic-registration.mjs` | Bản mới nhất (TASK_STATUS 2026-10-18); v11 còn bản cũ không có wordmark |
| Scene 2 — Political System (sculptures + people rig 3D) | v11 `CPVSystem`/`CPVSystemSculptures`/`CPVPeopleRig` | Bản 3D thật; bản build dùng ảnh nền hall-plate |
| Scene 3 — Procedural Maze 3D (6 beat) | v11 (= v10) `CPVMaze` | Bản 3D thay cho bản 2.5D cũ |
| Scene 4 — Historical Foundations → THE REFORM ARCHIVE | **Mới** (`build/final/reform-archive.mjs`) | Theo prompt ThreeUI |
| Scene 5 — 63 → 34 | v11 `CPVMap` (dữ liệu GIS tổng quát hoá, nguồn ghi trong module) | Giữ nguyên trạng thái đã xác minh |
| Scene 6 — Hall of Accountability | v11 `CPVHall` (+ view `integrity` của v11) | Bản đại sảnh tốt nhất |
| Scene 7 — The system can’t stay still (documentary, GSAP Flip) | `build/cinematic-pressure.mjs/.css` + `build/content.json` | Nội dung mới nhất được duyệt (Dispatch 111, CD1112025); module có sẵn trong build nhưng chưa từng được đóng gói — nay đã nhúng GSAP + Flip |
| Scene 8 — What would you do? | **Mới** (views-patch) | Đã loại bỏ hoàn toàn roster/tên thành viên |
| Scene 9 — Responsibilities | view mới (3 nhánh nối tiếp Scene 8), nội dung giữ nguyên | |
| Scene 10–15 | v11 (+ UI motion quiz trong `final.css`) | Đáp án/logic quiz không đổi |
| Runtime/Views | `build/cinematic-runtime.mjs`, `cinematic-scenes.mjs` (có hook Scene 7) | |

Nội dung học thuật: `build/content.json` (chỉ Scene 7 khác v11; thêm nguồn `CD1112025`). Không sửa số liệu/trích dẫn khác.
Bảo toàn: không file gốc nào bị sửa/xoá; mọi file mới nằm trong `build/final/`, `tests/`, `docs/`, `qa-evidence/` và hai HTML đầu ra.

## 2. Module đã hợp nhất / mới
- **CPVTransitionDirector** (trong `world-engine`): lifecycle `prepare → enter → animate → hold → exit → cleanup`. Scene nguồn *không bị tháo* khi chuyển: root được chuyển sang một `THREE.Scene` hand-off riêng (ánh sáng/fog clone, camera rig riêng → không ép chung toạ độ), tiếp tục `update` + render 3D thật vào HDR render target, với camera exit move (dolly/orbit/crane). Scene đích kích hoạt bình thường; camera nhận lớp enter move cộng thêm, giảm dần về đúng pose của module (không reset, không jump, chỉ một bên điều khiển camera trong mỗi frame). Mask compositing theo từng cặp scene. Ngắt giữa chừng: hand-off mới bắt đầu từ *đúng frame hiệu dụng* đang hiển thị. Beat trong cùng scene: pose blend 1.15 s nên module dùng `camera.reset()` cũng không còn nhảy hình. Hỗ trợ tab ẩn, reduced-motion, mất context, resize, destroy. API test: `CPVApp.world.director.{getState,seek,pauseClock,finish}`.
  - **Trung thực kỹ thuật:** đây là *compositing thời gian thực của hai cảnh 3D đang sống* với chuyển động camera thật ở cả hai phía — không phải một cú máy vật lý duy nhất trong cùng không gian.
- **CPVModelFormation** (`build/final/model-formation.mjs`): trường hình thành trong object-space (origin tuỳ chọn, metric dị hướng theo hình học, biên nhiễu), patch `onBeforeCompile` trên bản clone vật liệu (giữ UV/normal/map/PBR, skinning qua `transformed`), iso-contour bằng `fwidth` (học từ cơ chế scan/iso của DarkSoulsHoloCard), overlay cạnh cấu trúc từ `EdgesGeometry` dẫn trước bề mặt và tự rút trước 100%, khôi phục vật liệu gốc ở 100% (không popping). Mode `geometry-aware` và `procedural` (drawRange theo topology) chung một API: `setProgress/seek/play/pause/reverse/replay/finish/update(dt)/dispose`. Không RAF riêng, không renderer thứ hai.
- **THE REFORM ARCHIVE** (Scene 4): 3 tập sách Three.js (bìa dày bo cạnh Extrude + bevel, gáy hình khối, page block có texture mép giấy, dải vàng kim loại, ruy băng, MeshPhysical sheen/clearcoat, mạ vàng bằng metalness/roughness/bump mask), mỗi cuốn hình thành bằng CPVModelFormation; quỹ đạo ảnh Canvas 2D port từ GalleryHeading “Matte Rise” (`rising-diagonal`: mặt phẳng vòng nghiêng, chiếu phối cảnh, tile affine bo góc, sắp xếp theo độ sâu xen kẽ headline, spring); chọn sách là tuỳ chọn (raycast), quỹ đạo xoay về các ảnh liên quan, ảnh không liên quan ra ngoại vi; nút dẫn tới Scene 3/5/9; Next/Previous không bị ảnh hưởng. Timeline 1986 · 2017 · 2025 giữ nguyên (beat → tập: I, II, II).

## 3. ThreeUI — nguồn đã kiểm tra
- `@designcodeio/threeui@1.2.0` (MIT, © Meng To) đã cài. Export thực tế: `BestsellersBookShowcase`, `GalleryHeading` có; **`DarkSoulsHoloCard` không được export trong 1.2.0** → nghiên cứu từ source bundle chính thức.
- Source bundle `https://threeui.com/source-code/bestsellers-book-showcase.json` và `dark-souls-holo-card.json`: SHA-256 của từng file code trong bundle khớp trường `sha256`; canonical HTML được bundle ghi `7c1ed1ca…568138` và `4373734e…09d` (đúng như prompt). Bản HTML đang phục vụ tại URL công khai có hash khác (55 KB / 421 KB so với 3.5 MB / 13.2 MB canonical, asset tách rời) → **không xác minh được canonical file bằng hash từ URL công khai**.
- BestsellersBookShowcase & DarkSoulsHoloCard thực chất là React wrapper nạp một tài liệu HTML độc lập (iframe/document); GalleryHeading là Canvas 2D (`getContext('2d')`, `requestAnimationFrame`) — không dùng mesh Three.js. Không có React runtime trong HTML cuối.
- Tái sử dụng: mô hình vòng quỹ đạo GalleryHeading (công thức U/V/AXIS, `project`, `drawTile`, depth-sort với headline, spring); ngôn ngữ editorial/sách của showcase; kỹ thuật scan-field + iso-contour của holo card (tái hiện, không sao chép nhân vật/thẻ). Phát triển mới: toàn bộ sách 3D, ModelFormation, tích hợp Scene 4, nội dung 3 tập. Không còn nội dung “Field Manuals”.

## 4. Chuyển cảnh đã thiết kế (mask + camera)
1→2 iris từ biểu tượng, exit pull-back/enter từ cận cảnh banner lùi ra · 2→3 portal/lối đi · 3→4 paper reveal xé giấy · 4→5 khung tài liệu mở thành bản đồ · 5→6 đường ranh giới → đường sáng · 6→7 khung kính → ô tư liệu · 7→8 khung người dân (ô lớn cuối Scene 7) mở rộng thành Scene 8 · 8→9 ba nhánh · 9→10 đường chân trời thời gian · 10→11 và 11→12→13→14 UI sweep thống nhất · 14→15 iris trang nghiêm · đi ngược dùng cấu hình đảo chiều · nhảy cóc dùng paper reveal ngắn.

## 5. Kết quả kiểm thử
Build kiểm thử cuối: `reforming_monday_prensent.html` md5 `35b103dad006f6756e2883d60252df75`. Môi trường: Chromium 154 headless, `--use-angle=swiftshader` (WebGL2 trên CPU), 1600×900.

**Tổng hợp:** 33 PASS · 6 FAIL · 21 NOT TESTED (hết thời gian chờ) · 2 CAPTURED (chỉ chụp ảnh để duyệt bằng mắt, không tính là PASS). Các FAIL ở build trước đã được sửa và kiểm lại ở dòng tương ứng của build sau (xem cột Nguồn).

| Nguồn | Kết quả | Kiểm tra | Chi tiết |
|---|---|---|---|
| build 1 (eb19d331) | **PASS** | S1 living flag renders with particle wordmark (WebGL2) | {'mode': 'webgl', 'module': {'beat': 0, 'time': 0.4666000000000003, 'particlesOnly': True, 'particles': 500000, 'disposed': False}, 'ms': 6807} |
| build 1 (eb19d331) | **PASS** | S1 title is editable data (DOM heading = data heading) | {'dom': 'Reforming Vietnam’s political system', 'data': 'REFORMING VIETNAM’S POLITICAL SYSTEM', 'ms': 3} |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 1→2 sampled 0/25/50/75/100 (live, camera moving, clean end) | TIMEOUT after 150001 ms |
| build 1 (eb19d331) | **FAIL** | S2 beat changes move the camera through intermediate poses | {'a': [0.35, 5.35, 20.25], 'mid': [0.35, 5.35, 20.25], 'b': [0.35, 5.35, 20.25], 'ms': 118408} |
| build 1 (eb19d331) | **PASS** | S2 HTML labels follow projected model anchors | {'ms': 2} |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 2→3 sampled 0/50/100 | TIMEOUT after 150000 ms |
| build 1 (eb19d331) | **NOT TESTED** | S3 maze: before (beat 0) vs after reform (beat 5) states differ | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 3→4 sampled 0/50/100 | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | S4 ModelFormation seek 0/25/50/75/100 on archive volumes | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | S4 orbit gallery (12 slots) attached; book selection optional, beat unchanged | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | S4 beats map to volumes I, II, II and keep 1986 · 2017 · 2025 timeline | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | S6 hall: ENFORCE / PREVENT / DISCLOSE states and camera differ | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 5→6 sampled 0/50/100 | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 6→7 sampled 0/50/100 | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | S7 pressure documentary: 4 beats, persistent frames re-laid out (Flip) | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | Hand-off 7→8 sampled 0/50/100 and Scene 8 has no roster | run stopped by operator before this step completed |
| build 1 (eb19d331) | **NOT TESTED** | Audio: Sound button toggles mute/unmute | run stopped by operator before this step completed |
| build 2 | **PASS** | S1 living flag renders with particle wordmark (WebGL2) | {'mode': 'webgl', 'module': {'beat': 0, 'time': 0.4666000000000003, 'particlesOnly': True, 'particles': 500000, 'disposed': False}, 'ms': 7400} |
| build 2 | **PASS** | S1 title is editable data (DOM heading = data heading) | {'dom': 'Reforming Vietnam’s political system', 'data': 'REFORMING VIETNAM’S POLITICAL SYSTEM', 'ms': 3} |
| build 2 | **FAIL** | Hand-off 1→2 sampled 0/25/50/75/100 (live, camera moving, clean end) | {'live': True, 'cameraMovesBetweenSamples': False, 'end': {'scene': 2, 'beat': 0, 'active': 2, 'tr': False, 'dom': '2'}, 'phases': ['animate', 'animate', 'animate', 'animate', 'idle'], 'ms': 237073} |
| build 2 | **FAIL** | S2 beat changes move the camera through intermediate poses | {'a': [0.15, 5.7, 16.4], 'mid': [0.15, 5.7, 16.4], 'b': [0.633, 5.789, 16.846], 'ms': 156405} |
| build 2 | **PASS** | S2 HTML labels follow projected model anchors | {'ms': 2} |
| build 2 | **NOT TESTED** | Hand-off 2→3 sampled 0/50/100 | TIMEOUT after 240001 ms |
| build 2 | **FAIL** | S3 maze: before (beat 0) vs after reform (beat 5) states differ | {'before': '{}', 'after': '{}', 'ms': 191190} |
| build 2 | **PASS** | Hand-off 3→4 sampled 0/50/100 | {'live': True, 'cameraMovesBetweenSamples': True, 'end': {'scene': 4, 'beat': 0, 'active': 4, 'tr': False, 'dom': '4'}, 'phases': ['animate', 'animate', 'idle'], 'ms': 121419} |
| build 2 | **PASS** | S4 ModelFormation seek 0/25/50/75/100 on archive volumes | {'formation': [{'meshes': 10, 'wires': 10, 'restored': True}, {'meshes': 10, 'wires': 10, 'restored': True}, {'meshes': 10, 'wires': 10, 'restored': True}], 'ms': 47287} |
| build 2 | **PASS** | S4 orbit gallery (12 slots) attached; book selection optional, beat unchanged | {'orbit': {'attached': True, 'spin': 1.1126648514389077, 'focus': 0, 'paused': False, 'reveal': 1, 'tiles': 12, 'imagesReady': 8}, 'selectedBefore': None, 'selectedAfter': 0, 'card': 'WHY REFORM?', 'ms': 13800} |
| build 2 | **PASS** | S4 beats map to volumes I, II, II and keep 1986 · 2017 · 2025 timeline | {'0': {'vol': '0', 'year': '1986', 'card': 'WHY REFORM?'}, '1': {'vol': '1', 'year': '2017', 'card': 'REFORM IN ACTION'}, '2': {'vol': '1', 'year': '2025', 'card': 'REFORM IN ACTION'}, 'ms': 35992} |
| build 2 | **NOT TESTED** | S6 hall: ENFORCE / PREVENT / DISCLOSE states and camera differ | TIMEOUT after 240001 ms |
| build 2 | **NOT TESTED** | Hand-off 5→6 sampled 0/50/100 | run stopped by operator before this step completed |
| build 2 | **NOT TESTED** | Hand-off 6→7 sampled 0/50/100 | run stopped by operator before this step completed |
| build 2 | **NOT TESTED** | S7 pressure documentary: 4 beats, persistent frames re-laid out (Flip) | run stopped by operator before this step completed |
| build 2 | **NOT TESTED** | Hand-off 7→8 sampled 0/50/100 and Scene 8 has no roster | run stopped by operator before this step completed |
| build 2 | **NOT TESTED** | Audio: Sound button toggles mute/unmute | run stopped by operator before this step completed |
| build 3 | **NOT TESTED** | S2b camera path sampled over frames (effective pose, beat 0→1→2) | TIMEOUT after 240001 ms |
| build 3 | **CAPTURED** | S4b archive layout after fix (formation complete, beats 0 and 1) | {'note': 'visual review screenshot', 'ms': 62099} |
| build 3 | **FAIL** | S6 hall: ENFORCE / PREVENT / DISCLOSE states and camera differ | {'camsDiffer': False, 'statesDiffer': True, 's': [{'cam': [0, 3.6, 0], 'st': '{"name":"ENFORCE","line":1,"hue":1,"ring":0.3,"node":0.35,"link":0,"reveal":0,"exposure":1,"shaft":0.6,"haze":1,"key":2.4}'}, {'cam': [0, 3.6, 0], 'st': |
| build 3 | **PASS** | S7 pressure documentary: 4 beats, persistent frames re-laid out (Flip) | {'flipLib': True, 'st': [{'beat': 0, 'phase': 'opening', 'frames': 8, 'first': [610, 155, 590]}, {'beat': 1, 'phase': 'pressure', 'frames': 8, 'first': [719, 170, 396]}, {'beat': 2, 'phase': 'restructure', 'frames': 8, 'first': [1 |
| build 3 | **PASS** | Hand-off 7→8 sampled 0/50/100 and Scene 8 has no roster | {'live': True, 'cameraMovesBetweenSamples': True, 'end': {'scene': 8, 'beat': 0, 'active': 8, 'tr': False, 'dom': '8'}, 'phases': ['animate', 'animate', 'idle'], 'noRoster': True, 'ms': 21253} |
| build 3 | **PASS** | Audio: Sound button toggles mute/unmute | {'a': 'Sound off', 'b': 'Sound on', 'c': 'Sound off', 'audio': {'muted': True, 'activeNodes': 0}, 'ms': 1886} |
| build 3 | **PASS** | No page/console errors during targeted run |  |
| build 3 | **PASS** | No presentation runtime errors (CPVApp.getErrors) | [] |
| final build | **CAPTURED** | S4b archive layout after fix (formation complete, beats 0 and 1) | {'note': 'visual review screenshot', 'ms': 31030} |
| final build | **PASS** | S6c hall beat change moves the camera (ENFORCE → PREVENT, intermediate pose) | {'a': [0, 3.5, -5], 'mid': [0.05, 3.512, -4.981], 'b': [0.192, 3.544, -4.926], 'state': 'PREVENT', 'ms': 78091} |
| final build | **PASS** | No page/console errors during targeted run |  |
| final build | **PASS** | No presentation runtime errors (CPVApp.getErrors) | [] |
| final build | **PASS** | S2c beat 0→1 camera moves through an intermediate pose (light sampling) | {'a': [0.15, 5.7, 16.4], 'mid': [0.248, 5.718, 16.491], 'b': [0.514, 5.767, 16.736], 'goal': [3.4, 6.3, 19.4], 'ms': 96767} |
| final build | **PASS** | No page/console errors during targeted run |  |
| final build | **PASS** | No presentation runtime errors (CPVApp.getErrors) | [] |
| features run (build eb19d331) | **PASS** | webgl2 renderer active (not fallback) webgl |  |
| features run (build eb19d331) | **PASS** | 15 scenes / 37 beats in data {"scenes":15,"beats":37,"s8":false} |  |
| features run (build eb19d331) | **PASS** | quiz select + submit + explanation {"submitted":true,"explanation":true,"result":"Correct answer: D."} |  |
| features run (build eb19d331) | **FAIL** | audio mute/unmute toggles Sound off → Sound off |  |
| features run (build eb19d331) | **PASS** | Export HTML produces a self-contained document {"ok":true,"len":5878642,"type":"string"} |  |
| features run (build eb19d331) | **PASS** | reduced-motion: no animated hand-off, immediate defined state "idle" |  |
| features run (build eb19d331) | **PASS** | portrait 390×844 Scene 1 without horizontal overflow overflow 0 |  |
| features run (build eb19d331) | **PASS** | portrait 390×844 Scene 4 without horizontal overflow overflow 0 |  |
| features run (build eb19d331) | **PASS** | portrait 390×844 Scene 7 without horizontal overflow overflow 0 |  |
| features run (build eb19d331) | **PASS** | portrait 390×844 Scene 8 without horizontal overflow overflow 0 |  |
| features run (build eb19d331) | **PASS** | no page/console errors |  |
| features run (build eb19d331) | **PASS** | no presentation runtime errors [] |  |
| pixel analysis (r4 captures) | **PASS** | S3 maze before/after reform differ (floor red→gold) | beat0 red px 713 / gold 3 → beat5 red 83 / gold 4499; mean abs diff 24.5 |

**Beat đã chụp màn hình (render scale 0.5 cho QA CPU, layout 1600×900):** 18/37 — beat-s01-b0, beat-s01-b1, beat-s02-b0, beat-s02-b1, beat-s02-b2, beat-s03-b0, beat-s03-b1, beat-s03-b2, beat-s03-b3, beat-s03-b4, beat-s03-b5, beat-s04-b0, beat-s04-b1, beat-s04-b2, beat-s05-b0, beat-s05-b1, beat-s05-b2, beat-s05-b3.
**Chưa kiểm thử (NOT TESTED):** ảnh từng beat của Scene 5–15 còn lại; chuỗi điều hướng 3→2→1, 5→6→7, 7→8→9, nhảy 1→10 và 10→2, Next/Previous liên tục, resize khi camera đang chạy, replay (chỉ 1→2→3 đã PASS trong lần chạy trước); hand-off 8→9, 9→10, 10→11, 11→12, 14→15; mở lại file Export offline trong trình duyệt; mobile ngang (landscape); playback thời gian thực/FPS trên GPU.

Ghi chú: “features run” chạy trên build eb19d331 (bản bàn giao đầu tiên). Hai bản vá sau đó (camera Scene 2, bán kính iris/easing/DOM theo tiến độ) không đụng tới quiz, export, reduced-motion, layout portrait.

## 6. Chưa đạt / hạn chế (nêu rõ)
- **Đã sửa trong lượt này và kiểm lại trên build cuối:** camera theo beat của Scene 2 (Party → State/Front/organisations → People, `moveTo` 2.4 s; S2c PASS), camera + nội suy trạng thái theo beat của Scene 6 (ENFORCE dolly / PREVENT truck-orbit / DISCLOSE dolly thấp về lõi kính; S6c PASS), bố cục Scene 4 (sách không còn bị chữ che; xem `qa-evidence/final-build/s4-layout-b0.jpg`), bán kính iris + easing của hand-off, DOM xuất hiện theo tiến độ director (không theo đồng hồ CSS).
- **FAIL còn lại cần đọc đúng:** (1) phím tắt **M** không bật âm thanh trong bài test vì focus đang ở nút quiz (runtime bỏ qua phím tắt trong form control theo thiết kế); nút *Sound* PASS. (2) “Hand-off 1→2 … camera moving” FAIL ở build 2 là **lỗi của bài test** (đo pose module thay vì pose hiệu dụng); đã sửa probe và hand-off 3→4, 7→8 PASS với pose hiệu dụng, nhưng 1→2 **chưa được chạy lại** bằng probe mới. (3) Các FAIL ở build 1/2/3 đều có dòng kiểm lại tương ứng (S2c, S6c, pixel analysis S3) trừ mục (2).
- Không xác minh được hiệu năng/độ mượt thời gian thực trên GPU thật hoặc máy chiếu; mọi video là frame-stepped (SwiftShader CPU: 2–30 s/frame ở Scene 2/3/6).
- **Chưa làm lại** theo tiêu chí chi tiết của master prompt: Scene 3 (đồng hồ/bảng trạng thái đã có sẵn, không chỉnh), Scene 5 (camera/ánh sáng khi morph), Scene 10 (camera đi dọc timeline), Scene 15 (hạt sáng lấy lại từ Scene 1); các scene này giữ bản tốt nhất hiện có, chỉ được hưởng hand-off + beat-camera blend.
- Scene 1→2 “match morph”: là iris compositing tại vùng biểu tượng + chuyển động camera hai phía, **không phải morph hạt → vật liệu** của cùng một biểu tượng.
- Scene 4: 12 image slot dùng minh hoạ SVG tự vẽ có nhãn “IMAGE SLOT · SOURCE PENDING”; bìa sách là minh hoạ, không phải văn kiện. Cần ảnh tư liệu thật có nguồn/giấy phép. Beat → tập: I, II, II (Tập III mở bằng cách chọn sách, dẫn tới Scene 9).
- Scene 8: ảnh dùng minh hoạ SVG placeholder — cần thay ảnh thật.
- ModelFormation chưa thử với GLB/GLTF có skeleton (chưa có model mẫu trong dự án); mới áp dụng cho 3 cuốn sách Scene 4 (không tự động gắn cho scene khác, theo yêu cầu).
- Canonical ThreeUI HTML không xác minh được bằng hash từ URL công khai (xem mục 3).
- Test hook chỉ dùng khi QA: `CPVApp.world.setRenderScale()` (mặc định 1, không đổi chất lượng trình chiếu), `director.pauseClock/seek`, `window.__cpvArchive`.

## 6b. Ảnh tư liệu cần bổ sung
Scene 4: RA-01 … RA-12 (quầy dịch vụ công, người dân cần hỗ trợ, đô thị, kinh tế, phối hợp liên cơ quan, dịch vụ công số, trách nhiệm giải trình, bộ máy sau sắp xếp, người dân trung tâm, làm việc nhóm, hỗ trợ cộng đồng, học tập có kiểm chứng). Scene 7: 8 khung (manifest `build/assets/scene7/manifest.json`). Scene 8: S8-HERO, S8-01…03. Scene 6: 8 khung ảnh tư liệu của Hall (texture có thể thay).

## 7. Giấy phép tài nguyên
Three.js (MIT, nhúng), GSAP + Flip (GSAP standard license, nhúng cục bộ — giấy phép trong `build/vendor/GSAP-LICENSE.txt`), ThreeUI (MIT; chỉ port kỹ thuật/cấu trúc, không nhúng asset ThreeUI). Không dùng font/CDN từ xa.
