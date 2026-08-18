from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"

for filename, pixels in {
    "icon.png": 512,
    "splash-icon.png": 512,
    "favicon.png": 256,
    "android-icon-foreground.png": 512,
}.items():
    target = ASSETS / filename
    with Image.open(target) as source:
        image = source.convert("RGBA")
        image.thumbnail((pixels, pixels), Image.Resampling.LANCZOS)
        image.save(target, format="PNG", optimize=True, compress_level=9)
