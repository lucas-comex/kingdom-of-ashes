"""Generate Godot-ready art from a pinned CC BY-SA FLARE source."""
from pathlib import Path
import io, json, re, urllib.request, time
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/imported'; OUT.mkdir(parents=True,exist_ok=True)
REV='c641d2ac2801617f6be3e327454de39250d489b9'
BASE='https://raw.githubusercontent.com/flareteam/flare-game/'+REV+'/'
def fetch(path):
    for n in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(BASE+path,headers={'User-Agent':'KOA-Reborn'}),timeout=90) as f:return f.read()
        except Exception:
            if n==2:raise
            time.sleep(2)
def image(path):return Image.open(io.BytesIO(fetch(path))).convert('RGBA')
def resize(im,w,h):return im.resize((max(1,w),max(1,h)),Image.Resampling.LANCZOS)
m=fetch('mods/alpha_demo/maps/frontier_outpost.txt').decode()
layers={}
for part in m.split('[layer]')[1:]:
    name=re.search(r'type=(\w+)',part).group(1)
    raw=part.split('data=\n',1)[1].split('\n\n',1)[0].strip()
    layers[name]=[[int(v) for v in row.split(',') if v] for row in raw.splitlines()]
assert all(len(a)==64 and all(len(row)==64 for row in a) for a in layers.values())
data=fetch('mods/fantasycore/tilesetdefs/tileset_grassland.txt').decode()
tile={};images={};source=''
used=set(n for name in ['background','object'] for row in layers[name] for n in row if n)
for line in data.splitlines():
    if line.startswith('img='):source=line[4:]
    if line.startswith('tile='):
        n,x,y,w,h,ox,oy=map(int,line[5:].split(','))
        if n not in used:continue
        if source not in images:images[source]=image('mods/fantasycore/'+source)
        im=resize(images[source].crop((x,y,x+w,y+h)),round(w/3),round(h/3))
        tile[n]=(im,round(ox/3),round(oy/3))
assert used<=set(tile),used-set(tile)
def iso(x,y):return 2048+(x-y)*32,32+(x+y)*16
ground=Image.new('RGBA',(4096,2112),(17,19,15,255))
for y,row in enumerate(layers['background']):
    for x,n in enumerate(row):
        if n:
            im,ox,oy=tile[n];a,b=iso(x,y);ground.alpha_composite(im,(a-ox,b-oy))
ground.convert('RGB').save(OUT/'ground.webp',quality=91,method=4)
atlas=Image.new('RGBA',(2048,2048));rects={};x=y=h=0
for n in sorted(set(v for row in layers['object'] for v in row if v)):
    im,ox,oy=tile[n]
    if x+im.width+2>atlas.width:x=0;y+=h;h=0
    assert y+im.height+2<=atlas.height,'atlas overflow'
    atlas.alpha_composite(im,(x+1,y+1));rects[n]=[x+1,y+1,im.width,im.height,ox,oy];x+=im.width+2;h=max(h,im.height+2)
atlas.crop((0,0,2048,y+h)).save(OUT/'objects.webp',lossless=True,method=4)
objects=[[x,y,*rects[n]] for y,row in enumerate(layers['object']) for x,n in enumerate(row) if n]
walk=[[int(layers['collision'][y][x]==0 and layers['background'][y][x]!=0) for x in range(64)] for y in range(64)]
(OUT/'map.json').write_text(json.dumps({'objects':objects,'walk':walk},separators=(',',':')))
mini=Image.new('RGB',(64,64));mini.putdata([(105,120,75) if walk[y][x] else (43,64,63) if layers['background'][y][x] in range(144,208) else (33,35,28) for y in range(64) for x in range(64)])
mini.resize((192,192),Image.Resampling.NEAREST).save(OUT/'minimap.webp',lossless=True)
source=image('mods/fantasycore/images/enemies/goblin.png')
anim=fetch('mods/fantasycore/animations/enemies/goblin.txt').decode()
frames={};state=''
for line in anim.splitlines():
    if line.startswith('['):state=line.strip('[]')
    if line.startswith('frame='):
        f,d,x,y,w,h,ox,oy=map(int,line[6:].split(','));frames[(state,f,d)]=(x,y,w,h,ox,oy)
states={'stance':[0],'run':[0,1,2,3],'swing':[0,1,2,3],'die':[0,2,4]}
out=Image.new('RGBA',(768,96*sum(map(len,states.values()))));meta={};row=0
for state,steps in states.items():
    meta[state]=[]
    for f in steps:
        meta[state].append(row)
        for d in range(8):
            available=[k[1] for k in frames if k[0]==state and k[2]==d]
            nearest=min(available,key=lambda v:abs(v-f))
            x,y,w,h,ox,oy=frames[state,nearest,d]
            c=Image.new('RGBA',(218,218));c.alpha_composite(source.crop((x,y,x+w,y+h)),(109-ox,186-oy))
            out.alpha_composite(resize(c,96,96),(d*96,row*96))
        row+=1
out.save(OUT/'goblin.webp',lossless=True,method=4)
(OUT/'goblin.json').write_text(json.dumps(meta))
(OUT/'SOURCE.md').write_text('Prototype environment adapted from FLARE Alpha Demo Frontier Outpost; tiles and goblin from fantasycore. Source: https://github.com/flareteam/flare-game/tree/'+REV+' . CC BY-SA 3.0. Cropped, resized, repacked and gameplay adapted. See ../classic/LICENSE.txt and CREDITS.txt. This imported map is a visual test, not an original Kingdom of Ashes world.\n')
print('Imported',len(objects),'objects;',len(used),'tiles; goblin frames',row)
