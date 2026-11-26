extends Node2D
const Actor = preload("res://characters/actor.gd")
const HUD = preload("res://interface/hud.gd")
const STEP: float = 3.4
const START = Vector2i(24,38)
const HUNT = Vector2i(32,38)
var map: Dictionary
var grid := AStarGrid2D.new()
var ordered := Node2D.new()
var hero: Actor
var enemy: Actor
var hud: HUD
var cam := Camera2D.new()
var pos := Vector2(START)
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
var message: String = "WASD ou clique para andar • Espaço para atacar"
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
	map = read_json("res://assets/imported/map.json")
	if map.is_empty():
		push_error("Arquivos gráficos não importados. Baixe a versão validada pelo GitHub Actions.")
		get_tree().quit(2)
		return
	var background := Sprite2D.new()
	background.texture = image("res://assets/imported/ground.webp")
	background.centered = false
	background.z_index = -5
	add_child(background)
	ordered.y_sort_enabled = true
	add_child(ordered)
	var atlas: Texture2D = image("res://assets/imported/objects.webp")
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
	grid.region = Rect2i(0,0,64,64)
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	grid.update()
	for y in range(64):
		for x in range(64):
			grid.set_point_solid(Vector2i(x,y), int(map.walk[y][x]) != 1)
	hero = Actor.new()
	hero.frames = read_json("res://assets/hero_frames.json")
	for key in hero.frames:
		if str(key).begins_with("male-") or str(key).begins_with("female-"):
			hero.textures[key] = image("res://assets/classic/"+str(key)+".webp")
	ordered.add_child(hero)
	hero.position = iso(pos)
	enemy = Actor.new()
	enemy.kind = "goblin"
	enemy.frames = read_json("res://assets/imported/goblin.json")
	enemy.textures["goblin"] = image("res://assets/imported/goblin.webp")
	enemy.actor_label = "Goblin saqueador"
	enemy.max_hp = 60
	enemy.hp = 60
	ordered.add_child(enemy)
	enemy.position = iso(enemy_pos)
	var npcs: Dictionary = read_json("res://assets/npc_frames.json")
	for info in [["knight","Guarda de Ashes",Vector2i(24,35)],["wandering_trader","Mercador",Vector2i(23,39)],["peasant_man1","Ferreiro",Vector2i(25,40)],["peasant_woman1","Moradora",Vector2i(20,39)]]:
		var person: Actor = Actor.new()
		person.kind = "npc"
		person.npc_name = info[0]
		person.frames = npcs
		person.textures[info[0]] = image("res://assets/npcs/"+info[0]+".png")
		person.actor_label = info[1]
		person.position = iso(Vector2(info[2]))
		ordered.add_child(person)
	cam.position = hero.position + Vector2(0,-28)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 12.0
	add_child(cam)
	cam.make_current()
	hud = HUD.new()
	add_child(hud)
	hud.build(self)
	if "--smoke" in OS.get_cmdline_user_args():
		call_deferred("smoke")
	elif "--capture" in OS.get_cmdline_user_args():
		call_deferred("capture")

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
	destination = nearest(p)
	route = path(cell(pos),destination)

func advance(p: Vector2, steps: Array[Vector2i], dt: float, speed: float) -> Vector2:
	if steps.is_empty():
		return p
	var goal := Vector2(steps[0])
	var next: Vector2 = p.move_toward(goal,dt*speed)
	if next.distance_to(goal)<0.001:
		steps.pop_front()
	return next

func _unhandled_input(event: InputEvent) -> void:
	if not is_instance_valid(hero):
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var click: Vector2 = get_global_mouse_position()
		if enemy.hp > 0 and click.distance_to(enemy.position-Vector2(0,24)) < 36:
			target = true
			walk_to(cell(enemy_pos))
		else:
			target = false
			walk_to(cell(uniso(click)))
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_SPACE:
				target = true
				if enemy.hp > 0 and pos.distance_to(enemy_pos)>1.5:
					walk_to(cell(enemy_pos))
			KEY_E:
				toggle_equipment()
			KEY_G:
				toggle_gender()

func toggle_equipment() -> void:
	hero.equipment = not hero.equipment
	hero.queue_redraw()
	message = "Equipamento de aço" if hero.equipment else "Traje inicial"

func toggle_gender() -> void:
	hero.gender = "female" if hero.gender == "male" else "male"
	hero.queue_redraw()

func damage_enemy() -> void:
	enemy.hp = maxi(0,enemy.hp-20)
	message = "Golpe certeiro · 20 de dano"
	if enemy.hp == 0:
		kills += 1
		gold += 25
		respawn = 9.0
		target = false
		route.clear()
		enemy.state = "die"
		enemy.age = 0
		message = "Goblin derrotado · +25 ouro"

func _physics_process(dt: float) -> void:
	if not is_instance_valid(hero):
		return
	attack_time = maxf(0,attack_time-dt)
	enemy_attack = maxf(0,enemy_attack-dt)
	var screen := Vector2(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)),float(Input.is_physical_key_pressed(KEY_S))-float(Input.is_physical_key_pressed(KEY_W)))
	var before: Vector2 = pos
	if screen.length_squared()>0 and attack_time<=0:
		route.clear()
		target = false
		var move := Vector2(screen.x+screen.y,-screen.x+screen.y).normalized()*STEP*dt
		var next: Vector2 = pos+move
		if valid(cell(next)) and valid(cell(Vector2(next.x,pos.y))) and valid(cell(Vector2(pos.x,next.y))):
			pos = next
	elif attack_time<=0:
		pos = advance(pos,route,dt,STEP)
	if enemy.hp>0 and target and pos.distance_to(enemy_pos)<=1.5:
		route.clear()
		hero.face(iso(enemy_pos)-iso(pos))
		if attack_time<=0:
			attack_time=0.52
			damage_enemy()
	elif pos.distance_to(before)>0.001:
		hero.face(iso(pos)-iso(before))
	hero.animate("swing" if attack_time>0 else ("run" if pos.distance_to(before)>0.001 else "stance"),dt)
	hero.position=iso(pos)
	if enemy.hp>0:
		var old: Vector2 = enemy_pos
		var distance: float = pos.distance_to(enemy_pos)
		if distance<7 and distance>1.4:
			think -= dt
			if think<=0:
				think=.35
				enemy_route=path(cell(enemy_pos),cell(pos))
			enemy_pos=advance(enemy_pos,enemy_route,dt,1.65)
		elif distance<=1.4:
			enemy_route.clear()
			enemy.face(iso(pos)-iso(enemy_pos))
			if enemy_attack<=0:
				enemy_attack=.9
				hero.hp=maxi(0,hero.hp-8)
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
			enemy_pos=Vector2(HUNT)
			enemy.state="stance"
	enemy.position=iso(enemy_pos)
	if hero.hp<=0:
		hero.hp=hero.max_hp
		pos=Vector2(START)
		route.clear()
		target=false
		enemy_pos=Vector2(HUNT)
		message="Você voltou ao posto de Ashes"
	cam.position=hero.position+Vector2(0,-28)
	hud.update_view()

func smoke() -> void:
	assert(valid(START) and valid(HUNT))
	assert(path(START,HUNT).size()>0)
	assert(map.objects.size()>300)
	assert(hero.textures.size()==28)
	assert(enemy.textures.has("goblin"))
	var previous: int=gold
	damage_enemy()
	damage_enemy()
	damage_enemy()
	assert(enemy.hp==0 and gold==previous+25 and kills==1)
	toggle_equipment()
	assert(not hero.equipment)
	toggle_gender()
	assert(hero.gender=="female")
	print("REBORN SMOKE PASS: authored map, routing, sprites, equipment and combat")
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
