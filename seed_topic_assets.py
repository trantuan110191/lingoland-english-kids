#!/usr/bin/env python3
from pathlib import Path
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
TWEMOJI = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/{code}.svg"

TOPICS = {
    "animals": {
        "dog": "1f436",
        "cat": "1f431",
        "bird": "1f426",
        "fish": "1f420",
        "cow": "1f42e",
        "pig": "1f437",
        "monkey": "1f435",
        "lion": "1f981",
        "tiger": "1f42f",
        "rabbit": "1f430",
        "horse": "1f434",
        "sheep": "1f411",
        "goat": "1f410",
        "duck": "1f986",
        "chicken": "1f414",
        "elephant": "1f418",
        "giraffe": "1f992",
        "zebra": "1f993",
        "bear": "1f43b",
        "panda": "1f43c",
        "frog": "1f438",
        "mouse": "1f42d",
        "whale": "1f433",
        "dolphin": "1f42c",
    },
    "fruits": {
        "apple": "1f34e",
        "banana": "1f34c",
        "orange": "1f34a",
        "grapes": "1f347",
        "strawberry": "1f353",
        "watermelon": "1f349",
        "pineapple": "1f34d",
        "lemon": "1f34b",
        "peach": "1f351",
        "cherries": "1f352",
    },
    "family": {
        "baby": "1f476",
        "boy": "1f466",
        "girl": "1f467",
        "man": "1f468",
        "woman": "1f469",
        "grandpa": "1f474",
        "grandma": "1f475",
        "teacher": "1f9d1-200d-1f3eb",
        "doctor": "1f9d1-200d-2695-fe0f",
        "cook": "1f9d1-200d-1f373",
    },
    "vehicles": {
        "airplane": "2708",
        "ambulance": "1f691",
        "bicycle": "1f6b2",
        "boat": "26f5",
        "bus": "1f68c",
        "car": "1f697",
        "fire-truck": "1f692",
        "motorcycle": "1f3cd",
        "rocket": "1f680",
        "taxi": "1f695",
        "train": "1f686",
        "truck": "1f69a",
    },
}

COLORS = {
    "red": "#ef4444",
    "blue": "#3b82f6",
    "yellow": "#facc15",
    "green": "#22c55e",
    "pink": "#ec4899",
    "purple": "#8b5cf6",
    "orange": "#f97316",
    "black": "#111827",
    "white": "#ffffff",
    "brown": "#92400e",
}


def write_svg(path: Path, body: str) -> None:
    path.write_text(body, encoding="utf-8")


def seed_colors() -> None:
    folder = ASSETS / "colors"
    folder.mkdir(parents=True, exist_ok=True)
    for name, color in COLORS.items():
        stroke = "#d1d5db" if name == "white" else "#ffffff"
        write_svg(folder / f"{name}.svg", f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <circle cx='256' cy='256' r='158' fill='{color}' stroke='{stroke}' stroke-width='18'/>
  <circle cx='198' cy='186' r='38' fill='rgba(255,255,255,.45)'/>
</svg>\n""")


def seed_numbers() -> None:
    folder = ASSETS / "numbers"
    folder.mkdir(parents=True, exist_ok=True)
    colors = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1", "#06b6d4"]
    words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
    for idx, word in enumerate(words, start=1):
        color = colors[idx - 1]
        write_svg(folder / f"{word}.svg", f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <circle cx='256' cy='256' r='176' fill='{color}'/>
  <text x='256' y='326' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='210' font-weight='900' fill='white'>{idx}</text>
</svg>\n""")


def download_twemoji() -> None:
    for topic, items in TOPICS.items():
        folder = ASSETS / topic
        folder.mkdir(parents=True, exist_ok=True)
        for word, code in items.items():
            target = folder / f"{word}.svg"
            if target.exists():
                continue
            urlretrieve(TWEMOJI.format(code=code), target)
            print(f"Downloaded {topic}/{word}.svg")


def main() -> None:
    seed_colors()
    seed_numbers()
    download_twemoji()
    print("Seed assets complete")


if __name__ == "__main__":
    main()
