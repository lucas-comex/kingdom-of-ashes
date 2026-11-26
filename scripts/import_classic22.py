"""Import pinned, licensed FLARE assets; no proprietary game assets."""
import io, json, urllib.request, math
from pathlib import Path
from PIL import Image, ImageEnhance, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'preview/assets/classic'
OUT.mkdir(parents=True,exist_ok=True)
REV='c641d2ac2801617f6be3e327454de39250d489b9'
BASE='https://raw.githubusercontent.com/flareteam/flare-game/'+REV+'/'
def get(p):
    with urllib.request.urlopen(urllib.request.Request(BASE+p,headers={'User-Agent':'KOA-classic-import'}),timeout=90) as r:return r.read()
def img(p):return Image.open(io.BytesIO(get(p))).convert('RGBA')
def fit(im,w,h):return im.resize((w,h),Image.Resampling.LANCZOS)
def tiles(kind):
    current=None; entries={}; images={}
    for line in get('mods/fantasycore/tilesetdefs/tileset_'+kind+'.txt').decode().splitlines():
        if line.startswith('img='):current=line[4:]
        if line.startswith('tile='):
            n,x,y,w,h,ox,oy=map(int,line[5:].split(','))
            if current not in images:images[current]=img('mods/fantasycore/'+current)
            entries[n]=(images[current].crop((x,y,x+w,y+h)),ox,oy)
    return entries
grass=tiles('grassland'); dungeon=tiles('dungeon')
material={}
for name,path in [('grass','grassland.png'),('path','path.png'),('stone','brick.png'),('roof','rock_diffuse.png'),('water','water.png'),('wood','crate.png')]:
    material[name]=fit(img('art_src/tilesets/grassland/'+path),256,256)
pieces={}
def ground(tex,variant,color=1):
    # Sample a material then project it into the 2:1 isometric tile; no visible grid outlines.
    x=(variant*37)%128;y=(variant*53)%128
    src=material[tex].crop((x,y,x+128,y+128))
    src=ImageEnhance.Color(src).enhance(.75)
    src=ImageEnhance.Brightness(src).enhance(color)
    dst=src.transform((128,64),Image.Transform.AFFINE,(1,2,-64,-1,2,64),Image.Resampling.BICUBIC)
    mask=Image.new('L',(128,64));ImageDraw.Draw(mask).polygon([(64,0),(127,32),(64,63),(0,32)],fill=255)
    dst.putalpha(mask);return dst
# The first set is the actual rendered grassland floor. Select green full-cover tiles.
def coverage(im):
    d=im.resize((96,48)).convert('RGBA');points=[d.getpixel((x,y)) for y in range(12,36) for x in range(30,66)]
    return sum(p[3]>220 for p in points)/len(points)
def green(im):
    p=[v for v in im.resize((24,12)).getdata() if v[3]>220]
    return sum(v[1]-v[0]*.75-v[2]*.25 for v in p)/max(1,len(p))
candidates=sorted([grass[i][0] for i in range(16,48) if i in grass and coverage(grass[i][0])>.97],key=green,reverse=True)
if len(candidates)<4:raise RuntimeError('Not enough complete grassland tiles')
for i in range(8):
    ground_im=fit(candidates[i%min(6,len(candidates))],128,64)
    for name,brightness in [('meadow',1),('forest',.76),('moor',.80),('highland',.92)]:
        dst=ImageEnhance.Color(ground_im).enhance(.83 if name!='moor' else .45);dst=ImageEnhance.Brightness(dst).enhance(brightness)
        pieces['tile-'+name+'-'+str(i)]=dst
    for name,tex,b in [('road','path',.90),('plaza','stone',.95),('water','water',.78),('bridge','wood',.78)]:
        pieces['tile-'+name+'-'+str(i)]=ground(tex,i,b)
    pieces['floor-crypt-'+str(i)]=fit(dungeon[16+i][0],128,64)
    pieces['floor-sewer-'+str(i)]=ImageEnhance.Color(fit(dungeon[16+i][0],128,64)).enhance(.5)
def prop(entry,size,anchor,scale):
    im,ox,oy=entry;out=Image.new('RGBA',size)
    if not im.getbbox():raise RuntimeError('empty prop')
    factor=min(scale,(size[0]-4)/im.width,(anchor[1]-2)/max(1,oy), (size[1]-anchor[1]-1)/max(1,im.height-oy))
    if factor<=0:raise RuntimeError('invalid anchor')
    im=fit(im,max(1,round(im.width*factor)),max(1,round(im.height*factor)))
    out.alpha_composite(im,(round(anchor[0]-ox*factor),round(anchor[1]-oy*factor)));return out
for kind,ids in [('oak',[248,249,250,251]),('pine',[245,246,247,252]),('autumn',[253,254,255,250]),('dead',[132,133,134,135])]:
    for i,n in enumerate(ids):pieces['tree-'+kind+'-'+str(i)]=prop(grass[n],(192,240),(93,211),.48)
for kind,ids in [('rock',[240,241,242,243]),('cliff',[244,240,242,243]),('shrub',[119,120,121,122]),('dry-shrub',[123,124,125,126]),('flowers',[127,128,129,130]),('mushrooms',[136,137,140,141]),('stump',[112,113,114,115]),('reeds',[116,117,118,119])]:
    for i,n in enumerate(ids):pieces['detail-'+kind+'-'+str(i)]=prop(grass[n],(112,92),(56,75),.52)
for kind in ['crypt','sewer']:
    for i,n in enumerate([64,65,68,69]):pieces['wall-'+kind+'-'+str(i)]=prop(dungeon[n],(160,240),(80,222),.62)
for n,im in material.items():pieces['material-'+n]=im
atlas=Image.new('RGBA',(2048,4096));x=y=height=0;meta={}
for name,im in pieces.items():
    if x+im.width>atlas.width:x=0;y+=height;height=0
    if y+im.height>atlas.height:raise RuntimeError('atlas overflow')
    atlas.alpha_composite(im,(x,y));meta[name]=[x,y,im.width,im.height];x+=im.width;height=max(height,im.height)
atlas=atlas.crop((0,0,2048,y+height));atlas.save(OUT/'landscape.webp',lossless=True,method=4)
states={'stance':[0],'run':[0,2,4,6],'swing':[0,1,2,3],'shoot':[0,2],'cast':[0,2],'block':[0,1],'hit':[0],'die':[0,2,4]}
layers={'shirt':'cloth_shirt','pants':'cloth_pants','feet':'cloth_sandals','hands':'cloth_gloves','armor':'plate_cuirass','legs':'plate_greaves','boots':'plate_boots','helmet':'plate_helm','blade':'shortsword','bow':'shortbow','staff':'staff','wand':'wand','shield':'shield'}
hero={}
for gender in ['male','female']:
    names={**layers,'head':'head_short' if gender=='male' else 'head_long'}
    for layer,name in names.items():
        prefix='mods/fantasycore/'
        source=img(prefix+'images/avatar/'+gender+'/'+name+'.png')
        frames={};state=None
        for line in get(prefix+'animations/avatar/'+gender+'/'+name+'.txt').decode().splitlines():
            line=line.strip()
            if line.startswith('[') and line.endswith(']'):state=line[1:-1]
            if line.startswith('frame=') and state in states:
                frame,dir,x,y,w,h,ox,oy=map(int,line[6:].split(','))
                if w>0 and h>0:frames[state,frame,dir]=(x,y,w,h,ox,oy)
        out=Image.new('RGBA',(8*96,sum(map(len,states.values()))*96));row=0;valid={}
        for state,steps in states.items():
            valid[state]=[]
            for frame in steps:
                mask=0
                for direction in range(8):
                    coord=frames.get((state,frame,direction))
                    if not coord:continue
                    x,y,w,h,ox,oy=coord
                    canvas=Image.new('RGBA',(218,218));canvas.alpha_composite(source.crop((x,y,x+w,y+h)),(109-ox,186-oy))
                    canvas=fit(canvas,96,96)
                    if canvas.getbbox():out.alpha_composite(canvas,(direction*96,row*96));mask|=1<<direction
                valid[state].append([row,mask]);row+=1
        if any(mask!=255 for _,mask in valid['stance']) and layer in ['shirt','pants','feet','hands','head']:raise RuntimeError('missing stance '+gender+' '+layer)
        key=gender+'-'+layer;out.save(OUT/(key+'.webp'),lossless=True,method=3);hero[key]=valid;print(key,flush=True)
(OUT/'LICENSE.txt').write_bytes(get('LICENSE.txt'));(OUT/'CREDITS.txt').write_bytes(get('CREDITS.txt'))
(OUT/'SOURCE.md').write_text('FLARE fantasycore, pinned source https://github.com/flareteam/flare-game/tree/'+REV+' . CC BY-SA 3.0; cropped, resized, material-projected and repacked by Kingdom of Ashes. See LICENSE.txt and CREDITS.txt. These adapted assets are CC BY-SA 3.0.\n')
(ROOT/'preview/classic-data.js').write_text('window.KOAClassicData='+json.dumps({'landscape':meta,'hero':hero,'source':REV},separators=(',',':'))+';\n')
print('Classic landscape pieces:',len(meta),'layer atlases:',len(hero),flush=True)
