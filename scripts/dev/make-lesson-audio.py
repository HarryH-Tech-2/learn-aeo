"""
Record every line the written lessons say aloud, with a neural voice, into public/audio/lesson/.

  npx tsx scripts/dev/lesson-audio-lines.ts > lines.json
  pip install edge-tts
  python scripts/dev/make-lesson-audio.py lines.json

Only lines without a recording are made; manifest.json (key -> file) is rewritten each run. The key is
clipKeyOf() in src/lib/speech.ts, so the page finds the clip for exactly the text it would have spoken.
"""
import asyncio
import json
import sys
from pathlib import Path

import edge_tts

VOICE = "en-GB-SoniaNeural"
RATE = "-12%"
OUT = Path(__file__).resolve().parents[2] / "public" / "audio" / "lesson"


async def record(text: str, path: Path) -> None:
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(path))


async def main(lines_file: str) -> None:
    lines = json.loads(Path(lines_file).read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for line in lines:
        name = f"{line['key']}.mp3"
        path = OUT / name
        if not path.exists() or path.stat().st_size == 0:
            try:
                await record(line["text"], path)
            except edge_tts.exceptions.NoAudioReceived:
                # a lone letter ("h", "z") can come back empty; said as a letter name it records
                try:
                    await record(line["text"] + ".", path)
                except edge_tts.exceptions.NoAudioReceived:
                    print("NO AUDIO for", repr(line["text"]), "- left to the browser voice")
                    path.unlink(missing_ok=True)
                    continue
            print("recorded", line["text"])
        manifest[line["key"]] = name
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1, sort_keys=True), encoding="utf-8")
    print(len(manifest), "lines in", OUT)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
