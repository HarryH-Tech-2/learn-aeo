"""
Pinterest pins (1000x1500) for learnhieroglyphics.com, written to public/pins/ with pins.csv beside them.

  python scripts/dev/make-pins.py <art dir> <names.json> <alphabet.json>

<art dir> holds the Higgsfield stills (canyon.png, hall.png, open.png, sky.png, doorclosed.png); names.json is
{name: {glyphs, translit}} from the site's own translator, alphabet.json the 25 lesson signs. Fonts: Segoe UI
(text and transliteration) and Segoe UI Historic (hieroglyphs), both shipped with Windows.
"""
import csv
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "pins"
SITE = "https://www.learnhieroglyphics.com"
W, H = 1000, 1500
GOLD = (246, 215, 126)
GOLD_DEEP = (212, 168, 50)
INK = (20, 14, 6)
FONTS = "C:/Windows/Fonts/"


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


LIGHT = lambda s: font("segoeuil.ttf", s)
SEMI = lambda s: font("seguisb.ttf", s)
REG = lambda s: font("segoeui.ttf", s)
GLYPH = lambda s: font("seguihis.ttf", s)


def cover(img, w=W, h=H, focus=0.5):
    """Crop to fill w x h, keeping the horizontal focus point."""
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    img = img.resize((round(iw * scale), round(ih * scale)), Image.LANCZOS)
    iw, ih = img.size
    left = max(0, min(iw - w, round(iw * focus - w / 2)))
    top = (ih - h) // 2
    return img.crop((left, top, left + w, top + h))


def shade(img, top=0.35, bottom=0.85):
    """Dark gradient top and bottom so text reads."""
    grad = Image.new("L", (1, H))
    for y in range(H):
        t = y / H
        a = top * max(0, 1 - t / 0.32) + bottom * max(0, (t - 0.55) / 0.45)
        grad.putpixel((0, y), int(255 * min(1, a)))
    grad = grad.resize((W, H))
    return Image.composite(Image.new("RGB", (W, H), (6, 4, 2)), img, grad)


def text_center(d, y, s, f, fill, shadow=True):
    w = d.textlength(s, font=f)
    x = (W - w) / 2
    if shadow:
        d.text((x + 2, y + 3), s, font=f, fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=fill)


def footer(img, line="learnhieroglyphics.com"):
    d = ImageDraw.Draw(img)
    f = SEMI(34)
    w = d.textlength(line, font=f)
    pad = 26
    x0, y0 = (W - w) / 2 - pad, H - 120
    d.rounded_rectangle((x0, y0, x0 + w + 2 * pad, y0 + 62), radius=31, fill=(12, 9, 4), outline=GOLD_DEEP, width=2)
    d.text(((W - w) / 2, y0 + 9), line, font=f, fill=GOLD)


def cartouche_vertical(img, glyphs, cx, top, cell=118):
    """A standing cartouche (a gold-roped oval on lapis), signs stacked top to bottom, the tie at the foot."""
    n = len(glyphs)
    w = cell + 70
    h = n * cell + 70
    x0, y0 = cx - w // 2, top
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # glow
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle((x0 - 20, y0 - 20, x0 + w + 20, y0 + h + 20), radius=w // 2 + 20, fill=(255, 200, 100, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    layer = Image.alpha_composite(layer, glow)
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x0, y0, x0 + w, y0 + h), radius=w // 2, fill=(22, 41, 74, 245), outline=GOLD, width=7)
    d.rounded_rectangle((x0 + 12, y0 + 12, x0 + w - 12, y0 + h - 12), radius=w // 2 - 12, outline=(232, 196, 96, 120), width=2)
    # the tie: a bar under the oval
    d.rounded_rectangle((x0 + 6, y0 + h + 12, x0 + w - 6, y0 + h + 30), radius=6, fill=GOLD)
    f = GLYPH(int(cell * 0.78))
    for i, g in enumerate(glyphs):
        cy = y0 + 35 + i * cell + cell / 2
        bb = d.textbbox((0, 0), g, font=f)
        gw, gh = bb[2] - bb[0], bb[3] - bb[1]
        d.text((cx - gw / 2 - bb[0], cy - gh / 2 - bb[1]), g, font=f, fill=GOLD)
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))
    return y0 + h + 30


def name_pin(art, name, glyphs, translit, focus=0.5):
    img = shade(cover(art, focus=focus), top=0.55, bottom=0.9)
    d = ImageDraw.Draw(img)
    text_center(d, 70, "YOUR NAME IN HIEROGLYPHICS", SEMI(30), GOLD)
    text_center(d, 115, name, LIGHT(120), (255, 247, 228))
    signs = list(glyphs)
    cell = min(118, int(820 / max(1, len(signs))))
    bottom = cartouche_vertical(img, signs, W // 2, 290, cell=cell)
    d = ImageDraw.Draw(img)
    text_center(d, bottom + 40, translit, REG(40), (240, 225, 190))
    text_center(d, H - 230, "Type any name and see it carved", REG(38), (255, 247, 228))
    text_center(d, H - 185, "Free name translator", SEMI(38), GOLD)
    footer(img)
    return img


def alphabet_pin(alpha):
    img = Image.new("RGB", (W, H), (247, 238, 218))
    d = ImageDraw.Draw(img)
    # papyrus fibres
    for y in range(0, H, 6):
        d.line((0, y, W, y), fill=(240, 228, 204), width=1)
    d.rectangle((24, 24, W - 24, H - 24), outline=(168, 125, 24), width=4)
    d.rectangle((36, 36, W - 36, H - 36), outline=(168, 125, 24), width=1)
    text_center(d, 70, "THE HIEROGLYPHIC", SEMI(40), (138, 102, 16), shadow=False)
    text_center(d, 118, "Alphabet", LIGHT(110), (40, 28, 10), shadow=False)
    text_center(d, 262, "25 signs, one sound each. Learn them free.", REG(30), (90, 66, 30), shadow=False)
    cols, rows = 5, 5
    gx0, gy0, cw, ch = 70, 320, (W - 140) / 5, 200
    gf, tf, mf = GLYPH(96), SEMI(30), REG(22)
    for i, s in enumerate(alpha[:25]):
        c, r = i % cols, i // cols
        x, y = gx0 + c * cw, gy0 + r * ch
        d.rounded_rectangle((x + 8, y + 8, x + cw - 8, y + ch - 8), radius=18, fill=(255, 250, 238), outline=(212, 168, 50), width=2)
        bb = d.textbbox((0, 0), s["s"], font=gf)
        d.text((x + cw / 2 - (bb[2] - bb[0]) / 2 - bb[0], y + 70 - (bb[3] - bb[1]) / 2 - bb[1]), s["s"], font=gf, fill=(120, 84, 12))
        t = s["t"].split(" ")[0]
        d.text((x + cw / 2 - d.textlength(t, font=tf) / 2, y + 118), t, font=tf, fill=(40, 28, 10))
        # the picture's name, shrunk to fit the cell
        m, size = s["m"], 22
        while size > 14 and d.textlength(m, font=REG(size)) > cw - 28:
            size -= 1
        mf2 = REG(size)
        d.text((x + cw / 2 - d.textlength(m, font=mf2) / 2, y + 156), m, font=mf2, fill=(110, 84, 40))
    text_center(d, H - 175, "Read your first real Egyptian words in 10 minutes", REG(30), (60, 44, 16), shadow=False)
    footer(img, "learnhieroglyphics.com/hieroglyphic-alphabet")
    return img


def headline_pin(art, kicker, title_lines, sub_lines, footer_line, focus=0.5, glyph_row=None):
    img = shade(cover(art, focus=focus), top=0.7, bottom=0.92)
    d = ImageDraw.Draw(img)
    text_center(d, 90, kicker, SEMI(32), GOLD)
    y = 145
    for line in title_lines:
        text_center(d, y, line, LIGHT(96), (255, 247, 228))
        y += 112
    if glyph_row:
        f = GLYPH(110)
        text_center(d, y + 20, glyph_row, f, GOLD)
    y = H - 330
    for line in sub_lines:
        text_center(d, y, line, REG(40), (255, 247, 228))
        y += 54
    footer(img, footer_line)
    return img


def couple_pin(art, a, b):
    img = shade(cover(art, focus=0.5), top=0.6, bottom=0.9)
    d = ImageDraw.Draw(img)
    text_center(d, 70, "TWO NAMES, CARVED TOGETHER", SEMI(30), GOLD)
    text_center(d, 115, f"{a[0]} & {b[0]}", LIGHT(104), (255, 247, 228))
    cell = 104
    cartouche_vertical(img, list(a[1]), W // 2 - 140, 300, cell=cell)
    cartouche_vertical(img, list(b[1]), W // 2 + 140, 300, cell=cell)
    d = ImageDraw.Draw(img)
    text_center(d, H - 230, "A keepsake for weddings and anniversaries", REG(36), (255, 247, 228))
    text_center(d, H - 185, "Make yours free", SEMI(38), GOLD)
    footer(img, "learnhieroglyphics.com")
    return img


def stencil_pin(name, glyphs):
    img = Image.new("RGB", (W, H), (250, 248, 244))
    d = ImageDraw.Draw(img)
    text_center(d, 80, "HIEROGLYPHIC NAME TATTOO", SEMI(34), (60, 60, 60), shadow=False)
    text_center(d, 130, f"“{name}” as a stencil", LIGHT(80), (20, 20, 20), shadow=False)
    # black line cartouche
    n = len(glyphs)
    cell = 130
    w, h = cell + 80, n * cell + 80
    x0, y0 = W // 2 - w // 2, 290
    d.rounded_rectangle((x0, y0, x0 + w, y0 + h), radius=w // 2, outline=(15, 15, 15), width=8)
    d.rounded_rectangle((x0 + 4, y0 + h + 14, x0 + w - 4, y0 + h + 34), radius=6, fill=(15, 15, 15))
    f = GLYPH(int(cell * 0.78))
    for i, g in enumerate(glyphs):
        cy = y0 + 40 + i * cell + cell / 2
        bb = d.textbbox((0, 0), g, font=f)
        d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]), g, font=f, fill=(15, 15, 15))
    text_center(d, H - 250, "Black on white, ready for your tattoo artist", REG(34), (60, 60, 60), shadow=False)
    text_center(d, H - 200, "Preview your name free", SEMI(38), (138, 102, 16), shadow=False)
    footer(img, "learnhieroglyphics.com/hieroglyphics-tattoo")
    return img


def link(path, slug):
    sep = "&" if "?" in path else "?"
    return f"{SITE}{path}{sep}utm_source=pinterest&utm_medium=social&utm_campaign={slug}"


def main(art_dir, names_file, alpha_file):
    art = {k: Image.open(Path(art_dir) / f"{k}.png").convert("RGB") for k in ["canyon", "hall", "open", "sky", "doorclosed"]}
    names = json.loads(Path(names_file).read_text(encoding="utf-8"))
    alpha = json.loads(Path(alpha_file).read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []

    def save(img, slug, title, desc, path, alt, board):
        file = f"{slug}.jpg"
        img.save(OUT / file, quality=88, optimize=True, progressive=True)
        rows.append({"file": f"public/pins/{file}", "media_url": f"{SITE}/pins/{file}", "title": title, "description": desc, "link": link(path, slug), "alt_text": alt, "board": board})

    backs = ["canyon", "hall", "open", "sky", "doorclosed", "canyon", "hall", "open"]
    for i, n in enumerate(["Olivia", "Emma", "Amelia", "Sophia", "Liam", "Noah", "Oliver", "James"]):
        g = names[n]
        save(
            name_pin(art[backs[i]], n, g["glyphs"], g["translit"], focus=0.5),
            f"pin-name-{n.lower()}",
            f"{n} in Egyptian Hieroglyphics",
            f"How to write {n} in ancient Egyptian hieroglyphs, sign by sign ({g['translit']}), in a royal cartouche. Type any name into the free translator to see yours carved. #hieroglyphics #ancientegypt #names #cartouche #egyptology",
            f"/translate-name-to-hieroglyphics/{n}",
            f"The name {n} written in Egyptian hieroglyphs inside a gold cartouche",
            "Names in Hieroglyphics",
        )
    save(alphabet_pin(alpha), "pin-alphabet-chart", "The Hieroglyphic Alphabet: All 25 Signs",
         "A printable chart of the 25 Egyptian alphabet signs, each with its sound and what it pictures (vulture, reed leaf, owl, water...). Learn to read your first real Egyptian words in a free 10-minute lesson. #hieroglyphics #alphabet #ancientegypt #homeschool #history",
         "/hieroglyphic-alphabet", "Chart of the 25 Egyptian hieroglyphic alphabet signs with their sounds", "Learn Hieroglyphics")
    save(headline_pin(art["open"], "FREE · 10 MINUTES · NO CARD", ["Learn to read", "hieroglyphs"], ["Your name on a sealed door first,", "then real Egyptian words."], "learnhieroglyphics.com", focus=0.5),
         "pin-free-lesson", "Learn to Read Egyptian Hieroglyphs (Free Lesson)",
         "Start reading ancient Egyptian in 10 minutes: brush the sand off your own name on a temple door, then read real words like 'name', 'sister' and 'sky'. Free, no card needed. #learnhieroglyphics #ancientegypt #egyptology #learning",
         "/", "A temple doorway opening onto glowing hieroglyphs", "Learn Hieroglyphics")
    save(headline_pin(art["doorclosed"], "FOR TEACHERS · FREE PRINTABLE", ["Ancient Egypt", "worksheet"], ["Alphabet chart, write-your-name cartouche", "and a ready 50-minute lesson"], "learnhieroglyphics.com/teachers", focus=0.5, glyph_row="𓄿𓃀𓂋𓈖"),
         "pin-teacher-worksheet", "Free Ancient Egypt Hieroglyphics Worksheet for the Classroom",
         "A free printable for KS2 / grades 3-6: hieroglyphic alphabet chart, a write-your-name cartouche, names to decode and an answer key, plus a ready-made 50-minute lesson. No pupil accounts needed. #ancientegypt #teacherresources #ks2history #homeschool",
         "/teachers/worksheet", "A carved Egyptian temple door with the words Ancient Egypt worksheet", "Teaching Ancient Egypt")
    save(headline_pin(art["sky"], "FOR PET LOVERS", ["Your pet's name", "in hieroglyphs"], ["“Luna”, with the dog sign a scribe adds", "Cats and dogs, carved like pharaohs"], "learnhieroglyphics.com", focus=0.5, glyph_row=names["Luna"]["glyphs"]),
         "pin-pet-name", "Your Pet's Name in Egyptian Hieroglyphics",
         "Write your cat's or dog's name the way a scribe would, with the cat or dog sign at the end. Free and instant. #petname #hieroglyphics #ancientegypt #catsofpinterest #dogsofpinterest",
         "/pet-name-in-hieroglyphics", "A pet's name written in Egyptian hieroglyphs", "Names in Hieroglyphics")
    save(couple_pin(art["hall"], ("Liam", names["Liam"]["glyphs"]), ("Emma", names["Emma"]["glyphs"])),
         "pin-couple-names", "Couple Names in Egyptian Hieroglyphics",
         "Two names side by side in royal cartouches, a keepsake for weddings, anniversaries and Valentine's Day. Make yours free in seconds. #couplegoals #weddinggift #hieroglyphics #anniversary",
         "/couple-names-in-hieroglyphics", "Two names, Liam and Emma, in hieroglyphic cartouches", "Names in Hieroglyphics")
    save(stencil_pin("Max", names["Max"]["glyphs"]), "pin-tattoo-stencil", "Hieroglyphic Name Tattoo Stencil",
         "See your name as a clean black hieroglyphic cartouche, free, then get the HD stencil to take to your tattoo artist. #tattooideas #hieroglyphicstattoo #cartouche #egyptiantattoo",
         "/hieroglyphics-tattoo", "A black line cartouche tattoo stencil of the name Max in hieroglyphs", "Hieroglyphics Tattoo Ideas")

    with open(OUT / "pins.csv", "w", newline="", encoding="utf-8") as fh:
        wr = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        wr.writeheader()
        wr.writerows(rows)
    print(len(rows), "pins in", OUT)


if __name__ == "__main__":
    main(*sys.argv[1:4])
