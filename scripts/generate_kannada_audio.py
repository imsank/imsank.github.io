"""Generate prototype MP3s from the app's phrase data using online edge-tts.

Usage: python generate_kannada_audio.py --app-dir PATH --output PATH
Requires edge-tts==7.2.8 and Node.js; no API key. Sends phrase text to Microsoft.
"""
import argparse
import asyncio
import json
from pathlib import Path
import subprocess

import edge_tts


async def generate(app_dir, output, voice):
    available = await edge_tts.list_voices()
    if not any(v["ShortName"] == voice for v in available):
        raise RuntimeError(f"Requested voice is unavailable: {voice}")
    module = (app_dir / "phrases.mjs").resolve().as_uri()
    phrases = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e",
         f"import {{ phrases }} from {json.dumps(module)}; console.log(JSON.stringify(phrases));"],
        encoding="utf-8"))
    output.mkdir(parents=True, exist_ok=True)
    manifest = {"generator": "edge-tts 7.2.8", "voice": voice, "rate": "+0%", "phrases": []}
    for phrase in phrases:
        phrase_id = phrase["id"]
        if not phrase_id or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789-" for c in phrase_id):
            raise ValueError("Unsafe phrase id")
        destination = output / f"{phrase_id}.mp3"
        temporary = destination.with_suffix(".mp3.part")
        try:
            await edge_tts.Communicate(phrase["kannada"], voice, rate="+0%").save(str(temporary))
            if temporary.stat().st_size < 1000:
                raise RuntimeError(f"Audio file is unexpectedly small: {phrase_id}")
            temporary.replace(destination)
        finally:
            temporary.unlink(missing_ok=True)
        manifest["phrases"].append({"id": phrase_id, "text": phrase["kannada"], "file": destination.name})
        print(f"Generated {destination.name}: {destination.stat().st_size} bytes", flush=True)
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--voice", default="kn-IN-SapnaNeural")
    args = parser.parse_args()
    asyncio.run(generate(args.app_dir, args.output, args.voice))
