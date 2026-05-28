#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
folder = ROOT / "assets" / "shapes"
folder.mkdir(parents=True, exist_ok=True)

SHAPES = {
    "circle": "<circle cx='256' cy='256' r='150' fill='#4c96fe'/>",
    "square": "<rect x='116' y='116' width='280' height='280' rx='34' fill='#ff7a59'/>",
    "triangle": "<path d='M256 92 L426 396 H86 Z' fill='#ffd93d'/>",
    "rectangle": "<rect x='88' y='154' width='336' height='204' rx='32' fill='#8ff199'/>",
    "star": "<path d='M256 72 305 190 432 200 335 282 365 406 256 340 147 406 177 282 80 200 207 190 Z' fill='#ffe173'/>",
    "heart": "<path d='M256 410 C118 292 82 246 82 172 C82 112 128 74 184 74 C216 74 241 90 256 116 C271 90 296 74 328 74 C384 74 430 112 430 172 C430 246 394 292 256 410 Z' fill='#ff5c8a'/>",
    "oval": "<ellipse cx='256' cy='256' rx='172' ry='118' fill='#a78bfa'/>",
    "diamond": "<path d='M256 68 L444 256 L256 444 L68 256 Z' fill='#14b8a6'/>",
}

for name, shape in SHAPES.items():
    (folder / f"{name}.svg").write_text(f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='96' fill='#fff7ed'/>
  <g filter='drop-shadow(0 18px 16px rgba(0,0,0,.16))'>
    {shape}
  </g>
  <circle cx='190' cy='160' r='28' fill='rgba(255,255,255,.5)'/>
</svg>
""", encoding="utf-8")
print(f"Generated {len(SHAPES)} shape assets")
