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
var has_gear: bool = false
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
	for key in hero.frames:
		if str(key).begins_with("male-") or str(key).begins_with("female-"):
			hero.textures[key] = image("res://assets/classic/"+str(key)+".webp")
	ordered.add_child(hero)
	hero.position = iso(pos)
	hero.scale = Vector2(.82,.82)
	hero.equipment = false
	enemy = Actor.new()
	enemy.kind = "goblin"
	enemy.frames = read_json("res://assets/imported/goblin.json")
	enemy.textures["goblin"] = image("res://assets/imported/goblin.webp")
	enemy.actor_label = "Goblin saqueador"
	enemy.max_hp = 60
	enemy.hp = 60
	ordered.add_child(enemy)
	enemy.position = iso(enemy_pos)
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

func merchant_cell() -> Vector2:
	return CAPITAL_MERCHANT if area=="capital" else Vector2(23,39)

func area_title() -> String:
	return "CAPITAL DO REINO" if area=="capital" else "FRONTEIRA DE ASHES"

func load_area(next_area: String) -> void:
	area = next_area
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
	enemy.visible=area=="outpost"
	target=false
	route.clear()
	mouse_walk=false
	aim=-1
	effect_time=0.0
	slow_time=0.0
	enemy_route.clear()
	queue_redraw()
	attack_requested=false
	attack_time=0.0
	if area=="outpost":
		enemy.position=iso(enemy_pos)
	if is_instance_valid(hud):
		hud.set_area(folder+"/minimap.webp")
	cam.position=hero.position+Vector2(0,-28)
	if cam.is_inside_tree():
		cam.reset_smoothing()
	cull_objects()
	message="Clique esquerdo para andar. Botão direito no portão oeste para viajar." if area=="capital" else "Botão direito no posto de viagem para voltar."

func cull_objects() -> void:
	var center: Vector2 = hero.position
	var extent: Vector2 = get_viewport_rect().size/(2.0*cam.zoom.x)+Vector2(240,320)
	for spr in static_objects:
		var delta: Vector2 = (spr.position-center).abs()
		spr.visible=delta.x<=extent.x and delta.y<=extent.y

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
	if requested==destination and not route.is_empty():
		return
	destination=requested
	route.clear()
	if requested==origin:
		return
	if valid(requested):
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
				if not valid(candidate):
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
	route.clear()

func tick_residents(dt: float) -> void:
	for resident in residents:
		var actor: Actor = resident["actor"]
		var at: Vector2 = resident["cell"]
		actor.visible=at.distance_to(pos)<15.0
		if resident["fixed"] or not actor.visible:
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
	var hit: bool = false
	if enemy.hp>0 and clear_line(pos,enemy_pos):
		match index:
			0:
				hit=enemy_pos.distance_to(pos)<=2.6 and d.normalized().dot((enemy_pos-pos).normalized())>=.45
			1:
				var segment: Vector2 = Geometry2D.get_closest_point_to_segment(enemy_pos,pos,point)
				hit=segment.distance_to(enemy_pos)<=.70
			2:
				hit=enemy_pos.distance_to(point)<=1.8
			3:
				hit=enemy_pos.distance_to(point)<=2.5
	mana-=SKILL_COST[index]
	cooldowns[index]=SKILL_CD[index]
	hero.face(iso(point)-iso(pos))
	attack_time=.40
	effect_kind=index
	effect_from=iso(pos)
	effect_to=iso(point)
	effect_time=.4
	aim=-1
	message=SKILL_NAMES[index]+(" acertou!" if hit else " • errou o alvo.")
	if hit:
		if index==2:
			slow_time=3.0
		damage_enemy([22,30,20,55][index])
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
	if target and enemy.hp>0 and area=="outpost":
		draw_arc(iso(enemy_pos),19.0,0.0,TAU,36,Color("#dba85b"),2.0,true)

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
	hud.close_login()

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
	if area!="outpost" or loot_gold <= 0 or pos.distance_to(enemy_pos)>2.0:
		message = "Aproxime-se do cadáver para saquear."
		return
	gold += loot_gold
	message = "Loot recolhido: +%d ouro" % loot_gold
	loot_gold = 0

func use_potion() -> void:
	if potions <= 0 or hero.hp >= hero.max_hp:
		return
	potions -= 1
	hero.hp = mini(hero.max_hp,hero.hp+45)
	message = "Poção utilizada."

func interact() -> void:
	if area=="capital" and pos.distance_to(Vector2(CAPITAL_GATE))<=2.0:
		load_area("outpost")
		return
	if area=="outpost" and pos.distance_to(Vector2(OUTPOST_GATE))<=2.0:
		load_area("capital")
		return
	if area=="outpost" and loot_gold > 0 and pos.distance_to(enemy_pos)<=2.0:
		collect_loot()
	elif pos.distance_to(merchant_cell())<=2.5:
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
				var enemy_clicked: bool = area=="outpost" and click.distance_to(enemy.position-Vector2(0,24))<36.0
				if aim>=0:
					cast_at(enemy_pos if enemy_clicked and enemy.hp>0 else uniso(click))
				elif enemy_clicked:
					stop_route()
					target=enemy.hp>0
					message="Alvo selecionado. Espaço ou QWER para atacar." if target else "Botão direito para saquear."
				else:
					target=false
					mouse_walk=true
					repath_clock=.14
					walk_to(cell(uniso(click)))
				queue_redraw()
			MOUSE_BUTTON_RIGHT:
				if aim>=0:
					aim=-1
					queue_redraw()
					return
				stop_route()
				var clicked_cell := uniso(click)
				if area=="outpost" and enemy.hp<=0 and click.distance_to(enemy.position-Vector2(0,12))<40.0:
					collect_loot()
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

func buy_gear() -> void:
	if not playing or pos.distance_to(merchant_cell())>2.5 or has_gear or gold<60:
		message="Conjunto de aço: 60 ouro."
		return
	gold-=60
	has_gear=true
	message="Conjunto adquirido. K para equipar."
	hud.update_view()

func toggle_equipment() -> void:
	if not has_gear:
		message="Você ainda não possui equipamento."
		return
	hero.equipment = not hero.equipment
	hero.queue_redraw()
	message = "Equipamento de aço" if hero.equipment else "Traje inicial"

func toggle_gender() -> void:
	hero.gender = "female" if hero.gender == "male" else "male"
	hero.queue_redraw()

func damage_enemy(amount: int = -1) -> void:
	if enemy.hp<=0:
		return
	var damage: int = amount if amount>=0 else (20 if hero.equipment else 10)
	enemy.hp = maxi(0,enemy.hp-damage)
	enemy.queue_redraw()
	message = "Golpe certeiro · %d de dano" % damage
	if enemy.hp == 0:
		kills += 1
		loot_gold = 25
		xp += 50
		if xp >= level*150:
			xp -= level*150
			level += 1
		respawn = 35.0
		target = false
		route.clear()
		enemy.state = "die"
		enemy.age = 0
		message = "Goblin derrotado · saque disponível"

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
		repath_clock=.14
		walk_to(cell(uniso(get_global_mouse_position())))
	var moving := move_route(dt)
	if moving or aim>=0 or target:
		queue_redraw()
	npc_clock+=dt
	if npc_clock>=.10:
		tick_residents(npc_clock)
		npc_clock=0.0
	if attack_requested:
		attack_requested = false
		if target and area=="outpost" and enemy.hp > 0 and pos.distance_to(enemy_pos)<=1.5 and attack_time<=0 and clear_line(pos,enemy_pos):
			target = true
			hero.face(iso(enemy_pos)-iso(pos))
			attack_time=0.52
			damage_enemy()
		elif area=="outpost" and enemy.hp > 0:
			message = "Aproxime-se do inimigo."
	if moving and attack_time<=0:
		hero.sync_walk(step_elapsed/step_duration)
	else:
		hero.animate("swing" if attack_time>0 else "stance",dt)
	hero.position=iso(pos)
	if area=="capital":
		pass
	elif enemy.hp>0:
		var old: Vector2 = enemy_pos
		var distance: float = pos.distance_to(enemy_pos)
		if distance<7 and distance>1.4:
			think -= dt
			if think<=0:
				think=.35
				enemy_route=path(cell(enemy_pos),cell(pos))
			enemy_pos=advance(enemy_pos,enemy_route,dt,0.85 if slow_time>0.0 else 1.65)
		elif distance<=1.4:
			enemy_route.clear()
			enemy.face(iso(pos)-iso(enemy_pos))
			if enemy_attack<=0:
				enemy_attack=.9
				hero.hp=maxi(0,hero.hp-(5 if hero.equipment else 8))
		else:
			enemy_route.clear()
		if enemy_pos.distance_to(old)>0.001:
			enemy.face(iso(enemy_pos)-iso(old))
		enemy.animate("swing" if distance<=1.4 and enemy_attack>.48 else ("run" if enemy_pos.distance_to(old)>0.001 else "stance"),dt)
	else:
		enemy.animate("die",dt)
		respawn-=dt
		if respawn<=0:
			enemy.hp=enemy.max_hp
			enemy.queue_redraw()
			loot_gold=0
			enemy_pos=Vector2(HUNT)
			enemy.state="stance"
	enemy.position=iso(enemy_pos)
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
	hud_clock+=dt
	cull_clock+=dt
	if hud_clock>=.10:
		hud_clock=0.0
		hud.update_view()
	if cull_clock>=.20:
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
	assert(not enemy.visible)
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
	assert(hero.textures.size()==28)
	assert(enemy.textures.has("goblin"))
	var previous: int=gold
	for n in range(6):
		damage_enemy()
	assert(enemy.hp==0 and gold==previous and loot_gold==25 and kills==1)
	pos=enemy_pos
	collect_loot()
	assert(gold==previous+25 and loot_gold==0)
	pos=Vector2(START)
	assert(can_step(START,START))
	assert(not can_step(START,Vector2i(-1,-1)))
	toggle_equipment()
	assert(not hero.equipment)
	has_gear=true
	toggle_equipment()
	assert(hero.equipment)
	toggle_equipment()
	assert(not hero.equipment)
	toggle_gender()
	assert(hero.gender=="female")
	load_area("capital")
	walk_to(CAPITAL_GATE)
	assert(not route.is_empty())
	for n in range(1000):
		if not move_route(.05):
			break
	assert(pos.distance_to(Vector2(CAPITAL_GATE))<.01)
	assert(not move_route(.1))
	load_area("outpost")
	enemy.hp=60
	enemy_pos=Vector2(HUNT)
	pos=Vector2(HUNT)-Vector2(1,0)
	mana=100
	aim=0
	assert(cast_at(enemy_pos))
	assert(enemy.hp==38 and mana==92 and cooldowns[0]>0.0)
	assert(not cast_at(enemy_pos))
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
