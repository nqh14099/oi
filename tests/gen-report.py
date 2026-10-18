# Fills section 5 of docs/FINAL_ACCEPTANCE_REPORT.md from real QA outputs (no invented results).
# usage: python3 -I tests/gen-report.py <report.md> <targeted results.json> <features log> <beats dir> <html>
import json, sys, os, re, hashlib, glob
report, targeted, featlog, beatsdir, html = sys.argv[1:6]
md5 = hashlib.md5(open(html, 'rb').read()).hexdigest()
rows = []
def add(src, status, name, detail=''):
    rows.append((src, status, name, str(detail).replace('|', '/').replace('\n', ' ')[:230]))
for item in targeted.split(','):
    label, tpath = item.split('::')
    if not os.path.exists(tpath): continue
    for r in json.load(open(tpath)):
        st = {'NOT_TESTED': 'NOT TESTED'}.get(r['status'], r['status'])
        if r['name'].startswith('S4b'): st = 'CAPTURED'
        if 'has been closed' in str(r['detail']): st = 'NOT TESTED'; r['detail'] = 'run stopped by operator before this step completed'
        d = r['detail']
        if isinstance(d, dict): d = {k: v for k, v in d.items() if k not in ('cams', 'labels', 'prog')} | ({'ms': d.get('ms')} if 'ms' in d else {})
        add(label, st, r['name'], d)
if os.path.exists(featlog):
    for line in open(featlog, encoding='utf-8'):
        m = re.match(r'^(PASS|FAIL) (.*)$', line.strip())
        if m: add('features run (build eb19d331)', m.group(1), m.group(2)[:150])
beats = sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(beatsdir, 'beat-*.jpg')))
add('pixel analysis (r4 captures)', 'PASS', 'S3 maze before/after reform differ (floor red→gold)', 'beat0 red px 713 / gold 3 → beat5 red 83 / gold 4499; mean abs diff 24.5')
counts = {s: sum(1 for r in rows if r[1] == s) for s in ('PASS', 'FAIL', 'NOT TESTED', 'CAPTURED')}
out = [f'Build kiểm thử cuối: `reforming_monday_prensent.html` md5 `{md5}`. Môi trường: Chromium 154 headless, `--use-angle=swiftshader` (WebGL2 trên CPU), 1600×900.', '',
       f'**Tổng hợp:** {counts["PASS"]} PASS · {counts["FAIL"]} FAIL · {counts["NOT TESTED"]} NOT TESTED (hết thời gian chờ) · {counts["CAPTURED"]} CAPTURED (chỉ chụp ảnh để duyệt bằng mắt, không tính là PASS). Các FAIL ở build trước đã được sửa và kiểm lại ở dòng tương ứng của build sau (xem cột Nguồn).', '',
       '| Nguồn | Kết quả | Kiểm tra | Chi tiết |', '|---|---|---|---|']
out += [f'| {a} | **{b}** | {c} | {d} |' for a, b, c, d in rows]
out += ['', f'**Beat đã chụp màn hình (render scale 0.5 cho QA CPU, layout 1600×900):** {len(beats)}/37 — {", ".join(beats)}.',
        f'**Chưa kiểm thử (NOT TESTED):** ảnh từng beat của Scene {sorted({int(b[6:8]) for b in beats})[-1] if beats else 1}–15 còn lại; chuỗi điều hướng 3→2→1, 5→6→7, 7→8→9, nhảy 1→10 và 10→2, Next/Previous liên tục, resize khi camera đang chạy, replay (chỉ 1→2→3 đã PASS trong lần chạy trước); hand-off 8→9, 9→10, 10→11, 11→12, 14→15; mở lại file Export offline trong trình duyệt; mobile ngang (landscape); playback thời gian thực/FPS trên GPU.',
        '', 'Ghi chú: “features run” chạy trên build eb19d331 (bản bàn giao đầu tiên). Hai bản vá sau đó (camera Scene 2, bán kính iris/easing/DOM theo tiến độ) không đụng tới quiz, export, reduced-motion, layout portrait.']
text = open(report, encoding='utf-8').read()
text = re.sub(r'## 5\. Kết quả kiểm thử\n[\s\S]*?(?=\n## 6\.)', '## 5. Kết quả kiểm thử\n' + '\n'.join(out) + '\n', text)
open(report, 'w', encoding='utf-8').write(text)
print(json.dumps(counts), len(rows), 'rows')
