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
    "clothes": {
        "bag": "1f392",
        "coat": "1f9e5",
        "dress": "1f457",
        "glasses": "1f453",
        "handbag": "1f45c",
        "hat": "1f9e2",
        "pants": "1f456",
        "shirt": "1f455",
        "shoes": "1f45f",
        "socks": "1f9e6",
        "tie": "1f454",
        "watch": "231a",
    },
    "office": {
        "briefcase": "1f4bc",
        "calendar": "1f4c5",
        "file-cabinet": "1f5c4",
        "folder": "1f4c1",
        "keyboard": "2328",
        "laptop": "1f4bb",
        "memo": "1f4dd",
        "mouse": "1f5b1",
        "paperclip": "1f4ce",
        "pencil": "270f",
        "printer": "1f5a8",
        "ruler": "1f4cf",
        "scissors": "2702",
        "telephone": "260e",
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

DRINKS = {
    "apple-juice": {"kind": "carton", "fill": "#f59e0b", "label": "APPLE"},
    "bubble-tea": {"kind": "bubble", "fill": "#c084fc", "label": "BOBA"},
    "coca-cola": {"kind": "can", "fill": "#dc2626", "label": "COLA"},
    "coffee": {"kind": "mug", "fill": "#92400e", "label": "COFFEE"},
    "hot-chocolate": {"kind": "mug", "fill": "#7c2d12", "label": "COCOA"},
    "lemonade": {"kind": "cup", "fill": "#fde047", "label": "LEMON"},
    "milk": {"kind": "glass", "fill": "#f8fafc", "label": "MILK"},
    "orange-juice": {"kind": "carton", "fill": "#fb923c", "label": "ORANGE"},
    "soda": {"kind": "cup", "fill": "#38bdf8", "label": "SODA"},
    "smoothie": {"kind": "cup", "fill": "#f472b6", "label": "SMOOTHIE"},
    "tea": {"kind": "mug", "fill": "#d97706", "label": "TEA"},
    "water": {"kind": "glass", "fill": "#60a5fa", "label": "WATER"},
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


def drink_svg(kind: str, fill: str, label: str) -> str:
    if kind == "carton":
        return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <path d='M156 132h184l42 74v202c0 34-28 62-62 62H192c-34 0-62-28-62-62V206l26-74z' fill='#e0f2fe'/>
  <path d='M156 132h184l42 74H130l26-74z' fill='#bae6fd'/>
  <rect x='170' y='222' width='172' height='150' rx='28' fill='{fill}'/>
  <circle cx='214' cy='270' r='28' fill='rgba(255,255,255,.45)'/>
  <text x='256' y='338' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='38' font-weight='900' fill='white'>{label}</text>
</svg>\n"""
    if kind == "can":
        return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <rect x='150' y='76' width='212' height='360' rx='58' fill='{fill}'/>
  <ellipse cx='256' cy='86' rx='86' ry='28' fill='#fecaca'/>
  <ellipse cx='256' cy='436' rx='86' ry='28' fill='#991b1b'/>
  <path d='M170 190c52-56 120 58 172 0' fill='none' stroke='white' stroke-width='22' stroke-linecap='round'/>
  <text x='256' y='294' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='64' font-weight='900' fill='white'>{label}</text>
</svg>\n"""
    if kind == "mug":
        return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <rect x='118' y='172' width='230' height='200' rx='44' fill='#e0f2fe'/>
  <path d='M346 212h34c38 0 68 30 68 68s-30 68-68 68h-34' fill='none' stroke='#93c5fd' stroke-width='32' stroke-linecap='round'/>
  <rect x='142' y='206' width='182' height='120' rx='32' fill='{fill}'/>
  <path d='M188 118c-20 28 20 42 0 70M248 110c-20 28 20 42 0 70M308 118c-20 28 20 42 0 70' fill='none' stroke='#94a3b8' stroke-width='14' stroke-linecap='round'/>
  <text x='233' y='294' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='38' font-weight='900' fill='white'>{label}</text>
</svg>\n"""
    if kind == "bubble":
        return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <path d='M154 138h204l-30 298H184L154 138z' fill='#fdf2f8' stroke='#f9a8d4' stroke-width='18' stroke-linejoin='round'/>
  <path d='M172 246h168l-18 168H190l-18-168z' fill='{fill}'/>
  <path d='M326 72l-78 222' stroke='#0f172a' stroke-width='18' stroke-linecap='round'/>
  <circle cx='216' cy='364' r='18' fill='#422006'/>
  <circle cx='260' cy='386' r='18' fill='#422006'/>
  <circle cx='292' cy='350' r='18' fill='#422006'/>
  <text x='256' y='228' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='44' font-weight='900' fill='#831843'>{label}</text>
</svg>\n"""
    if kind == "glass":
        text_color = "#075985" if label != "MILK" else "#334155"
        return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <path d='M158 126h196l-34 312H192L158 126z' fill='#eff6ff' stroke='#bfdbfe' stroke-width='18' stroke-linejoin='round'/>
  <path d='M184 230h144l-20 172H204l-20-172z' fill='{fill}'/>
  <circle cx='226' cy='284' r='24' fill='rgba(255,255,255,.55)'/>
  <text x='256' y='356' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='42' font-weight='900' fill='{text_color}'>{label}</text>
</svg>\n"""
    return f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <path d='M154 136h204l-32 298H186L154 136z' fill='#f8fafc' stroke='#cbd5e1' stroke-width='18' stroke-linejoin='round'/>
  <path d='M176 228h160l-20 180H196l-20-180z' fill='{fill}'/>
  <path d='M334 82l-96 232' stroke='#0f172a' stroke-width='18' stroke-linecap='round'/>
  <circle cx='226' cy='282' r='24' fill='rgba(255,255,255,.45)'/>
  <text x='256' y='354' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial, sans-serif' font-size='38' font-weight='900' fill='#0f172a'>{label}</text>
</svg>\n"""


def seed_drinks() -> None:
    folder = ASSETS / "drinks"
    folder.mkdir(parents=True, exist_ok=True)
    for name, data in DRINKS.items():
        write_svg(folder / f"{name}.svg", drink_svg(data["kind"], data["fill"], data["label"]))


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
    seed_drinks()
    download_twemoji()
    print("Seed assets complete")


if __name__ == "__main__":
    main()
