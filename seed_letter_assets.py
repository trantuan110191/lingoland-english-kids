#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
folder = ROOT / "assets" / "letters"
folder.mkdir(parents=True, exist_ok=True)

COLORS = [
    ("#ff6b6b", "#b91c1c"), ("#4c96fe", "#1d4ed8"), ("#ffd93d", "#a16207"),
    ("#8ff199", "#15803d"), ("#ff8bd1", "#be185d"), ("#a78bfa", "#6d28d9"),
    ("#22d3ee", "#0e7490"), ("#fb923c", "#c2410c")
]

for index, code in enumerate(range(ord("A"), ord("Z") + 1)):
    letter = chr(code)
    (folder / f"{letter.lower()}.svg").write_text(f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <defs>
    <filter id='softShadow' x='-20%' y='-20%' width='140%' height='150%'>
      <feDropShadow dx='0' dy='18' stdDeviation='10' flood-color='#000000' flood-opacity='.16'/>
    </filter>
  </defs>
  <rect width='512' height='512' rx='84' fill='#fffdf7'/>
  <rect x='28' y='28' width='456' height='456' rx='70' fill='none' stroke='#f1e4c8' stroke-width='10'/>
  <text x='256' y='380' text-anchor='middle' font-family='Arial Rounded MT Bold, Arial Black, Baloo 2, Arial, sans-serif' font-size='360' font-weight='900' fill='#1f2937' filter='url(#softShadow)'>{letter}</text>
</svg>
""", encoding="utf-8")

print("Generated 26 letter assets")
