# TpT cover and preview images for the Ancient Egypt Writing Unit (docs/tpt). Needs PyMuPDF:
#   pip install --target <dir> pymupdf
#   UNIT_PACK_OUT=<pdfdir> npx vitest run src/lib/__tests__/unit-pack.test.ts
#   python -I scripts/dev/build-unit-pack-tpt-images.py <dir> <pdfdir>/unit-full-a4.pdf docs/tpt
import sys
sys.path.insert(0, sys.argv[1])
import pymupdf
src = pymupdf.open(sys.argv[2]); out = sys.argv[3]
W, H = src[0].rect.width, src[0].rect.height
BG = (0.93, 0.89, 0.80); GOLD = (0.55, 0.42, 0.10); INK = (0.16, 0.13, 0.10)

def titles():
    return {i: (p.get_text().split("\n")[1] if p.get_text() else "") for i, p in enumerate(src)}
T = titles()
def find(prefix, nth=0):
    hits = [i for i, t in T.items() if t.startswith(prefix)]
    return hits[nth]

def shadowed(page, rect, idx, rot=0):
    sh = rect + (6, 8, 6, 8)
    page.draw_rect(sh, color=None, fill=(0, 0, 0), fill_opacity=0.18)
    page.draw_rect(rect, color=(0.7, 0.65, 0.55), fill=(1, 1, 1), width=0.5)
    page.show_pdf_page(rect, src, idx, rotate=rot)

def compose(w, h, layout, name, banner=None):
    doc = pymupdf.open(); pg = doc.new_page(width=w, height=h)
    pg.draw_rect(pg.rect, color=None, fill=BG)
    for (x, y, sw, idx) in layout:
        sh = sw * H / W
        shadowed(pg, pymupdf.Rect(x, y, x + sw, y + sh), idx)
    if banner:
        (bx, by, bw, bh, text, size) = banner
        r = pymupdf.Rect(bx, by, bx + bw, by + bh)
        pg.draw_rect(r, color=None, fill=GOLD)
        pg.insert_textbox(r + (0, bh * 0.22, 0, 0), text, fontsize=size, fontname="hebo", color=(1, 1, 1), align=1)
    pg.get_pixmap(matrix=pymupdf.Matrix(2, 2)).save(f"{out}/{name}")

cover = 0; ws1 = find("Worksheet 1"); ws2 = find("Worksheet 2"); ws3 = find("Worksheet 3"); ws4 = find("Worksheet 4")
plan1 = find("Lesson 1"); quiz = find("End-of-unit"); key = find("Answer key")
# 1:1 thumbnail, 1000 x 1000 at 2x = 2000 px
compose(1000, 1000, [(80, 170, 330, ws2), (590, 170, 330, ws3), (250, 90, 500, cover)], "cover-1x1.png",
        banner=(0, 880, 1000, 120, "5 LESSONS  ·  WORKSHEETS  ·  QUIZ  ·  ANSWER KEY", 30))
# 4:3, 1200 x 900 at 2x = 2400 x 1800
compose(1200, 900, [(40, 120, 330, plan1), (840, 120, 330, ws1), (330, 50, 540, cover)], "cover-4x3.png",
        banner=(0, 800, 1200, 100, "KS2 & GRADE 6  ·  5 LESSONS  ·  PRINT AND TEACH", 32))
# What's inside: 4 pages side by side
compose(1200, 900, [(30, 150, 270, plan1), (320, 150, 270, ws1), (610, 150, 270, ws3), (900, 150, 270, ws4)], "inside-4x3.png",
        banner=(0, 30, 1200, 90, "TEACHER PLANS  ·  PUPIL WORKSHEETS  ·  REAL CARTOUCHES", 30))

# Preview PDF and page images: watermark every page outside the free Lesson 1.
picks = [cover, find("How to use"), plan1, ws1, find("Worksheet 1", 1), ws2, find("Worksheet 2", 1), ws3, ws4, quiz, key]
prev = pymupdf.open()
for n, i in enumerate(picks, 1):
    prev.insert_pdf(src, from_page=i, to_page=i)
    p = prev[-1]
    free = T[i].startswith(("Lesson 1", "Worksheet 1")) or i in (cover,)
    if not free:
        c = pymupdf.Point(W / 2, H / 2)
        p.insert_text(pymupdf.Point(W * 0.2, H * 0.3), "PREVIEW  ·  learnhieroglyphics.com", fontsize=26, fontname="hebo",
                      color=GOLD, fill_opacity=0.18, morph=(pymupdf.Point(W * 0.2, H * 0.3), pymupdf.Matrix(-35)), overlay=True)
    p.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6)).save(f"{out}/preview-{n:02d}.png")
prev.save(f"{out}/preview.pdf")
print("pages", [T[i][:30] for i in picks])
