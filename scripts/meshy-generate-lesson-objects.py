"""
Generate the second batch of 3D "sign object" assets via the Meshy MCP server —
the objects used by the Outer Courtyard (Field Sketchbook) and Treasury
(Counting House) lessons.

Same driver as scripts/meshy-generate-signs.py (JSON-RPC over stdio to
`npx -y @meshy-ai/meshy-mcp-server`), different asset list and output dir.

  MESHY_API_KEY=msy_... python scripts/meshy-generate-lesson-objects.py

Outputs:
  public/models/objects/<id>.glb          (raw; optimise with gltf-transform v3 after)
  public/models/objects/manifest.json
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "models" / "objects"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST = OUT / "manifest.json"

# Reuse the MCP driver + helpers from the first script without re-running it.
spec = importlib.util.spec_from_file_location("signs", ROOT / "scripts" / "meshy-generate-signs.py")
signs = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(signs)
Mcp, extract_task_id, wait_done, log, STYLE = signs.Mcp, signs.extract_task_id, signs.wait_done, signs.log, signs.STYLE

ASSETS = [
    # id,        glyph,  translit,  sign name,              subject prompt
    ("scarab",   "𓆣",   "ḫpr",  "scarab beetle",         "a scarab dung beetle seen from above, rounded wing cases, six legs tucked in"),
    ("lotus",    "𓆸",   "sšn",  "blue lotus flower",     "a single blue lotus water-lily flower in bloom on a short stem, seen from the side"),
    ("vulture",  "𓄿",   "ꜣ",    "Egyptian vulture",      "an Egyptian vulture standing in profile, wings folded, long neck, hooked beak"),
    ("cobra",    "𓆗",   "ꞽꜥrt", "rearing cobra (uraeus)", "a rearing cobra with its hood spread, coiled body, seen from the side"),
    ("jar",      "𓏊",   "ḥnqt", "beer jar",              "a tall round-bottomed clay beer jar with a narrow neck, sitting in a small ring stand"),
    ("bull",     "𓃒",   "kꜣ",   "bull / ox",             "a standing ox with short curved horns, seen from the side, sturdy body"),
]


def main() -> None:
    if not os.environ.get("MESHY_API_KEY"):
        sys.exit("MESHY_API_KEY not set")
    mcp = Mcp()
    log("balance:", mcp.tool("meshy_check_balance", {}))
    manifest = json.loads(MANIFEST.read_text("utf-8")) if MANIFEST.exists() else {}

    for aid, glyph, tr, meaning, subject in ASSETS:
        entry = manifest.setdefault(aid, {"glyph": glyph, "translit": tr, "meaning": meaning})
        if entry.get("glb"):
            log(aid, "already done, skipping")
            continue
        if not entry.get("preview_task"):
            res = mcp.tool("meshy_text_to_3d", {
                "prompt": STYLE.format(subject=subject),
                "ai_model": "latest",
                "topology": "triangle",
                "target_polycount": 6000,
                "should_remesh": True,
                "target_formats": ["glb"],
            })
            entry["preview_task"] = extract_task_id(res)
            log(aid, "preview task", entry["preview_task"])
            MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    for aid, *_ in ASSETS:
        entry = manifest[aid]
        if entry.get("glb") or entry.get("refine_task"):
            continue
        wait_done(mcp, entry["preview_task"], f"{aid}:preview")
        res = mcp.tool("meshy_text_to_3d_refine", {
            "preview_task_id": entry["preview_task"],
            "ai_model": "latest",
            "enable_pbr": False,
            "remove_lighting": True,
            "texture_prompt": "warm ochre, red-brown and gold painted wood, dark outlines, matte, ancient Egyptian tomb-painting palette",
            "target_formats": ["glb"],
        })
        entry["refine_task"] = extract_task_id(res)
        log(aid, "refine task", entry["refine_task"])
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    for aid, *_ in ASSETS:
        entry = manifest[aid]
        if entry.get("glb"):
            continue
        s = wait_done(mcp, entry["refine_task"], f"{aid}:refine")
        urls = s.get("model_urls") or s.get("task", {}).get("model_urls") or {}
        glb_url = urls.get("glb")
        dest = OUT / f"{aid}.glb"
        if glb_url:
            urllib.request.urlretrieve(glb_url, dest)
        else:
            res = mcp.tool("meshy_download_model", {
                "task_id": entry["refine_task"], "task_type": "text-to-3d",
                "format": "glb", "output_dir": str(OUT),
            })
            log(aid, "download tool ->", json.dumps(res)[:200])
            cand = [p for p in OUT.glob("**/*.glb") if aid not in p.name and p != dest]
            if cand and not dest.exists():
                cand[-1].rename(dest)
        entry["glb"] = f"/models/objects/{aid}.glb"
        entry["bytes"] = dest.stat().st_size if dest.exists() else 0
        entry["thumbnail"] = s.get("thumbnail_url") or s.get("task", {}).get("thumbnail_url")
        log(aid, "saved", dest.name, entry["bytes"], "bytes")
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    log("balance after:", mcp.tool("meshy_check_balance", {}))
    log("DONE")


if __name__ == "__main__":
    main()
