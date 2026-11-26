extends Node2D
const Actor = preload("res://characters/actor.gd")
const HUD = preload("res://interface/hud.gd")
const STEP: float = 2.65
const WALK_SECONDS: float = 1.0 / STEP
const START = Vector2i(24,38)
const HUNT = Vector2i(32,38)
const CAPITAL_START = Vector2i(24,32)
const CAPITAL_GATE = Vector2i(8,32)
const CAPITAL_MERCHANT = Vector2(26,32)
const OUTPOST_GATE = Vector2i(18,39)
var map: Dictionary
var grid := AStarGrid2D.new()
var ordered := Node2D.new()
var hero: Actor
var enemy: Actor
var hud: HUD
var cam := Camera2D.new()
var pos := Vector2(CAPITAL_START)
var area: String = "capital"
var background: Sprite2D
var static_objects: Array[Sprite2D] = []
var hud_clock: float = 0.0
var cull_clock: float = 0.0
var cull_center := Vector2(INF,INF)
var cull_zoom: float = -1.0
var reachable: Dictionary = {}
var fps_clock: float = 0.0
var has_gear: bool = false
const SPECIES = {
	"goblin":{"name":"Goblin saqueador","hp":60,"damage":8,"gold":25,"xp":50,"respawn":35.0,"speed":1.65,"scale":1.0,"loot":"Moeda antiga"},
	"skeleton":{"name":"Esqueleto guerreiro","hp":95,"damage":11,"gold":38,"xp":85,"respawn":45.0,"speed":1.45,"scale":1.2,"loot":"Fragmento de osso"},
	"minotaur":{"name":"Minotauro","hp":180,"damage":18,"gold":80,"xp":160,"respawn":75.0,"speed":1.25,"scale":1.65,"loot":"Chifre de minotauro"},
	"wyvern":{"name":"Wyvern das cinzas","hp":260,"damage":24,"gold":140,"xp":250,"respawn":100.0,"speed":1.8,"scale":1.85,"loot":"Escama de wyvern"}
}
var creatures: Array[Dictionary] = []
var selected: int = -1
var trophies: Dictionary = {}
var bestiary: Dictionary = {}
const ITEMS = {
	"sword":{"name":"Espada de ferro","price":20,"attack":10,"defense":0,"icon":Rect2(1053,516,198,248)},
	"shield":{"name":"Escudo de ferro","price":18,"attack":0,"defense":3,"icon":Rect2(40,772,175,248)},
	"armor":{"name":"Armadura de aço","price":30,"attack":0,"defense":2,"icon":Rect2(266,772,235,248)},
	"helmet":{"name":"Elmo de ferro","price":16,"attack":0,"defense":1,"icon":Rect2(549,772,181,248)},
	"boots":{"name":"Botas reforçadas","price":14,"attack":0,"defense":1,"icon":Rect2(788,775,215,242)},
	"legs":{"name":"Grevas de aço","price":18,"attack":0,"defense":1,"icon":Rect2(266,772,235,248)}
}
var owned_gear: Dictionary = {}
var equipped_gear: Dictionary = {}
var save_clock: float = 0.0
var save_disabled: bool = false
const SAVE_PATH = "user://koa-reborn-07.json"
var mouse_walk: bool = false
var repath_clock: float = 0.0
var aim: int = -1
var mana: float = 100.0
var cooldowns: Array[float] = [0.0,0.0,0.0,0.0]
const SKILL_NAMES = ["Corte amplo","Lança arcana","Campo gélido","Fúria das cinzas"]
const SKILL_RANGE = [2.6,6.0,5.0,5.0]
const SKILL_COST = [8.0,14.0,20.0,35.0]
const SKILL_CD = [3.0,5.0,8.0,18.0]
var effect_time: float = 0.0
var effect_from := Vector2.ZERO
var effect_to := Vector2.ZERO
var effect_kind: int = 0
var slow_time: float = 0.0
var npc_clock: float = 0.0
var enemy_pos := Vector2(HUNT)
var route: Array[Vector2i] = []
var enemy_route: Array[Vector2i] = []
var destination: Vector2i = START
var target: bool = false
var attack_time: float = 0.0
var enemy_attack: float = 0.0
var think: float = 0.0
var respawn: float = 0.0
var gold: int = 0
var kills: int = 0
var message: String = "WASD • Espaço para atacar • F para saquear"
var playing: bool = false
var step_from := Vector2(CAPITAL_START)
var step_to := Vector2(CAPITAL_START)
var step_elapsed: float = WALK_SECONDS
var step_duration: float = WALK_SECONDS
var urban_count: int = 0
var urban_lots: Array[Vector2i] = []
var residents: Array[Dictionary] = []
var attack_requested: bool = false
var loot_gold: int = 0
var xp: int = 0
var level: int = 1
var potions: int = 0
var quest_claimed: bool = false
var tex: Dictionary = {}

func read_json(path: String) -> Dictionary:
	var data = JSON.parse_string(FileAccess.get_file_as_string(path))
	return data if data is Dictionary else {}

func iso(p: Vector2) -> Vector2:
	return Vector2(2048.0+(p.x-p.y)*32.0, 32.0+(p.x+p.y)*16.0)

func uniso(p: Vector2) -> Vector2:
	var q: Vector2 = p - Vector2(2048,32)
	return Vector2(q.x/64+q.y/32,-q.x/64+q.y/32)

func image(path: String) -> Texture2D:
	if not tex.has(path):
		tex[path] = load(path)
	return tex[path]

func _ready() -> void:
	ordered.y_sort_enabled = true
	add_child(ordered)
	background = Sprite2D.new()
	background.centered = false
	background.z_index = -5
	add_child(background)
	hero = Actor.new()
	hero.frames = read_json("res://assets/hero_frames.json")
	load_hero_layers()
	ordered.add_child(hero)
	hero.position = iso(pos)
	hero.scale = Vector2(.82,.82)
	hero.equipment = false
	hero.gear=equipped_gear
	load_area("capital")
	cam.position = hero.position + Vector2(0,-28)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 12.0
	add_child(cam)
	cam.make_current()
	hud = HUD.new()
	add_child(hud)
	hud.build(self)
	hud.set_area("res://assets/capital/minimap.webp")
	if "--smoke" in OS.get_cmdline_user_args() or "--capture" in OS.get_cmdline_user_args():
		start_game()
	if "--smoke" in OS.get_cmdline_user_args():
		call_deferred("smoke")
	elif "--capture" in OS.get_cmdline_user_args():
		call_deferred("capture")

func load_hero_layers() -> void:
	var layers: Array[String]=["feet","pants","shirt","head","hands"]
	for id in equipped_gear:
		var names: Dictionary={"sword":"blade","shield":"shield","armor":"armor","helmet":"helmet","boots":"boots","legs":"legs"}
		if names.has(id):
			layers.append(str(names[id]))
	for name in layers:
		var key: String=hero.gender+"-"+name
		if not hero.textures.has(key):
			hero.textures[key]=image("res://assets/classic/"+key+".webp")

func rebuild_reachable(start: Vector2i) -> void:
	reachable.clear()
	if not valid(start):
		return
	var queue: Array[Vector2i]=[start]
	reachable[start]=true
	var index: int=0
	while index<queue.size():
		var at: Vector2i=queue[index]
		index+=1
		for d in [Vector2i.LEFT,Vector2i.RIGHT,Vector2i.UP,Vector2i.DOWN]:
			var next: Vector2i=at+d
			if valid(next) and not reachable.has(next):
				reachable[next]=true
				queue.append(next)

func merchant_cell() -> Vector2:
	return CAPITAL_MERCHANT if area=="capital" else Vector2(23,39)

func area_title() -> String:
	return "CAPITAL DO REINO" if area=="capital" else "FRONTEIRA DE ASHES"

func load_area(next_area: String) -> void:
	area = next_area
	for creature in creatures:
		creature["actor"].queue_free()
	creatures.clear()
	selected=-1
	for node in static_objects:
		node.queue_free()
	static_objects.clear()
	for resident in residents:
		resident["actor"].queue_free()
	residents.clear()
	urban_count = 0
	urban_lots.clear()
	var folder: String = "res://assets/capital" if area=="capital" else "res://assets/imported"
	map = read_json(folder+"/map.json")
	if map.is_empty():
		push_error("Mapa ausente: "+folder)
		get_tree().quit(2)
		return
	background.texture = image(folder+"/ground.webp")
	var atlas: Texture2D = image(folder+"/objects.webp")
	for obj in map.objects:
		var spr := Sprite2D.new()
		spr.texture = atlas
		spr.region_enabled = true
		spr.region_rect = Rect2(obj[2],obj[3],obj[4],obj[5])
		spr.region_filter_clip_enabled = true
		spr.centered = false
		spr.offset = -Vector2(obj[6],obj[7])
		spr.position = iso(Vector2(obj[0],obj[1]))
		ordered.add_child(spr)
		static_objects.append(spr)
	grid.region = Rect2i(0,0,64,64)
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	grid.update()
	for y in range(64):
		for x in range(64):
			grid.set_point_solid(Vector2i(x,y), int(map.walk[y][x]) != 1)

	if area=="outpost":
		build_urban_extension()
	rebuild_reachable(CAPITAL_START if area=="capital" else START)
	if area=="outpost":
		spawn_creatures()
	var npcs: Dictionary = read_json("res://assets/npc_frames.json")
	var list: Array = [["knight","Guarda Real",Vector2i(22,32)],["wandering_trader","Mercador",Vector2i(26,32)],["peasant_man1","Ferreiro",Vector2i(27,32)],["peasant_woman1","Moradora",Vector2i(28,32)],["knight","Sentinela do portão",Vector2i(8,32)],["peasant_man1","Bram, carpinteiro",Vector2i(20,32)],["peasant_woman1","Elara, herbalista",Vector2i(29,22)],["knight","Capitão Roderic",Vector2i(30,44)],["peasant_man1","Oren, padeiro",Vector2i(34,42)],["wandering_trader","Merek, viajante",Vector2i(37,24)],["peasant_woman1","Irmã Helena",Vector2i(44,30)]] if area=="capital" else [["knight","Guarda de Ashes",Vector2i(24,35)],["wandering_trader","Mercador",Vector2i(23,39)],["peasant_man1","Ferreiro",Vector2i(25,40)],["peasant_woman1","Moradora",Vector2i(20,39)],["knight","Sentinela do portão",Vector2i(24,40)],["peasant_man1","Bram, carpinteiro",Vector2i(26,41)],["peasant_woman1","Elara, herbalista",Vector2i(27,43)],["knight","Capitão Roderic",Vector2i(30,42)],["peasant_man1","Oren, padeiro",Vector2i(35,43)],["wandering_trader","Merek, viajante",Vector2i(41,43)],["peasant_woman1","Irmã Helena",Vector2i(45,44)],["peasant_man1","Tomas, lenhador",Vector2i(18,45)],["knight","Vigia do leste",Vector2i(46,48)]]
	for info in list:
		var person: Actor = Actor.new()
		person.kind = "npc"
		person.npc_name = info[0]
		person.frames = npcs
		person.textures[info[0]] = image("res://assets/npcs/"+info[0]+".png")
		person.actor_label = info[1]
		person.position = iso(Vector2(info[2]))
		ordered.add_child(person)
		var anchor: Vector2 = Vector2(info[2])
		var npc_route: Array[Vector2i] = []
		residents.append({"actor":person,"name":info[1],"cell":anchor,"anchor":anchor,"route":npc_route,"wait":randf_range(1.0,4.0),"fixed":str(info[1]) in ["Mercador","Ferreiro","Sentinela do portão"]})

	pos = Vector2(CAPITAL_START if area=="capital" else START)
	step_from=pos
	step_to=pos
	step_duration=WALK_SECONDS
	step_elapsed=WALK_SECONDS
	hero.position=iso(pos)
	target=false
	route.clear()
	destination=Vector2i(-1,-1)
	mouse_walk=false
	aim=-1
	effect_time=0.0
	slow_time=0.0
	enemy_route.clear()
	queue_redraw()
	attack_requested=false
	attack_time=0.0
	if is_instance_valid(hud):
		hud.set_area(folder+"/minimap.webp")
	cam.position=hero.position+Vector2(0,-28)
	if cam.is_inside_tree():
		cam.reset_smoothing()
	cull_center=Vector2(INF,INF)
	cull_objects()
	message="Clique esquerdo para andar. Botão direito no portão oeste para viajar." if area=="capital" else "Botão direito no posto de viagem para voltar."

func spawn_creatures() -> void:
	var sites: Array = [["goblin",Vector2i(32,38)],["goblin",Vector2i(37,41)],["skeleton",Vector2i(38,44)],["skeleton",Vector2i(44,43)],["minotaur",Vector2i(44,48)],["wyvern",Vector2i(45,52)]]
	for site in sites:
		var id: String = site[0]
		var home: Vector2i = site[1]
		if not valid(home) or path(START,home).is_empty():
			continue
		var stats: Dictionary = SPECIES[id]
		var actor: Actor = Actor.new()
		actor.kind="monster"
		var folder: String = "res://assets/imported/" if id=="goblin" else "res://assets/creatures/"
		actor.frames=read_json(folder+id+".json")
		actor.textures["monster"]=image(folder+id+".webp")
		actor.actor_label=stats["name"]
		actor.max_hp=stats["hp"]
		actor.hp=actor.max_hp
		actor.scale=Vector2.ONE*float(stats["scale"])
		actor.position=iso(Vector2(home))
		ordered.add_child(actor)
		var steps: Array[Vector2i]=[]
		creatures.append({"id":id,"actor":actor,"pos":Vector2(home),"home":Vector2(home),"route":steps,"think":0.0,"attack":0.0,"respawn":0.0,"slow":0.0,"loot":false})

func creature_at(click: Vector2) -> int:
	var best: int = -1
	var distance: float = 44.0
	for index in range(creatures.size()):
		var actor: Actor = creatures[index]["actor"]
		if not actor.visible:
			continue
		var d: float = click.distance_to(actor.position-Vector2(0,24.0*actor.scale.x))
		if d<distance:
			best=index
			distance=d
	return best

func tick_creatures(dt: float) -> void:
	for c in creatures:
		var actor: Actor = c["actor"]
		var stats: Dictionary = SPECIES[c["id"]]
		var at: Vector2 = c["pos"]
		var home: Vector2 = c["home"]
		var distance: float = at.distance_to(pos)
		var show: bool=distance<18.0
		if actor.visible!=show:
			actor.visible=show
		actor.set_name_visible(distance<9.0)
		if actor.hp<=0:
			c["respawn"]=float(c["respawn"])-dt
			actor.animate("die",dt)
			if c["respawn"]<=0.0:
				actor.hp=actor.max_hp
				actor.animate("stance",0.0)
				c["loot"]=false
				c["pos"]=home
				actor.position=iso(home)
				actor.queue_redraw()
			continue
		c["attack"]=maxf(0.0,float(c["attack"])-dt)
		c["slow"]=maxf(0.0,float(c["slow"])-dt)
		if not show and at.distance_to(home)<.01:
			continue
		var chasing: bool = distance<6.0 and pos.distance_to(home)<10.0
		var steps: Array[Vector2i] = c["route"]
		var attack: bool = chasing and distance<=1.4 and clear_line(at,pos)
		if attack:
			steps.clear()
			actor.face(iso(pos)-iso(at))
			if c["attack"]<=0.0:
				c["attack"]=1.15
				hero.hp=maxi(0,hero.hp-maxi(1,int(stats["damage"])-defense_value()))
		else:
			c["think"]=float(c["think"])-dt
			if c["think"]<=0.0:
				c["think"]=.5
				steps=path(cell(at),cell(pos if chasing else home))
				c["route"]=steps
			var next: Vector2 = advance(at,steps,dt,float(stats["speed"])*(.55 if c["slow"]>0.0 else 1.0))
			if next.distance_to(at)>.0001:
				actor.face(iso(next)-iso(at))
				c["pos"]=next
				actor.position=iso(next)
		actor.animate("swing" if attack and c["attack"]>.65 else ("run" if Vector2(c["pos"]).distance_to(at)>.0001 else "stance"),dt)

func damage_creature(index: int, amount: int) -> void:
	if index<0 or index>=creatures.size():
		return
	var c: Dictionary=creatures[index]
	var actor: Actor=c["actor"]
	if actor.hp<=0:
		return
	actor.hp=maxi(0,actor.hp-amount)
	actor.queue_redraw()
	message="%s · %d de dano" % [actor.actor_label,amount]
	if actor.hp==0:
		var stats: Dictionary=SPECIES[c["id"]]
		kills+=1
		bestiary[c["id"]]=int(bestiary.get(c["id"],0))+1
		xp+=int(stats["xp"])
		while xp>=level*150:
			xp-=level*150
			level+=1
		c["loot"]=true
		c["respawn"]=stats["respawn"]
		c["route"].clear()
		actor.animate("die",0.0)
		if selected==index:
			selected=-1
			target=false
		message=actor.actor_label+" derrotado • botão direito para saquear"
		save_progress()

func loot_creature(index: int) -> bool:
	if index<0 or index>=creatures.size():
		return false
	var c: Dictionary=creatures[index]
	if not c["loot"] or pos.distance_to(c["pos"])>2.0:
		message="Aproxime-se do cadáver."
		return false
	var stats: Dictionary=SPECIES[c["id"]]
	gold+=int(stats["gold"])
	trophies[c["id"]]=int(trophies.get(c["id"],0))+1
	c["loot"]=false
	message="+%d ouro · %s" % [stats["gold"],stats["loot"]]
	save_progress()
	return true

func cull_objects() -> void:
	var center: Vector2=hero.position
	if center.distance_squared_to(cull_center)<576.0 and is_equal_approx(cull_zoom,cam.zoom.x):
		return
	cull_center=center
	cull_zoom=cam.zoom.x
	var extent: Vector2=get_viewport_rect().size/(2.0*cam.zoom.x)+Vector2(145,155)
	var screen_rect:=Rect2(center-extent,extent*2.0)
	for spr in static_objects:
		var rect: Rect2=spr.get_rect()
		var bounds:=Rect2(spr.position+rect.position*spr.scale,rect.size*spr.scale)
		var show: bool=screen_rect.intersects(bounds)
		if spr.visible!=show:
			spr.visible=show

func build_urban_extension() -> void:
	var atlas := image("res://assets/kingdom-art-v1.webp")
	if atlas == null:
		return
	var lots := [
		[Vector2i(19,43),Rect2(516,1313,248,190),154.0],
		[Vector2i(23,43),Rect2(772,1302,248,211),150.0],
		[Vector2i(33,43),Rect2(1028,1314,248,188),148.0],
		[Vector2i(15,39),Rect2(1028,1314,248,188),144.0],
		[Vector2i(42,41),Rect2(516,1313,248,190),164.0],
		[Vector2i(46,42),Rect2(1818,1284,203,248),146.0],
		[Vector2i(43,46),Rect2(1028,1314,248,188),148.0],
		[Vector2i(47,46),Rect2(772,1302,248,211),150.0],
		[Vector2i(19,50),Rect2(1818,1284,203,248),146.0],
		[Vector2i(47,50),Rect2(1028,1314,248,188),144.0]
	]
	for lot in lots:
		var cell_pos: Vector2i = lot[0]
		var footprint: Array[Vector2i] = [cell_pos,cell_pos+Vector2i(-1,0),cell_pos+Vector2i(0,-1),cell_pos+Vector2i(-1,-1)]
		var clear := true
		for point in footprint:
			if not valid(point):
				clear = false
		if not clear:
			continue
		var art := AtlasTexture.new()
		art.atlas = atlas
		art.region = lot[1]
		art.filter_clip = true
		var spr := Sprite2D.new()
		spr.texture = art
		spr.centered = false
		spr.offset = Vector2(-art.get_width()/2.0,-art.get_height())
		spr.position = iso(Vector2(cell_pos))
		var ratio: float = float(lot[2])/art.get_width()
		spr.scale = Vector2.ONE*ratio
		ordered.add_child(spr)
		static_objects.append(spr)
		for point in footprint:
			grid.set_point_solid(point,true)
		urban_count += 1
		urban_lots.append(cell_pos)

func valid(p: Vector2i) -> bool:
	return grid.is_in_boundsv(p) and not grid.is_point_solid(p)

func cell(p: Vector2) -> Vector2i:
	return Vector2i(roundi(p.x),roundi(p.y))

func nearest(p: Vector2i) -> Vector2i:
	if valid(p):
		return p
	for r in range(1,5):
		for y in range(-r,r+1):
			for x in range(-r,r+1):
				var q := p+Vector2i(x,y)
				if valid(q):
					return q
	return cell(pos)

func path(from: Vector2i, to: Vector2i) -> Array[Vector2i]:
	if not valid(from) or not valid(to):
		return []
	var out: Array[Vector2i] = grid.get_id_path(from,to)
	if not out.is_empty():
		out.pop_front()
	return out

func walk_to(p: Vector2i) -> void:
	var origin: Vector2i = cell(step_to) if step_elapsed<step_duration else cell(pos)
	var requested: Vector2i = p.clamp(Vector2i.ZERO,Vector2i(63,63))
	if requested==destination:
		return
	destination=requested
	route.clear()
	if requested==origin:
		return
	if reachable.has(requested):
		route=path(origin,requested)
		if not route.is_empty():
			return
	# Clicks on buildings find an accessible nearby tile rather than crossing walls.
	for radius in range(1,5):
		for dy in range(-radius,radius+1):
			for dx in range(-radius,radius+1):
				if maxi(absi(dx),absi(dy))!=radius:
					continue
				var candidate := requested+Vector2i(dx,dy)
				if not reachable.has(candidate):
					continue
				if candidate==origin:
					return
				var candidate_route := path(origin,candidate)
				if not candidate_route.is_empty():
					route=candidate_route
					return

func move_route(dt: float) -> bool:
	var remaining: float = dt
	var moved: bool = false
	while remaining>0.00001:
		if step_elapsed>=step_duration:
			if route.is_empty():
				break
			var from := cell(pos)
			var next: Vector2i = route.pop_front()
			if next==from:
				continue
			if not can_step(from,next):
				route.clear()
				break
			step_from=Vector2(from)
			step_to=Vector2(next)
			step_duration=WALK_SECONDS*Vector2(next-from).length()
			step_elapsed=0.0
			hero.face(iso(step_to)-iso(step_from))
		var part: float = minf(remaining,step_duration-step_elapsed)
		step_elapsed=minf(step_duration,step_elapsed+part)
		remaining-=part
		pos=step_from.lerp(step_to,step_elapsed/step_duration)
		moved=true
	return moved

func stop_route() -> void:
	mouse_walk=false
	destination=Vector2i(-1,-1)
	route.clear()
	queue_redraw()

func tick_residents(dt: float) -> void:
	for resident in residents:
		var actor: Actor = resident["actor"]
		var at: Vector2 = resident["cell"]
		var distance: float=at.distance_squared_to(pos)
		var show: bool=distance<225.0
		if actor.visible!=show:
			actor.visible=show
		actor.set_name_visible(distance<64.0)
		if resident["fixed"] or not show:
			continue
		var steps: Array[Vector2i] = resident["route"]
		if steps.is_empty():
			resident["wait"]=float(resident["wait"])-dt
			if resident["wait"]<=0.0:
				resident["wait"]=randf_range(2.0,5.0)
				var anchor: Vector2 = resident["anchor"]
				var to := cell(anchor)+Vector2i(randi_range(-3,3),randi_range(-3,3))
				if valid(to) and to.distance_to(cell(pos))>1.0:
					steps=path(cell(at),to)
					resident["route"]=steps
		var next := advance(at,steps,dt,1.15)
		var moving: bool = next.distance_to(at)>.0001
		if moving:
			actor.face(iso(next)-iso(at))
			resident["cell"]=next
			actor.position=iso(next)
		actor.animate("run" if moving else "stance",dt)

func begin_aim(index: int) -> void:
	if not playing:
		return
	stop_route()
	if aim==index:
		aim=-1
	elif cooldowns[index]>0.0:
		message="Habilidade em recarga."
	elif mana<SKILL_COST[index]:
		message="Mana insuficiente."
	else:
		aim=index
		message=SKILL_NAMES[index]+" • mire e clique. Esc cancela."
	queue_redraw()

func clear_line(from: Vector2, to: Vector2) -> bool:
	var samples: int = maxi(1,ceili(from.distance_to(to)*5.0))
	for n in range(1,samples+1):
		if not valid(cell(from.lerp(to,float(n)/samples))):
			return false
	return true

func cast_at(point: Vector2) -> bool:
	if aim<0:
		return false
	var index: int = aim
	var d: Vector2 = point-pos
	if area!="outpost":
		message="Habilidades de combate apenas fora da cidade."
		aim=-1
		queue_redraw()
		return false
	if d.length()>SKILL_RANGE[index] or not clear_line(pos,point):
		message="Alvo fora de alcance ou atrás de obstáculo."
		return false
	if cooldowns[index]>0.0 or mana<SKILL_COST[index]:
		aim=-1
		return false
	var hits: Array[int]=[]
	for n in range(creatures.size()):
		var c: Dictionary=creatures[n]
		var actor: Actor=c["actor"]
		var at: Vector2=c["pos"]
		if actor.hp<=0 or not clear_line(pos,at):
			continue
		var hit: bool=false
		match index:
			0: hit=at.distance_to(pos)<=2.6 and d.normalized().dot((at-pos).normalized())>=.45
			1: hit=Geometry2D.get_closest_point_to_segment(at,pos,point).distance_to(at)<=.70
			2: hit=at.distance_to(point)<=1.8
			3: hit=at.distance_to(point)<=2.5
		if hit:
			hits.append(n)
	mana-=SKILL_COST[index]
	cooldowns[index]=SKILL_CD[index]
	hero.face(iso(point)-iso(pos))
	attack_time=.40
	effect_kind=index
	effect_from=iso(pos)
	effect_to=iso(point)
	effect_time=.4
	aim=-1
	message=SKILL_NAMES[index]+(" acertou!" if not hits.is_empty() else " • errou o alvo.")
	for n in hits:
		if index==2:
			creatures[n]["slow"]=3.0
		damage_creature(n,[22,30,20,55][index])
	queue_redraw()
	return true

func _draw() -> void:
	if not playing:
		return
	if not route.is_empty():
		draw_arc(iso(Vector2(route.back())),11.0,0.0,TAU,24,Color("#d8c88d"),2.0,true)
	if aim>=0:
		var at := iso(pos)
		var reach: float = SKILL_RANGE[aim]
		var ellipse := PackedVector2Array()
		for n in range(65):
			var angle: float = TAU*n/64.0
			ellipse.append(iso(pos+Vector2(cos(angle),sin(angle))*reach))
		draw_polyline(ellipse,Color(0.77,0.83,0.93,.8),2.0,true)
		var mouse := get_global_mouse_position()
		var allowed: bool = uniso(mouse).distance_to(pos)<=reach
		var tint := Color("#a4c5ee") if allowed else Color("#ce6666")
		draw_line(at,mouse,tint,2.0,true)
		var radius: float = 18.0 if aim<2 else (46.0 if aim==2 else 65.0)
		draw_arc(mouse,radius,0.0,TAU,48,tint,2.0,true)
	if effect_time>0.0:
		var tint: Color = [Color("#e4c08a"),Color("#94cfff"),Color("#a8e3ec"),Color("#e67843")][effect_kind]
		if effect_kind<2:
			draw_line(effect_from,effect_to,tint,5.0,true)
		else:
			draw_arc(effect_to,46.0 if effect_kind==2 else 65.0,0.0,TAU,48,tint,4.0,true)
	if target and selected>=0 and selected<creatures.size():
		draw_arc(iso(creatures[selected]["pos"]),19.0,0.0,TAU,36,Color("#dba85b"),2.0,true)

func advance(p: Vector2, steps: Array[Vector2i], dt: float, speed: float) -> Vector2:
	if steps.is_empty():
		return p
	var goal := Vector2(steps[0])
	var next: Vector2 = p.move_toward(goal,dt*speed)
	if next.distance_to(goal)<0.001:
		steps.pop_front()
	return next

func start_game() -> void:
	playing = true
	save_disabled="--smoke" in OS.get_cmdline_user_args() or "--capture" in OS.get_cmdline_user_args()
	if not save_disabled:
		restore_progress()
	hud.close_login()
	hud.update_view()

func save_progress() -> bool:
	if save_disabled or not playing:
		return false
	var file := FileAccess.open(SAVE_PATH,FileAccess.WRITE)
	if file==null:
		return false
	file.store_string(JSON.stringify({"version":1,"gold":gold,"xp":xp,"level":level,"kills":kills,"potions":potions,"quest_claimed":quest_claimed,"owned":owned_gear,"equipped":equipped_gear,"bestiary":bestiary,"trophies":trophies}))
	file.close()
	return true

func restore_progress() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var data := read_json(SAVE_PATH)
	if int(data.get("version",0))!=1:
		return
	gold=clampi(int(data.get("gold",0)),0,9999999)
	xp=clampi(int(data.get("xp",0)),0,9999999)
	level=clampi(int(data.get("level",1)),1,10000)
	kills=clampi(int(data.get("kills",0)),0,9999999)
	potions=clampi(int(data.get("potions",0)),0,999)
	quest_claimed=data.get("quest_claimed",false)==true
	var inventory: Variant = data.get("owned",{})
	var equipped: Variant = data.get("equipped",{})
	if inventory is Dictionary and equipped is Dictionary:
		for id in ITEMS:
			if inventory.get(id,false)==true:
				owned_gear[id]=true
				if equipped.get(id,false)==true:
					equipped_gear[id]=true
	for id in SPECIES:
		bestiary[id]=clampi(int(data.get("bestiary",{}).get(id,0)),0,999999)
		trophies[id]=clampi(int(data.get("trophies",{}).get(id,0)),0,999999)
	refresh_equipment()
	message="Progresso local recuperado. Bem-vindo à capital."

func manual_save() -> void:
	message="Progresso salvo neste navegador." if save_progress() else "Não foi possível salvar o progresso."
	hud.update_view()

func can_step(from: Vector2i, to: Vector2i) -> bool:
	var d := to - from
	return valid(to) and (d.x == 0 or d.y == 0 or (valid(from + Vector2i(d.x,0)) and valid(from + Vector2i(0,d.y))))

func read_movement() -> Vector2:
	var left: bool = Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT)
	var right: bool = Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT)
	var up: bool = Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP)
	var down: bool = Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN)
	var screen := Vector2(float(right)-float(left),float(down)-float(up))
	if screen==Vector2.ZERO:
		if Input.is_physical_key_pressed(KEY_KP_7): return Vector2(-1,-1)
		if Input.is_physical_key_pressed(KEY_KP_9): return Vector2(1,-1)
		if Input.is_physical_key_pressed(KEY_KP_1): return Vector2(-1,1)
		if Input.is_physical_key_pressed(KEY_KP_3): return Vector2(1,1)
	return screen

func screen_step(screen: Vector2) -> Vector2i:
	var x: int = signi(roundi(screen.x))
	var y: int = signi(roundi(screen.y))
	return Vector2i(signi(x+y),signi(y-x))

func choose_step(from: Vector2i, screen: Vector2) -> Vector2i:
	var direct := screen_step(screen)
	if direct==Vector2i.ZERO:
		return Vector2i.ZERO
	if can_step(from,from+direct):
		return direct
	if screen.x!=0.0 and screen.y!=0.0:
		for component in [Vector2(screen.x,0),Vector2(0,screen.y)]:
			var alternative := screen_step(component)
			if can_step(from,from+alternative):
				return alternative
	return Vector2i.ZERO

func move_input(screen: Vector2, dt: float) -> bool:
	var remaining: float = maxf(0.0,dt)
	var moved: bool = false
	while remaining>0.00001:
		if step_elapsed >= step_duration:
			var from := cell(pos)
			var d := choose_step(from,screen)
			if d==Vector2i.ZERO:
				break
			step_from = Vector2(from)
			step_to = Vector2(from+d)
			step_duration = WALK_SECONDS * Vector2(d).length()
			step_elapsed = 0.0
			hero.face(iso(step_to)-iso(step_from))
		var part: float = minf(remaining,step_duration-step_elapsed)
		step_elapsed = minf(step_duration,step_elapsed+part)
		remaining -= part
		pos = step_from.lerp(step_to,step_elapsed/step_duration)
		moved=true
	return moved

func collect_loot() -> void:
	for n in range(creatures.size()):
		if creatures[n]["loot"] and pos.distance_to(creatures[n]["pos"])<=2.0:
			loot_creature(n)
			return
	message="Aproxime-se do cadáver para saquear."

func use_potion() -> void:
	if potions <= 0 or hero.hp >= hero.max_hp:
		return
	potions -= 1
	hero.hp = mini(hero.max_hp,hero.hp+45)
	message = "Poção utilizada."
	save_progress()

func interact() -> void:
	if area=="capital" and pos.distance_to(Vector2(CAPITAL_GATE))<=2.0:
		load_area("outpost")
		return
	if area=="outpost" and pos.distance_to(Vector2(OUTPOST_GATE))<=2.0:
		load_area("capital")
		return
	for n in range(creatures.size()):
		if creatures[n]["loot"] and pos.distance_to(creatures[n]["pos"])<=2.0:
			loot_creature(n)
			return
	if pos.distance_to(merchant_cell())<=2.5:
		if kills >= 3 and not quest_claimed:
			quest_claimed = true
			gold += 100
			xp += 100
			message = "Contrato concluído: +100 ouro e XP"
		else:
			hud.open_shop()
			message = "Mercador: escolha o que deseja comprar."
	else:
		var best: Dictionary = {}
		var distance: float = 2.0
		for resident in residents:
			var d: float = pos.distance_to(resident["cell"])
			if d < distance:
				best = resident
				distance = d
		if best.is_empty():
			message = "Aproxime-se de um morador ou do loot."
		else:
			var lines: Dictionary = {"Elara, herbalista":"As ervas crescem junto às trilhas da floresta.","Capitão Roderic":"Os goblins ameaçam a estrada a leste.","Irmã Helena":"Que a luz proteja sua jornada.","Merek, viajante":"A vila está crescendo. Explore as novas ruas.","Bram, carpinteiro":"Estamos construindo novas moradias."}
			message = str(best["name"]) + ": " + str(lines.get(best["name"],"Bem-vindo ao posto de Ashes."))

func buy_potion() -> void:
	if not playing or pos.distance_to(merchant_cell()) > 2.5:
		message = "Aproxime-se do mercador."
		return
	if gold < 12:
		message = "Ouro insuficiente."
		return
	gold -= 12
	potions += 1
	message = "Poção comprada por 12 ouro."
	save_progress()
	hud.update_view()

func _unhandled_input(event: InputEvent) -> void:
	if not playing or not is_instance_valid(hero):
		return
	if event is InputEventMouseButton:
		if not event.pressed:
			if event.button_index==MOUSE_BUTTON_LEFT:
				mouse_walk=false
			return
		var click: Vector2 = get_global_mouse_position()
		match event.button_index:
			MOUSE_BUTTON_WHEEL_UP:
				cam.zoom = Vector2.ONE * minf(1.7,cam.zoom.x+.1)
			MOUSE_BUTTON_WHEEL_DOWN:
				cam.zoom = Vector2.ONE * maxf(.8,cam.zoom.x-.1)
			MOUSE_BUTTON_LEFT:
				var clicked_enemy: int = creature_at(click)
				if aim>=0:
					cast_at(creatures[clicked_enemy]["pos"] if clicked_enemy>=0 else uniso(click))
				elif clicked_enemy>=0:
					stop_route()
					selected=clicked_enemy
					var actor: Actor=creatures[selected]["actor"]
					target=actor.hp>0
					message="Alvo selecionado. Espaço ou QWER para atacar." if target else "Botão direito para saquear."
				else:
					target=false
					mouse_walk=true
					repath_clock=.25
					destination=Vector2i(-1,-1)
					walk_to(cell(uniso(click)))
				queue_redraw()
			MOUSE_BUTTON_RIGHT:
				if aim>=0:
					aim=-1
					queue_redraw()
					return
				stop_route()
				var clicked_cell := uniso(click)
				var corpse: int=creature_at(click)
				if corpse>=0 and creatures[corpse]["loot"]:
					loot_creature(corpse)
				elif clicked_cell.distance_to(Vector2(CAPITAL_GATE if area=="capital" else OUTPOST_GATE))<=2.0:
					if pos.distance_to(Vector2(CAPITAL_GATE if area=="capital" else OUTPOST_GATE))<=2.0:
						load_area("outpost" if area=="capital" else "capital")
					else:
						message="Aproxime-se do portão."
				else:
					var clicked: bool = false
					for resident in residents:
						var actor: Actor = resident["actor"]
						if click.distance_to(actor.position-Vector2(0,25))<33.0:
							clicked=true
							if pos.distance_to(resident["cell"])<=2.5:
								interact()
							else:
								message="Aproxime-se do morador."
							break
					if not clicked:
						message="Botão direito: interaja com portões, NPCs e corpos."
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_Q: begin_aim(0)
			KEY_W: begin_aim(1)
			KEY_E: begin_aim(2)
			KEY_R: begin_aim(3)
			KEY_ESCAPE:
				aim=-1
				stop_route()
				queue_redraw()
			KEY_SPACE:
				attack_requested = true
			KEY_F:
				interact()
			KEY_J:
				use_potion()
			KEY_I:
				hud.toggle_bag()
			KEY_K:
				toggle_equipment()
			KEY_G:
				toggle_gender()

func item_icon(id: String) -> Texture2D:
	var icon := AtlasTexture.new()
	icon.atlas=image("res://assets/kingdom-art-v1.webp")
	icon.region=ITEMS[id]["icon"]
	icon.filter_clip=true
	return icon

func attack_value() -> int:
	var total: int = 10
	for id in equipped_gear:
		total+=int(ITEMS[id]["attack"])
	return total

func defense_value() -> int:
	var total: int = 0
	for id in equipped_gear:
		total+=int(ITEMS[id]["defense"])
	return total

func refresh_equipment() -> void:
	has_gear=not owned_gear.is_empty()
	hero.equipment=not equipped_gear.is_empty()
	hero.gear=equipped_gear
	load_hero_layers()
	hero.queue_redraw()

func buy_item(id: String) -> bool:
	if not ITEMS.has(id) or not playing or pos.distance_to(merchant_cell())>2.5:
		message="Aproxime-se do mercador."
		return false
	if owned_gear.has(id):
		message="Você já possui este equipamento."
		return false
	var price: int = ITEMS[id]["price"]
	if gold<price:
		message="Ouro insuficiente."
		return false
	gold-=price
	owned_gear[id]=true
	refresh_equipment()
	message=str(ITEMS[id]["name"])+" adquirido."
	save_progress()
	hud.update_view()
	return true

func equip_item(id: String) -> bool:
	if not owned_gear.has(id):
		return false
	if equipped_gear.has(id):
		equipped_gear.erase(id)
		message=str(ITEMS[id]["name"])+" retirado."
	else:
		equipped_gear[id]=true
		message=str(ITEMS[id]["name"])+" equipado."
	refresh_equipment()
	save_progress()
	hud.update_view()
	return true

func toggle_equipment() -> void:
	hud.toggle_bag()

func toggle_gender() -> void:
	hero.gender = "female" if hero.gender == "male" else "male"
	load_hero_layers()
	hero.queue_redraw()

func _physics_process(dt: float) -> void:
	if not playing or not is_instance_valid(hero):
		return
	attack_time = maxf(0,attack_time-dt)
	enemy_attack = maxf(0,enemy_attack-dt)
	mana=minf(100.0,mana+dt*2.0)
	for n in range(4):
		cooldowns[n]=maxf(0.0,cooldowns[n]-dt)
	slow_time=maxf(0.0,slow_time-dt)
	if effect_time>0.0:
		effect_time=maxf(0.0,effect_time-dt)
		queue_redraw()
	if mouse_walk and not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		mouse_walk=false
	repath_clock-=dt
	if mouse_walk and aim<0 and repath_clock<=0.0:
		repath_clock=.25
		walk_to(cell(uniso(get_global_mouse_position())))
	var moving := move_route(dt)
	if aim>=0 or target or (moving and route.is_empty()):
		queue_redraw()
	tick_residents(dt)
	if attack_requested:
		attack_requested=false
		if target and selected>=0 and selected<creatures.size():
			var at: Vector2=creatures[selected]["pos"]
			if pos.distance_to(at)<=1.5 and attack_time<=0 and clear_line(pos,at):
				hero.face(iso(at)-iso(pos))
				attack_time=.52
				damage_creature(selected,attack_value())
			else:
				message="Aproxime-se do inimigo."
	if moving and attack_time<=0:
		hero.sync_walk(step_elapsed/step_duration)
	else:
		hero.animate("swing" if attack_time>0 else "stance",dt)
	hero.position=iso(pos)
	tick_creatures(dt)
	if hero.hp<=0:
		hero.hp=hero.max_hp
		load_area("capital")
		pos=Vector2(CAPITAL_START)
		step_from=pos
		step_to=pos
		step_duration=WALK_SECONDS
		step_elapsed=WALK_SECONDS
		route.clear()
		target=false
		enemy_pos=Vector2(HUNT)
		message="Você voltou à capital."
	cam.position=hero.position+Vector2(0,-28)
	fps_clock+=dt
	if fps_clock>=1.0:
		fps_clock=0.0
		if OS.has_feature("web"):
			JavaScriptBridge.eval("window.koaFPS="+str(Engine.get_frames_per_second()))
	save_clock+=dt
	if save_clock>=20.0:
		save_clock=0.0
		save_progress()
	hud_clock+=dt
	cull_clock+=dt
	if hud_clock>=.20:
		hud_clock=0.0
		hud.update_view()
	if cull_clock>=.25:
		cull_clock=0.0
		cull_objects()

func test_movement() -> void:
	var origin := Vector2i(-1,-1)
	for yy in range(2,62):
		for xx in range(2,62):
			var clear: bool = true
			for dy in range(-1,2):
				for dx in range(-1,2):
					if not valid(Vector2i(xx+dx,yy+dy)):
						clear=false
			if clear:
				origin=Vector2i(xx,yy)
				break
		if origin.x>=0:
			break
	assert(origin.x>=0,"No open area for movement test")
	var directions: Array[Vector2] = [Vector2(0,-1),Vector2(1,-1),Vector2(1,0),Vector2(1,1),Vector2(0,1),Vector2(-1,1),Vector2(-1,0),Vector2(-1,-1)]
	var expected: Array[Vector2i] = [Vector2i(-1,-1),Vector2i(0,-1),Vector2i(1,-1),Vector2i(1,0),Vector2i(1,1),Vector2i(0,1),Vector2i(-1,1),Vector2i(-1,0)]
	for index in range(8):
		pos=Vector2(origin)
		step_from=pos
		step_to=pos
		step_duration=WALK_SECONDS
		step_elapsed=step_duration
		assert(screen_step(directions[index])==expected[index])
		var seconds: float = WALK_SECONDS*Vector2(expected[index]).length()
		assert(move_input(directions[index],seconds*.5))
		assert(pos.distance_to(Vector2(origin)+Vector2(expected[index])*.5)<.001)
		assert(move_input(Vector2.ZERO,seconds*.5))
		assert(pos.distance_to(Vector2(origin+expected[index]))<.001)
		assert(not move_input(Vector2.ZERO,.1))
	var obstruction := origin+Vector2i(1,0)
	grid.set_point_solid(obstruction,true)
	assert(not can_step(origin,origin+Vector2i(1,1)))
	assert(choose_step(origin,Vector2(0,1))==Vector2i.ZERO)
	grid.set_point_solid(obstruction,false)
	pos=Vector2(CAPITAL_START if area=="capital" else START)
	step_from=pos
	step_to=pos
	step_duration=WALK_SECONDS
	step_elapsed=step_duration
	print("MOVEMENT 8 DIRECTIONS PASS: "+area)

func smoke() -> void:
	assert(area=="capital" and valid(CAPITAL_START) and not hero.equipment and not has_gear and potions==0 and gold==0)
	assert(path(CAPITAL_START,CAPITAL_GATE).size()>0)
	assert(path(CAPITAL_START,Vector2i(CAPITAL_MERCHANT)).size()>0)
	assert(creatures.is_empty())
	test_movement()
	load_area("outpost")
	test_movement()
	assert(valid(START) and valid(HUNT))
	assert(path(START,HUNT).size()>0)
	assert(map.objects.size()>300)
	assert(urban_count==10)
	assert(residents.size()==13)
	for lot in urban_lots:
		assert(not valid(lot))
		assert(path(START,lot+Vector2i(1,0)).size()>0)
	assert(not valid(Vector2i(19,43)))
	assert(valid(Vector2i(24,38)))
	assert(path(START,HUNT).size()>0)
	assert(hero.textures.size()==5)
	assert(reachable.has(HUNT))
	assert(reachable.has(START))
	assert(creatures.size()>=4)
	assert(creatures[0]["id"]=="goblin")
	var goblin: Actor=creatures[0]["actor"]
	var previous: int=gold
	for n in range(6):
		damage_creature(0,10)
	assert(goblin.hp==0 and gold==previous and creatures[0]["loot"] and kills==1)
	pos=creatures[0]["pos"]
	assert(loot_creature(0))
	assert(gold==previous+25 and not creatures[0]["loot"])
	pos=Vector2(START)
	assert(can_step(START,START))
	assert(not can_step(START,Vector2i(-1,-1)))
	assert(not equip_item("shield"))
	pos=merchant_cell()
	assert(buy_item("sword"))
	assert(gold==5 and owned_gear.has("sword") and not buy_item("sword"))
	assert(equip_item("sword") and attack_value()==20 and defense_value()==0)
	assert(equip_item("sword") and attack_value()==10)
	gold=18
	assert(buy_item("shield") and gold==0)
	assert(equip_item("shield") and defense_value()==3 and attack_value()==10)
	assert(equip_item("shield") and defense_value()==0)
	toggle_gender()
	assert(hero.gender=="female" and hero.textures.has("female-shirt"))
	load_area("capital")
	walk_to(CAPITAL_GATE)
	assert(not route.is_empty())
	for n in range(1000):
		if not move_route(.05):
			break
	assert(pos.distance_to(Vector2(CAPITAL_GATE))<.01)
	assert(not move_route(.1))
	load_area("outpost")
	var first: Actor=creatures[0]["actor"]
	var at: Vector2=creatures[0]["pos"]
	pos=at-Vector2(1,0)
	mana=100
	aim=0
	assert(cast_at(at))
	assert(first.hp==38 and mana==92 and cooldowns[0]>0.0)
	assert(not cast_at(at))
	assert(bestiary["goblin"]==1 and trophies["goblin"]==1)
	print("REBORN SMOKE PASS: mouse routes, aimed skills, equipment and combat")
	get_tree().quit()

func capture() -> void:
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	await get_tree().create_timer(.3).timeout
	await RenderingServer.frame_post_draw
	var dest: String = OS.get_environment("KOA_SCREENSHOT")
	if dest.is_empty():
		dest="user://reborn.png"
	get_viewport().get_texture().get_image().save_png(dest)
	get_tree().quit()
