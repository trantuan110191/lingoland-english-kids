#!/usr/bin/env python3
from pathlib import Path
from urllib.request import urlretrieve
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent
BASE = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/{folder}/3D/{file}_3d.png"

ITEMS = {
    "animals": {
        "dog": "Dog", "cat": "Cat", "bird": "Bird", "fish": "Fish", "cow": "Cow", "pig": "Pig", "monkey": "Monkey", "lion": "Lion",
        "tiger": "Tiger", "rabbit": "Rabbit", "horse": "Horse", "sheep": "Sheep", "goat": "Goat", "duck": "Duck", "chicken": "Chicken",
        "elephant": "Elephant", "giraffe": "Giraffe", "zebra": "Zebra", "bear": "Bear", "panda": "Panda", "frog": "Frog", "mouse": "Mouse",
        "whale": "Whale", "dolphin": "Dolphin"
    },
    "fruits": {
        "apple": "Red apple", "banana": "Banana", "orange": "Tangerine", "grapes": "Grapes", "strawberry": "Strawberry", "watermelon": "Watermelon",
        "pineapple": "Pineapple", "lemon": "Lemon", "peach": "Peach", "cherries": "Cherries"
    },
    "family": {
        "baby": "Baby", "boy": "Boy", "girl": "Girl", "man": "Man", "woman": "Woman", "grandpa": "Old man", "grandma": "Old woman",
        "teacher": "Teacher", "doctor": "Health worker", "cook": "Cook"
    }
}


def asset_url(name: str) -> str:
    folder = name.replace(" ", "%20")
    file = name.lower().replace(" ", "_")
    return BASE.format(folder=folder, file=file)


def main():
    downloaded = 0
    skipped = []
    for topic, items in ITEMS.items():
        folder = ROOT / "assets" / topic
        folder.mkdir(parents=True, exist_ok=True)
        for filename, fluent_name in items.items():
            target = folder / f"{filename}.png"
            try:
                urlretrieve(asset_url(fluent_name), target)
                downloaded += 1
                print(f"3D {topic}/{filename}.png")
            except (HTTPError, URLError, TimeoutError) as exc:
                skipped.append(f"{topic}/{filename}: {fluent_name} ({exc})")
    print(f"Downloaded {downloaded} 3D images")
    if skipped:
        print("Skipped:")
        for item in skipped:
            print(" -", item)

if __name__ == "__main__":
    main()
