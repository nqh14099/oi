const fs=require('fs');
const rows=[
 ['1','Opening flag','Giữ cờ hạt và biểu tượng đã duyệt; cân lại tỷ lệ tiêu đề, tăng cỡ dòng môn học.','Giữ','Cân chữ','Rõ hơn','Giữ hạt','Giữ glow','Giữ','Theo cảnh 1','Chờ duyệt'],
 ['2','Political system','Đưa tiêu đề lên trên, tăng nhãn, giảm các đường nền; màn hình dọc đưa sơ đồ vào luồng đọc, bỏ vùng canvas trống.','Rõ vai trò','Phân tầng','Tăng nhãn','Giữ sơ đồ','Tiết chế','Giữ','Đồng nhất','Chờ duyệt'],
 ['3','Procedural maze','Giữ mô hình trước/sau và nhân vật; tăng nhãn trạm, sửa camera dọc quá xa; chỉnh câu nhấn mạnh trách nhiệm.','Giữ nhân quả','Giữ','Tăng nhãn','Giữ mê cung','Giữ','Đỏ→xanh','Đồng nhất','Chờ duyệt'],
 ['4','History','Thay vòm/bậc thang che chữ bằng bộ tài liệu 3D minh họa; mỗi mốc đưa một lớp tài liệu ra trước. Không phải bản sao văn kiện.','Rõ mốc','Tách vùng đọc','Tăng nhãn','Folio mới','Studio','Vang/ngà','Đồng nhất','Chờ duyệt'],
 ['5','63 to 34','Giữ toàn bộ polygon và nhóm gộp; làm mặt bên bớt đen, tăng chú giải, đổi nhãn VIỆT NAM thành VIETNAM theo ngôn ngữ trình chiếu.','Giữ','Cân số/chú giải','Tăng nhãn','Giữ dữ liệu','Giữ','Giữ','Đồng nhất','Giới hạn địa lý'],
 ['6','Integrity','Bỏ SVG lửa tách rời và đĩa đen; dựng bát đồng, lửa cách điệu 3D và than sáng trong cùng không gian. Nhãn không còn nằm trên đế.','Giữ nguyên tắc','Tách chủ thể','Tăng chữ','Thay lửa/đế','Studio','Vàng ấm','Đồng nhất','Chờ duyệt ẩn dụ'],
 ['7','Public services','Giảm tỷ lệ nhân vật trong cảnh, tăng đạo cụ, đưa nhãn lên cao; giữ Help kết nối và cùng nhân vật. Giữ animation chuyển hồ sơ.','Rõ quy trình','Nhãn độc lập','Tăng chữ','Chỉnh tỷ lệ','Studio','Cyan có nghĩa','Đồng nhất','Chờ duyệt'],
 ['8','Chapter divider','Bỏ vòng trang trí phía sau tên; dùng khoảng nghỉ chữ và danh sách thành viên. Không gán công việc chưa xác nhận.','Rõ trách nhiệm','Tối giản','Cân tên/chữ','Bỏ vòng','Tiết chế','Giữ','Đồng nhất','Chờ duyệt'],
 ['9','Responsibilities','Thay vòng và lá phẳng bằng sách mở, bảng phân công, tài liệu với kính kiểm chứng theo từng beat. Viết lại tiêu đề thành hành động.','Cụ thể hơn','Tách chữ/vật','Rõ hành động','Ba vật thể mới','Studio','Vang/ngà','Đồng nhất','Chờ duyệt'],
 ['10','Future vision','Giữ ba không gian thời gian và nhãn Implementation/Goal; chỉnh độ dày cấu trúc, phản xạ studio, tăng tiêu đề và nhãn.','Giữ phân biệt','Giữ chiều sâu','Tăng chữ','Chỉnh vật liệu','Studio','Giữ','Đồng nhất','Ẩn dụ cần lời dẫn'],
 ['11','Quiz: 1986','Bỏ cột trái lớn; câu hỏi và bốn lựa chọn trải rộng, tăng cỡ chữ; đáp án D và giải thích nguyên vẹn.','Giữ','Rộng dễ đọc','Tăng chữ','Không cần 3D','Tĩnh','Trạng thái rõ','Đồng nhất','Tương tác đạt'],
 ['12','Quiz: restructuring','Cùng hệ bố cục quiz mới; đáp án A và nội dung nguyên vẹn.','Giữ','Rộng dễ đọc','Tăng chữ','Không cần 3D','Tĩnh','Trạng thái rõ','Đồng nhất','Tương tác đạt'],
 ['13','Quiz: people','Cùng hệ bố cục quiz mới; đáp án C, hỗ trợ tiếp cận và giải thích nguyên vẹn.','Giữ','Rộng dễ đọc','Tăng chữ','Không cần 3D','Tĩnh','Trạng thái rõ','Đồng nhất','Tương tác đạt'],
 ['14','Quiz: one lead','Cùng hệ bố cục quiz mới; đáp án B và giải thích nguyên vẹn.','Giữ','Rộng dễ đọc','Tăng chữ','Không cần 3D','Tĩnh','Trạng thái rõ','Đồng nhất','Tương tác đạt'],
 ['15','Closing','Cân cỡ chữ/chiều rộng cho desktop và dọc. Chỉ Thank you for listening, không cờ, không thêm lời kết.','Đúng yêu cầu','Tĩnh cân bằng','Cân dòng','Không cần','Giữ','Giữ','Đồng nhất','Đạt nội dung']
];
const edits=JSON.parse(fs.readFileSync('work/visual-redesign/copy-changes.json'));
let md=`# Bản duyệt hình ảnh — 16/10/2026

[Mở bài trình chiếu](../../dist/reforming_vietnam_complete.html) · [So sánh trước/sau](comparison.html)

Đây là bản thiết kế để người dùng duyệt sau Phase D. Chưa triển khai Phase E; không thêm hệ thống chuyển scene. Chất lượng thẩm mỹ chưa được người dùng xác nhận. Giữ kiến trúc Codex hiện hữu, không lấy thiết kế Antigravity.

## Mở và build

Mở trực tiếp dist/reforming_vietnam_complete.html bằng Chrome/Edge. Bản này vẫn tự chứa và chạy offline dù yêu cầu mới đã cho phép online. Không cần cài hay chạy server. Space/Right để tiến beat, Left để lùi, R replay, G overview, E editor, N notes, M âm thanh. Chạy lại build: node build/assemble-cinematic.mjs.

## Phạm vi và bảo vệ

Bản gốc dist/reforming_vietnam_political_system_3d.html được giữ nguyên, SHA-256 đối chiếu với source-backup/original.html không đổi. Không commit. Các file trước sửa có trong source-backup/. Giữ 15 scene, 37 beat, 8 chương; quiz, nguồn và presenter materials không đổi theo so sánh JSON. Không sửa thư viện Three.js hoặc dữ liệu polygon bản đồ.

## File thay đổi

- build/content.json: các câu hiển thị liệt kê dưới đây; không thay đáp án, ngày, số liệu, nguồn, lời dẫn.
- build/cinematic.css: bố cục, phân cấp chữ, quiz, vùng đọc dọc.
- build/cinematic-scenes.mjs: bỏ SVG lửa rời và số trang trí lớn ở trách nhiệm.
- build/cinematic-worlds.mjs: tài liệu/lửa/trách nhiệm 3D, tỷ lệ dịch vụ, ánh sáng studio, camera dọc.
- build/cinematic-maze.mjs: nhãn trạm và camera dọc.
- build/restructure-scene.mjs: màu/vật liệu mặt bên và nhãn VIETNAM.
- dist/reforming_vietnam_complete.html: bản build giao duyệt.
- docs/HANDOFF.md, docs/TASK_STATUS.md: trạng thái và bước kế tiếp.
- work/visual-redesign/: ảnh đối chứng, scripts kiểm tra, kết quả và báo cáo này. Đây là chứng cứ phát triển, không phải các file bắt buộc để chạy bài trình chiếu.

## Tài nguyên mới

Không tải font, ảnh, texture, model, âm thanh hoặc thư viện mới. Dùng Georgia/Segoe UI hiện có. Mô hình mới tạo bằng Three.js hiện hữu; môi trường phản xạ studio sinh bằng canvas rồi PMREM, không có tài nguyên tải trễ. Playwright 1.62.1 dùng bản có sẵn của môi trường Codex (công cụ kiểm tra, không được nhúng vào sản phẩm). Bộ sinh studio chỉ tác động cảnh 4/6/7/9/10, khôi phục environment sau render để không đổi cờ.

## Đánh giá 15 cảnh

Đây là nhận xét dựa trên ảnh render 1600×900 và 390×844, không phải điểm chấm rubric hay kết quả thử với khán giả.

| Cảnh | Truyền đạt | Bố cục | Typography | Mô hình | Ánh sáng | Màu | Nhất quán | Tổng thể |
|---|---|---|---|---|---|---|---|---|
`;
for(const r of rows)md+='| '+r[0]+' | '+r.slice(3).join(' | ')+' |\n';
md+='\n### Thay đổi cụ thể\n\n'+rows.map(r=>`- **${r[0]} — ${r[1]}:** ${r[2]}`).join('\n');
md+='\n\n## Thay đổi chữ\n\n| Cảnh/beat (từ 0) | Trước | Sau |\n|---|---|---|\n'+edits.map(e=>`| ${e.scene}/${e.beat} (${e.field}) | ${e.before} | ${e.after} |`).join('\n');
md+=`\n\nNhãn trên bản đồ: VIỆT NAM → VIETNAM. Những thay đổi này là diễn đạt/hiển thị, không bổ sung kết luận lịch sử hoặc tuyên bố kết quả cải cách. Các ví dụ tổ chức và dịch vụ vẫn phân biệt minh họa, thay đổi cơ cấu, mục tiêu và kết quả cần bằng chứng.

## Rubric đã đọc

Đã trích văn bản gốc từ CRITERIA FOR ASSESSING GROUP ACTIVITIES.docx; tiêu đề môn trong file là Ho Chi Minh’s Ideology, được người dùng xác nhận dùng cho bài này. Rubric gồm: thời gian 1; nội dung 3; kỹ năng trình bày 1; sản phẩm 1; sáng tạo 1; nhận xét/đánh giá 1; câu hỏi liên hệ thực tiễn 1; tham gia lớp 1.

Nội dung ba yêu cầu đề bài: sự cần thiết (2–4), ví dụ/thực tiễn (5–7/10), trách nhiệm nhóm (8–9). Quiz 11–14 có tình huống vận dụng, chờ Submit và phần giải thích. Sản phẩm và sáng tạo được hỗ trợ bởi mô hình/đồ họa. Thời gian 11 phút vẫn là dự kiến; kỹ năng nói, đóng góp thực tế, nhận xét và mức tham gia phải được thể hiện trong buổi thuyết trình, không thể xác nhận bằng website.

## Kiểm tra đã chạy

- node build/assemble-cinematic.mjs: thành công; kiểm tra cấu trúc 15 scene/8 chương và cú pháp script inline.
- node --test tests/scene-controller.test.mjs tests/input-controller.test.mjs tests/world.test.mjs: 52/52 đạt.
- Playwright/Chromium, desktop 1600×900: đi đủ 37 beat; portrait 390×844: 15 trạng thái cảnh. final/review.json: 52 trạng thái, 0 lỗi console, 0 page error, 0 CPVApp error, không tràn ngang; chặn HTTP(S), không có request ngoài.
- interactions.cjs: 37/37 kiểm tra đạt; Next/Previous qua ranh giới cảnh, replay, đủ A–D, ẩn giải thích trước Submit, đúng D/A/C/B, trạng thái sai, Reset, không tự chuyển cảnh; editor Apply/Undo/Redo; localStorage sau reload; tải HTML và mở lại đủ 37 beat; notes popup; bật/tắt mute; fallback không WebGL. Xem interaction-results.json.
- File xuất thử có nội dung kiểm tra tạm thời trong work/visual-redesign/export-check.html; KHÔNG phải bản trình chiếu để sử dụng. HTML giao ở dist không chứa nội dung thử.
- Đợt sửa camera dọc cuối chỉ ảnh hưởng cảnh 3; final-check.cjs chụp lại ảnh cảnh 3 và lấy mẫu chuyển beat dịch vụ ở chế độ chuyển động bình thường. Không tuyên bố đã xem video liên tục hoặc đo FPS GPU thật.
- Impeccable detector: còn 1 cảnh báo cũ về transition:width của thanh tiến trình; không đổi hệ thống chuyển cảnh trong nhiệm vụ này.

## Giới hạn và những điểm cần duyệt

- Cần người dùng duyệt chủ yếu cảnh 4 (tài liệu minh họa), 6 (lửa/bát đồng), 9 (đồ vật hành động), cùng mức độ tiết chế của 2/10. Các mô hình là hình ảnh diễn giải, không phải chứng cứ về cơ quan hoặc kết quả chính sách.
- Bản đồ dùng dữ liệu giản lược có ghi nguồn Free-GIS-Data trong file nguồn; việc gộp là dữ liệu có sẵn. Không thực hiện thẩm định địa giới pháp lý mới. Không tuyên bố bản đồ có độ chính xác đo đạc; các đảo là inset không cùng tỷ lệ.
- Không kiểm chứng lại toàn bộ nguồn học thuật trong nhiệm vụ thị giác này; các điểm chưa xác minh trong CONTENT_AUDIT vẫn tồn tại. Không chuyển mục tiêu 2030/2045 thành thành tựu đã đạt.
- Cảnh 3/7 trên điện thoại vẫn là mô hình tổng quan nhỏ; thông tin chính được cung cấp bằng chữ và sơ đồ trong luồng đọc. Cần thử trên máy chiếu thật để đánh giá cỡ nhãn, độ sáng và âm thanh; chỉ kiểm tra tự động trên Chromium phần mềm.
- Không xác nhận chất lượng âm thanh bằng nghe, không kiểm tra thiết bị cảm ứng vật lý hay màn hình phụ thật; các hành vi input có bài kiểm tra độc lập. Không hạ chất lượng để đạt benchmark.

Dừng ở bước người dùng duyệt hình ảnh. Chỉ làm chuyển cảnh điện ảnh sau khi được yêu cầu tiếp.
`;
fs.writeFileSync('work/visual-redesign/REVIEW.md',md);
const sections=rows.map(r=>`<section><h2>${r[0]}. ${r[1]}</h2><p>${r[2]}</p><div class="pair"><figure><figcaption>Trước</figcaption><a href="before/desktop-${r[0]}-0.png"><img loading="lazy" src="before/desktop-${r[0]}-0.png" alt="Cảnh ${r[0]} trước sửa"></a></figure><figure><figcaption>Sau</figcaption><a href="final/desktop-${r[0]}-0.png"><img loading="lazy" src="final/desktop-${r[0]}-0.png" alt="Cảnh ${r[0]} sau sửa"></a></figure></div><p><a href="final/portrait-${r[0]}-0.png">Xem bố cục dọc</a></p></section>`).join('');
fs.writeFileSync('work/visual-redesign/comparison.html',`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đối chiếu 15 cảnh</title><style>body{margin:0;padding:4vw;background:#0a0b10;color:#eee2cb;font:17px/1.6 'Segoe UI',Arial}main{max-width:1600px;margin:auto}h1,h2{font-family:Georgia;font-weight:400}h1{font-size:42px}h2{font-size:30px}a{color:#dfbc79}section{padding:28px 0 50px;border-bottom:1px solid #dfbc7940}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{width:100%;display:block}figcaption{margin-bottom:8px;color:#bda98e}p{max-width:85ch}@media(max-width:800px){.pair{grid-template-columns:1fr}}</style><main><h1>15 cảnh · Trước / Sau</h1><p>Ảnh chụp Chromium thực, 1600×900. Nhấp vào ảnh để xem nguyên kích thước. Đây là đối chiếu khung hình, không phải bản xem chuyển động.</p><p><a href="../../dist/reforming_vietnam_complete.html">Mở bài trình chiếu</a> · <a href="REVIEW.md">Đọc thay đổi và kiểm tra</a></p>${sections}</main></html>`);
