"""
Generate the first batch of 3D "sign object" assets via the Meshy MCP server.

Drives `npx -y @meshy-ai/meshy-mcp-server` over stdio (JSON-RPC, newline
delimited) so we use exactly the same tool surface Claude Code uses.

  MESHY_API_KEY=msy_... python scripts/meshy-generate-signs.py

Outputs:
  public/models/signs/<id>.glb
  public/models/signs/manifest.json   (id, glyph, translit, meaning, task ids)
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "models" / "signs"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST = OUT / "manifest.json"

STYLE = (
    "low-poly stylised ancient Egyptian painted wooden sculpture of {subject}, "
    "clean readable silhouette, warm ochre and gold paint with dark outlines, "
    "sitting on a small plain sandstone base, centered, game asset, no text"
)

ASSETS = [
    # id,        glyph,  translit, meaning / sign name,          subject prompt
    ("owl",      "𓅓",   "m",  "owl",                     "a perched barn owl facing forward"),
    ("chick",    "𓅱",   "w",  "quail chick",             "a plump quail chick standing"),
    ("reed",     "𓇋",   "i",  "reed leaf",               "a single flowering reed stalk with one leaf"),
    ("loaf",     "𓏏",   "t",  "bread loaf",              "a small round domed loaf of bread"),
    ("basket",   "𓎡",   "k",  "basket with handle",      "a woven wicker basket with a handle"),
    ("viper",    "𓆑",   "f",  "horned viper",            "a coiled horned viper snake with two small horns"),
    ("hand",     "𓂧",   "d",  "hand",                    "an open human hand, palm facing up"),
    ("lion",     "𓃭",   "l",  "lion",                    "a lion lying down with head raised, sphinx-like"),
    ("leg",      "𓃀",   "b",  "foot / lower leg",        "a human lower leg and bare foot"),
    ("water",    "𓈖",   "n",  "ripple of water",         "a zigzag ripple of water carved as a flat relief wave"),
]


class Mcp:
    def __init__(self) -> None:
        env = dict(os.environ)
        self.p = subprocess.Popen(
            ["npx", "-y", "@meshy-ai/meshy-mcp-server"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            env=env,
            shell=sys.platform == "win32",
            text=True,
            encoding="utf-8",
            bufsize=1,
        )
        self._id = 0
        self._pending: dict[int, dict] = {}
        self._lock = threading.Lock()
        self._cv = threading.Condition(self._lock)
        threading.Thread(target=self._reader, daemon=True).start()
        self.call_raw("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "signs-batch", "version": "0"},
        })
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def _send(self, obj: dict) -> None:
        assert self.p.stdin
        self.p.stdin.write(json.dumps(obj) + "\n")
        self.p.stdin.flush()

    def _reader(self) -> None:
        assert self.p.stdout
        for line in self.p.stdout:
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "id" in msg and ("result" in msg or "error" in msg):
                with self._cv:
                    self._pending[msg["id"]] = msg
                    self._cv.notify_all()

    def call_raw(self, method: str, params: dict, timeout: float = 400) -> dict:
        with self._lock:
            self._id += 1
            rid = self._id
        self._send({"jsonrpc": "2.0", "id": rid, "method": method, "params": params})
        deadline = time.time() + timeout
        with self._cv:
            while rid not in self._pending:
                remaining = deadline - time.time()
                if remaining <= 0:
                    raise TimeoutError(f"{method} timed out")
                self._cv.wait(remaining)
            msg = self._pending.pop(rid)
        if "error" in msg:
            raise RuntimeError(json.dumps(msg["error"]))
        return msg["result"]

    def tool(self, name: str, args: dict, timeout: float = 400) -> dict:
        res = self.call_raw("tools/call", {"name": name, "arguments": args}, timeout)
        if res.get("isError"):
            raise RuntimeError(f"{name}: {json.dumps(res)[:500]}")
        sc = res.get("structuredContent")
        if sc is not None:
            return sc
        # fall back to parsing text content
        text = "".join(c.get("text", "") for c in res.get("content", []) if c.get("type") == "text")
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"text": text}


def log(*a: object) -> None:
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def extract_task_id(res: dict) -> str:
    for k in ("task_id", "id", "result"):
        v = res.get(k)
        if isinstance(v, str) and len(v) > 8:
            return v
    txt = json.dumps(res)
    import re
    m = re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", txt)
    if not m:
        raise RuntimeError(f"no task id in {txt[:300]}")
    return m.group(0)


def status(mcp: Mcp, task_id: str) -> dict:
    return mcp.tool("meshy_get_task_status", {
        "task_id": task_id, "task_type": "text-to-3d", "wait": True,
        "timeout_seconds": 300, "response_format": "json",
    }, timeout=330)


def wait_done(mcp: Mcp, task_id: str, label: str) -> dict:
    for _ in range(6):  # up to ~30 min
        s = status(mcp, task_id)
        st = (s.get("status") or s.get("task", {}).get("status") or "").upper()
        if st == "SUCCEEDED":
            return s
        if st in ("FAILED", "CANCELED", "EXPIRED"):
            raise RuntimeError(f"{label} {st}: {json.dumps(s)[:300]}")
        log(label, "still", st or "pending", "- waiting more")
    raise TimeoutError(label)


def main() -> None:
    if not os.environ.get("MESHY_API_KEY"):
        sys.exit("MESHY_API_KEY not set")
    mcp = Mcp()
    log("balance:", mcp.tool("meshy_check_balance", {}))

    manifest = json.loads(MANIFEST.read_text("utf-8")) if MANIFEST.exists() else {}

    # 1) kick off all previews
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

    # 2) wait for previews, kick off refines
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

    # 3) wait for refines, download GLBs
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
            # fall back to the MCP download tool
            res = mcp.tool("meshy_download_model", {
                "task_id": entry["refine_task"], "task_type": "text-to-3d",
                "format": "glb", "output_dir": str(OUT),
            })
            log(aid, "download tool ->", json.dumps(res)[:200])
            cand = [p for p in OUT.glob("**/*.glb") if aid not in p.name and p != dest]
            if cand and not dest.exists():
                cand[-1].rename(dest)
        entry["glb"] = f"/models/signs/{aid}.glb"
        entry["bytes"] = dest.stat().st_size if dest.exists() else 0
        entry["thumbnail"] = s.get("thumbnail_url") or s.get("task", {}).get("thumbnail_url")
        log(aid, "saved", dest.name, entry["bytes"], "bytes")
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), "utf-8")

    log("balance after:", mcp.tool("meshy_check_balance", {}))
    log("DONE")


if __name__ == "__main__":
    main()
