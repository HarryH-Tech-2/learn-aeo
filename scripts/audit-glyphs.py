"""
Audit hieroglyph data files: every sign written as  S("𓐝", "Aa15", ...)  or as
an object with  glyph: "𓐝"  ...  gardiner: "Aa15"  must use the Unicode
character(s) whose name is that Gardiner code. Catches the class of bug that
put ~12 wrong code points into lessons.ts.

    python scripts/audit-glyphs.py src/lib/daily.ts src/lib/decipher.ts

Exit code 1 on any mismatch.
"""
import io
import re
import sys
import unicodedata

HIERO = re.compile(r"[\U00013000-\U0001345F]+")
# S("𓐝", "Aa15"   |   S("𓇋𓇋", "M17"
CALL = re.compile(r'S\("([\U00013000-\U0001345F]+)",\s*"([A-Za-z]+\d+[A-Za-z]?)"')
# glyph: "𓐝", gardiner: "Aa15"   (same object, any order, within ~200 chars)
OBJ = re.compile(r'glyph:\s*"([\U00013000-\U0001345F]+)"[^}]{0,200}?gardiner:\s*"([A-Za-z]+\d+[A-Za-z]?)"')
OBJ_REV = re.compile(r'gardiner:\s*"([A-Za-z]+\d+[A-Za-z]?)"[^}]{0,200}?glyph:\s*"([\U00013000-\U0001345F]+)"')


def gardiner_name(code: str) -> str:
    m = re.match(r"^([A-Za-z]+)(\d+)([A-Za-z]?)$", code)
    letters, num, suffix = m.groups()
    return f"EGYPTIAN HIEROGLYPH {letters.upper()}{int(num):03d}{suffix.upper()}"


def check(glyph: str, code: str, where: str, errors: list[str]) -> None:
    want = gardiner_name(code)
    for ch in glyph:
        got = unicodedata.name(ch, "?")
        if got != want:
            errors.append(f"{where}: {glyph} U+{ord(ch):04X} is {got}, data says {code} ({want})")


def main(paths: list[str]) -> int:
    errors: list[str] = []
    total = 0
    for path in paths:
        text = io.open(path, encoding="utf-8").read()
        for m in CALL.finditer(text):
            total += 1
            check(m.group(1), m.group(2), f"{path}:{text.count(chr(10), 0, m.start()) + 1}", errors)
        for m in OBJ.finditer(text):
            total += 1
            check(m.group(1), m.group(2), f"{path}:{text.count(chr(10), 0, m.start()) + 1}", errors)
        for m in OBJ_REV.finditer(text):
            total += 1
            check(m.group(2), m.group(1), f"{path}:{text.count(chr(10), 0, m.start()) + 1}", errors)
    for e in errors:
        print("MISMATCH", e)
    print(f"checked {total} signs in {len(paths)} file(s); {len(errors)} mismatch(es)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
