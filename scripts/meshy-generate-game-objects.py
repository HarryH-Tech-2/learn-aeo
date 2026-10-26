"""
Batch 3 of Meshy "sign object" assets — for the games.

  * the remaining uniliteral ("alphabet") objects for Sign Hunt   → public/models/signs/
  * determinative objects for Tomb Wall Decode's 3D reveal        → public/models/objects/

Same MCP driver as scripts/meshy-generate-signs.py.

  MESHY_API_KEY=msy_... python scripts/meshy-generate-game-objects.py
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SIGNS = ROOT / "public" / "models" / "signs"
OBJECTS = ROOT / "public" / "models" / "objects"
MANIFEST = ROOT / "public" / "models" / "objects" / "manifest-games.json"

spec = importlib.util.spec_from_file_location("signs", ROOT / "scripts" / "meshy-generate-signs.py")
signs = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(signs)
Mcp, extract_task_id, wait_done, log, STYLE = signs.Mcp, signs.extract_task_id, signs.wait_done, signs.log, signs.STYLE

# id, out dir, glyph, translit, sign name, subject prompt
ASSETS = [
    ("forearm",  SIGNS,   "𓂝", "ꜥ",   "forearm",            "a human forearm and open hand, palm up, cut at the elbow, lying flat"),
    ("mat",      SIGNS,   "𓊪", "p",   "reed mat",           "a square woven reed mat, thick, seen from an angle above"),
    ("shelter",  SIGNS,   "𓉔", "h",   "reed shelter",       "a small open reed-and-mud courtyard shelter with low walls, seen from above at an angle"),
    ("lamp",     SIGNS,   "𓎛", "ḥ",   "oil lamp with wick", "a shallow clay oil lamp with a twisted flax wick standing up from it"),
    ("linen",    SIGNS,   "𓋴", "s",   "folded cloth",       "a neatly folded piece of white linen cloth with a hanging fringe"),
    ("bolt",     SIGNS,   "𓊃", "z",   "door bolt",          "a horizontal wooden door bolt with two end knobs"),
    ("pool",     SIGNS,   "𓈙", "š",   "garden pool",        "a small rectangular stone-edged garden pool with still blue water, seen from above at an angle"),
    ("stand",    SIGNS,   "𓎼", "g",   "jar-stand",          "a ring-shaped pottery stand for holding a round-bottomed jar"),
    ("tether",   SIGNS,   "𓍿", "ṯ",   "tethering rope",     "a short thick rope tied into a tethering loop with a knot, lying on the ground"),
    ("cobra",    SIGNS,   "𓆓", "ḏ",   "resting cobra",      "a cobra at rest with its body coiled flat and head slightly raised, hood closed, seen from the side"),
    ("goose",    OBJECTS, "𓅬", "ꜣpd", "goose",              "a plump goose standing in profile with its neck up"),
    ("boat",     OBJECTS, "𓊛", "dpt", "boat",               "a small Nile papyrus boat with upturned prow and stern, no sail"),
    ("scribe",   OBJECTS, "𓀀", "sš",  "seated scribe",      "a seated Egyptian scribe statue, cross-legged with a papyrus on his lap, like the Louvre seated scribe"),
]


def main() -> None:
    if not os.environ.get("MESHY_API_KEY"):
        sys.exit("MESHY_API_KEY not set")
    SIGNS.mkdir(parents=True, exist_ok=True)
    OBJECTS.mkdir(parents=True, exist_ok=True)
    mcp = Mcp()
    log("balance:", mcp.tool("meshy_check_balance", {}))
    manifest = json.loads(MANIFEST.read_text("utf-8")) if MANIFEST.exists() else {}

    for aid, out, glyph, tr, meaning, subject in ASSETS:
        entry = manifest.setdefault(aid, {"glyph": glyph, "translit": tr, "meaning": meaning})
        if entry.get("glb"):
            continue
        if not entry.get("preview_task"):
            res = mcp.tool("meshy_text_to_3d", {
                "prompt": STYLE.format(subject=subject),
                "ai_model": "latest", "topology": "triangle", "target_polycount": 6000,
                "should_remesh": True, "target_formats": ["glb"],
            })
            entry["preview_task"] = extract_task_id(res)
            log(aid, "preview task", entry["preview_task"])
            MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    for aid, out, *_ in ASSETS:
        entry = manifest[aid]
        if entry.get("glb") or entry.get("refine_task"):
            continue
        wait_done(mcp, entry["preview_task"], f"{aid}:preview")
        res = mcp.tool("meshy_text_to_3d_refine", {
            "preview_task_id": entry["preview_task"], "ai_model": "latest", "enable_pbr": False, "remove_lighting": True,
            "texture_prompt": "warm ochre, red-brown and gold painted wood, dark outlines, matte, ancient Egyptian tomb-painting palette",
            "target_formats": ["glb"],
        })
        entry["refine_task"] = extract_task_id(res)
        log(aid, "refine task", entry["refine_task"])
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    for aid, out, *_ in ASSETS:
        entry = manifest[aid]
        if entry.get("glb"):
            continue
        s = wait_done(mcp, entry["refine_task"], f"{aid}:refine")
        urls = s.get("model_urls") or s.get("task", {}).get("model_urls") or {}
        dest = out / f"{aid}.glb"
        if urls.get("glb"):
            urllib.request.urlretrieve(urls["glb"], dest)
        else:
            res = mcp.tool("meshy_download_model", {"task_id": entry["refine_task"], "task_type": "text-to-3d", "format": "glb", "output_dir": str(out)})
            log(aid, "download tool ->", json.dumps(res)[:200])
            cand = [p for p in out.glob("**/*.glb") if aid not in p.name and p != dest]
            if cand and not dest.exists():
                cand[-1].rename(dest)
        entry["glb"] = f"/models/{out.name}/{aid}.glb"
        entry["bytes"] = dest.stat().st_size if dest.exists() else 0
        log(aid, "saved", dest.name, entry["bytes"], "bytes")
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    log("balance after:", mcp.tool("meshy_check_balance", {}))
    log("DONE")


if __name__ == "__main__":
    main()
