"""Generate the provisional German AI voice slice from the canonical dialogue file."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DIALOGUE_FILE = PROJECT_ROOT / "src" / "content" / "dialogue" / "de.json"
PUBLIC_ROOT = PROJECT_ROOT / "public"


async def generate_line(line: dict[str, str]) -> None:
    audio_path = PUBLIC_ROOT / line["audio"].lstrip("/")
    timings_path = PUBLIC_ROOT / line["timings"].lstrip("/")
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    timings_path.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(
        line["text"],
        line["voice"],
        rate=line.get("rate", "+0%"),
        pitch=line.get("pitch", "+0Hz"),
        boundary="WordBoundary",
    )
    timings: list[dict[str, int | str]] = []

    with audio_path.open("wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                timings.append(
                    {
                        "atMs": round(chunk["offset"] / 10_000),
                        "durationMs": round(chunk["duration"] / 10_000),
                        "text": chunk["text"],
                    }
                )

    timings_path.write_text(
        json.dumps(
            {
                "dialogueId": line["id"],
                "speaker": line["speaker"],
                "words": timings,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"VOICE={line['id']} AUDIO={audio_path.relative_to(PROJECT_ROOT)}")


async def main() -> None:
    lines = json.loads(DIALOGUE_FILE.read_text(encoding="utf-8"))
    for line in lines:
        await generate_line(line)


if __name__ == "__main__":
    asyncio.run(main())
