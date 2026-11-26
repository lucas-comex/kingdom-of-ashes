"""Build local hero atlases from the licensed FLARE fantasycore source."""
import io
import json
import urllib.request
from pathlib import Path
from PIL import Image

BASE = "https://raw.githubusercontent.com/flareteam/flare-game/c641d2ac2801617f6be3e327454de39250d489b9/mods/fantasycore/"
ROOT = Path(__file__).resolve().parents[1] / "preview"
OUT = ROOT / "assets" / "flare"
STATES = {"stance":4,"run":8,"swing":4,"block":2,"hit":2,"shoot":4,"cast":4,"die":6}
LAYERS = {
    "clothes": ["cloth_sandals","cloth_pants","cloth_gloves","cloth_shirt"],
    "steel_armor": ["plate_boots","plate_greaves","plate_gauntlets","plate_cuirass"],
    "head_short": ["head_short"], "plate_helm": ["plate_helm"],
    "shortsword": ["shortsword"], "shield": ["shield"],
}

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent":"Kingdom-of-Ashes-asset-import"})
    with urllib.request.urlopen(req, timeout=60) as f:
        return f.read()

def load(name):
    png = Image.open(io.BytesIO(fetch("images/avatar/male/" + name + ".png"))).convert("RGBA")
    data = {}
    state = None
    for line in fetch("animations/avatar/male/" + name + ".txt").decode("utf-8").splitlines():
        line = line.strip()
        if line.startswith("[") and line.endswith("]"):
            state = line[1:-1]
        if state in STATES and line.startswith("frame="):
            frame, direction, x, y, w, h, ox, oy = map(int, line[6:].split(","))
            if w > 0 and h > 0:
                data[(state,frame,direction)] = (x,y,w,h,ox,oy)
    return png, data

def main():
    all_data = {}
    for group, names in LAYERS.items():
        sources = [load(n) for n in names]
        atlas = Image.new("RGBA",(8*96,sum(STATES.values())*96))
        metadata = {}
        row = 0
        for state, count in STATES.items():
            metadata[state] = []
            for frame in range(count):
                for direction in range(8):
                    canvas = Image.new("RGBA",(218,218))
                    for png, data in sources:
                        coords = data.get((state,frame,direction))
                        if coords is None:
                            continue
                        x,y,w,h,ox,oy = coords
                        canvas.alpha_composite(png.crop((x,y,x+w,y+h)),(109-ox,186-oy))
                    result = canvas.resize((96,96),Image.Resampling.LANCZOS)
                    if group in ("clothes","steel_armor") and not result.getbbox():
                        raise RuntimeError(f"Missing body: {group} {state} {frame} {direction}")
                    atlas.alpha_composite(result,(direction*96,row*96))
                    metadata[state].append([frame,direction,direction*96,row*96,96,96,48,82])
                row += 1
        atlas.save(OUT / ("hd-"+group+".png"),optimize=True)
        all_data[group] = metadata
        print(group, atlas.size, flush=True)
    (ROOT / "flare-hero-data.js").write_text("window.KOAFlareHeroScale=1;\nwindow.KOAFlareHero="+json.dumps(all_data,separators=(",",":"))+";\n",encoding="utf-8")

if __name__ == "__main__":
    main()
