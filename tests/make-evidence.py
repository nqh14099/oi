# Builds frame-stepped demo videos + contact sheets from QA captures.
# usage: python3 -I make-evidence.py <qa_root> <out_dir>
import sys, os, glob, subprocess, json, re
from PIL import Image, ImageDraw, ImageFont
qa, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def frames(pattern):
    return sorted(glob.glob(os.path.join(qa, '**', pattern), recursive=True))
def label(src, text, dst):
    im = Image.open(src).convert('RGB').resize((1600, 900))
    d = ImageDraw.Draw(im)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
    except Exception: f = ImageFont.load_default()
    d.rectangle([0, 860, 1600, 900], fill=(9, 9, 11))
    d.text((18, 866), text, fill=(232, 217, 189), font=f)
    im.save(dst, quality=88)
def video(items, name):
    # items: list of (path, seconds, caption)
    tmp = os.path.join(out, name + '_frames'); os.makedirs(tmp, exist_ok=True)
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w') as fh:
        for i, (p, sec, cap) in enumerate(items):
            dst = os.path.join(tmp, f'{i:04d}.jpg'); label(p, cap, dst)
            fh.write(f"file '{dst}'\nduration {sec}\n")
        if items: fh.write(f"file '{dst}'\n")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'fps=24,format=yuv420p', '-c:v', 'libx264', '-crf', '20', os.path.join(out, name + '.mp4')], check=True)
    return os.path.join(out, name + '.mp4')
NOTE = 'frame-stepped capture · Chromium + SwiftShader WebGL2 (CPU) · not real-time playback'
walk = []
for p in frames('beat-s*.jpg'):
    b = os.path.basename(p)[:-4]
    walk.append((p, 1.6, f'{b} · {NOTE}'))
trans = []
for pair in ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10', '10-11', '11-12', '14-15', '3-2']:
    fs = frames(f'tr-{pair}-*.jpg')
    for p in fs:
        pct = os.path.basename(p)[:-4].split('-')[-1]
        trans.append((p, .55 if not pct.endswith('100') else 1.4, f'transition {pair.replace("-", " → ")} · {int(pct)}% · {NOTE}'))
form = [(p, .8, f'ModelFormation · {int(os.path.basename(p)[-7:-4])}% · {NOTE}') for p in frames('*formation-*.jpg')]
arch = [(p, 1.8, os.path.basename(p)[:-4] + ' · ' + NOTE) for p in frames('s4-layout-*.jpg') + frames('s4-b*.jpg')]
made = {}
if trans: made['transitions'] = video(trans, 'demo_transitions')
if form or arch: made['archive'] = video(form + arch, 'demo_reform_archive_formation')
if walk: made['walkthrough'] = video(walk, 'demo_walkthrough_37_beats')
# contact sheet of all beats
if walk:
    cols, w, h = 6, 400, 225
    rows = (len(walk) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * (h + 26)), (9, 9, 11)); d = ImageDraw.Draw(sheet)
    for i, (p, _, cap) in enumerate(walk):
        im = Image.open(p).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 26)
        sheet.paste(im, (x, y)); d.text((x + 6, y + h + 5), os.path.basename(p)[:-4], fill=(232, 217, 189))
    sheet.save(os.path.join(out, 'contact_sheet_beats.jpg'), quality=85); made['sheet'] = 'contact_sheet_beats.jpg'
if trans:
    pairs = sorted({os.path.basename(p)[3:].rsplit('-', 1)[0] for p, _, _ in trans}, key=lambda s: [int(x) for x in s.split('-')])
    w, h = 320, 180; sheet = Image.new('RGB', (5 * w, len(pairs) * (h + 22)), (9, 9, 11)); d = ImageDraw.Draw(sheet)
    for r, pair in enumerate(pairs):
        for c, pct in enumerate(['000', '025', '050', '075', '100']):
            fs = frames(f'tr-{pair}-{pct}.jpg')
            if fs: sheet.paste(Image.open(fs[0]).convert('RGB').resize((w, h)), (c * w, r * (h + 22)))
            d.text((c * w + 6, r * (h + 22) + h + 4), f'{pair} {pct}%', fill=(232, 217, 189))
    sheet.save(os.path.join(out, 'contact_sheet_transitions.jpg'), quality=85); made['tsheet'] = 'contact_sheet_transitions.jpg'
print(json.dumps(made))
