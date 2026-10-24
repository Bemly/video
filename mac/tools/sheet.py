# contact sheet: python3 tools/sheet.py <cat> out.jpg
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
m = [r for r in json.load(open('build/manifest.json')) if r['cat'] == sys.argv[1] and r['page']]
ids = sys.argv[3].split(',') if len(sys.argv) > 3 else None
if ids: m = [r for r in m if r['id'] in ids]
W, H = 640, 360; cols = 3
rows = (len(m) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, (H + 30) * rows), 'white')
f = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 20)
d = ImageDraw.Draw(sheet)
for i, r in enumerate(m):
    x, y = i % cols * W, i // cols * (H + 30)
    p = f'shots/{r["id"]}.jpg'
    if os.path.exists(p): sheet.paste(Image.open(p).resize((W, H)), (x, y + 30))
    d.text((x + 6, y + 4), f'{r["id"][-5:]} {r["name"][:40]}', fill='black', font=f)
sheet.save(sys.argv[2], quality=80)
