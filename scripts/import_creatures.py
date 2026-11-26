"""Generate Godot-ready art from a pinned CC BY-SA FLARE source."""
from pathlib import Path
import io, json, re, urllib.request, time
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/creatures'; OUT.mkdir(parents=True,exist_ok=True)
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

for name in ('skeleton','minotaur','wyvern'):
    anim=fetch('mods/fantasycore/animations/enemies/'+name+'.txt').decode()
    sources={}; frames={}; state=''; images={}
    for line in anim.splitlines():
        if line.startswith('image='):
            parts=line[6:].split(',')
            sources[parts[1] if len(parts)>1 else 'default']=parts[0]
        elif line.startswith('['):state=line.strip('[]')
        elif line.startswith('frame='):
            v=line[6:].split(',')
            f,d,x,y,w,h,ox,oy=map(int,v[:8])
            frames[state,f,d]=(x,y,w,h,ox,oy,v[8] if len(v)>8 else 'default')
    states={'stance':1,'run':4,'swing':4,'die':3}
    chosen=[]
    for state,n in states.items():
        for i in range(n):
            for d in range(8):
                options=sorted(k[1] for k in frames if k[0]==state and k[2]==d)
                assert options,(name,state,d)
                chosen.append(frames[state,options[round(i*(len(options)-1)/max(1,n-1))],d])
    factor=min(43/max(max(v[4],v[2]-v[4]) for v in chosen),77/max(v[5] for v in chosen),13/max(1,max(v[3]-v[5] for v in chosen)))
    out=Image.new('RGBA',(768,96*sum(states.values())));meta={};row=0;idx=0
    for state,n in states.items():
        meta[state]=[]
        for i in range(n):
            meta[state].append(row)
            for d in range(8):
                x,y,w,h,ox,oy,src=chosen[idx];idx+=1
                path=sources[src]
                if path not in images:images[path]=image('mods/fantasycore/'+path)
                frame=resize(images[path].crop((x,y,x+w,y+h)),round(w*factor),round(h*factor))
                out.alpha_composite(frame,(d*96+48-round(ox*factor),row*96+82-round(oy*factor)))
            row+=1
    out.save(OUT/(name+'.webp'),lossless=True,method=4)
    (OUT/(name+'.json')).write_text(json.dumps(meta))
(OUT/'SOURCE.md').write_text('FLARE fantasycore skeleton, minotaur and wyvern, CC BY-SA 3.0. Source: '+BASE+'mods/fantasycore/ . Repacked and resized, see ../classic/LICENSE.txt and CREDITS.txt.\n')
print('Creature atlas import complete')
