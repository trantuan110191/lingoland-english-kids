#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "assets-vocabulary.js"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
TOPICS = ["colors", "numbers", "letters", "fruits", "animals", "family", "shapes", "vehicles", "clothes", "office"]


def make_word(path: Path) -> str:
    name = path.stem.strip()
    name = re.sub(r"^\d+[-_\s]*", "", name)
    name = re.sub(r"[-_]+", " ", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name.title() if name else path.stem.title()


def image_items(folder: Path) -> list[dict[str, str]]:
    by_word = {}
    priority = {".png": 3, ".webp": 2, ".jpg": 2, ".jpeg": 2, ".gif": 1, ".svg": 0}
    if not folder.exists():
        return []
    for path in sorted(folder.iterdir(), key=lambda item: item.name.lower()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            word = make_word(path)
            current = by_word.get(word)
            if current and priority[path.suffix.lower()] <= priority[Path(current["image"]).suffix.lower()]:
                continue
            relative_path = path.relative_to(ROOT).as_posix()
            by_word[word] = {"word": word, "vi": word, "image": relative_path}
    return list(by_word.values())


def main() -> None:
    ASSETS.mkdir(exist_ok=True)
    data = {}
    total = 0
    for topic in TOPICS:
        folder = ASSETS / topic
        folder.mkdir(exist_ok=True)
        data[topic] = image_items(folder)
        total += len(data[topic])

    content = "window.assetVocabulary = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Generated {OUTPUT.name} with {total} words in {len(TOPICS)} topics")


if __name__ == "__main__":
    main()
