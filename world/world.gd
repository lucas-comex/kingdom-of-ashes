extends Node2D
const Actor = preload("res://characters/actor.gd")
const HUD = preload("res://interface/hud.gd")
const STEP: float = 2.65
const WALK_SECONDS: float = 1.0 / STEP
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
var message: String = "WASD • Espaço para atacar • F para saquear"
var playing: bool = false
var step_from := Vector2(START)
var step_to := Vector2(START)
var step_elapsed: float = WALK_SECONDS
var step_duration: float = WALK_SECONDS
var urban_count: int = 0
var attack_requested: bool = false
var loot_gold: int = 0
var xp: int = 0
var level: int = 1
var potions: int = 3
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
	build_urban_extension()
	hero = Actor.new()
	hero.frames = read_json("res://assets/hero_frames.json")
	for key in hero.frames:
		if str(key).begins_with("male-") or str(key).begins_with("female-"):
			hero.textures[key] = image("res://assets/classic/"+str(key)+".webp")
	ordered.add_child(hero)
	hero.position = iso(pos)
	hero.scale = Vector2(.88,.88)
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
	if "--smoke" in OS.get_cmdline_user_args() or "--capture" in OS.get_cmdline_user_args():
		start_game()
	if "--smoke" in OS.get_cmdline_user_args():
		call_deferred("smoke")
	elif "--capture" in OS.get_cmdline_user_args():
		call_deferred("capture")

func build_urban_extension() -> void:
	var atlas := image("res://assets/kingdom-art-v1.webp")
	if atlas == null:
		return
	var lots := [
		[Vector2i(19,43),Rect2(516,1313,248,190),154.0],
		[Vector2i(23,43),Rect2(772,1302,248,211),150.0],
		[Vector2i(33,43),Rect2(1028,1314,248,188),132.0]
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
		for point in footprint:
			grid.set_point_solid(point,true)
		urban_count += 1

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

func start_game() -> void:
	playing = true
	hud.close_login()

func can_step(from: Vector2i, to: Vector2i) -> bool:
	var d := to - from
	return valid(to) and (d.x == 0 or d.y == 0 or (valid(from + Vector2i(d.x,0)) and valid(from + Vector2i(0,d.y))))

func move_input(screen: Vector2, dt: float) -> bool:
	if step_elapsed >= step_duration:
		if screen.length_squared() <= 0.0:
			return false
		var d := Vector2i(signi(roundi(screen.x+screen.y)),signi(roundi(-screen.x+screen.y)))
		var from := cell(pos)
		if not can_step(from,from+d):
			return false
		step_from = Vector2(from)
		step_to = Vector2(from+d)
		step_duration = WALK_SECONDS * Vector2(d).length()
		step_elapsed = 0.0
		hero.face(iso(step_to)-iso(step_from))
	step_elapsed = minf(step_duration,step_elapsed+dt)
	pos = step_from.lerp(step_to,step_elapsed/step_duration)
	return true

func collect_loot() -> void:
	if loot_gold <= 0 or pos.distance_to(enemy_pos)>2.0:
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
	if loot_gold > 0 and pos.distance_to(enemy_pos)<=2.0:
		collect_loot()
	elif pos.distance_to(Vector2(23,39))<=2.5:
		if kills >= 3 and not quest_claimed:
			quest_claimed = true
			gold += 100
			xp += 100
			message = "Contrato concluído: +100 ouro e XP"
		elif gold >= 12:
			gold -= 12
			potions += 1
			message = "Mercador: poção comprada por 12 ouro."
		else:
			message = "Mercador: poções por 12 ouro."
	else:
		message = "Aproxime-se do mercador ou do loot."

func _unhandled_input(event: InputEvent) -> void:
	if not playing or not is_instance_valid(hero):
		return
	if event is InputEventMouseButton and event.pressed:
		match event.button_index:
			MOUSE_BUTTON_WHEEL_UP:
				cam.zoom = Vector2.ONE * minf(1.7,cam.zoom.x+.1)
			MOUSE_BUTTON_WHEEL_DOWN:
				cam.zoom = Vector2.ONE * maxf(.8,cam.zoom.x-.1)
			MOUSE_BUTTON_LEFT:
				var click: Vector2 = get_global_mouse_position()
				if click.distance_to(enemy.position-Vector2(0,24)) < 36:
					if enemy.hp > 0:
						target = true
						message = "Alvo selecionado."
					else:
						collect_loot()
				else:
					target = false
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_SPACE:
				attack_requested = true
			KEY_F:
				interact()
			KEY_J:
				use_potion()
			KEY_I:
				hud.toggle_bag()
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
	var screen := Vector2(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)),float(Input.is_physical_key_pressed(KEY_S))-float(Input.is_physical_key_pressed(KEY_W)))
	var moving := move_input(screen,dt)
	if attack_requested:
		attack_requested = false
		if enemy.hp > 0 and pos.distance_to(enemy_pos)<=1.5 and attack_time<=0:
			target = true
			hero.face(iso(enemy_pos)-iso(pos))
			attack_time=0.52
			damage_enemy()
		elif enemy.hp > 0:
			message = "Aproxime-se do inimigo."
	hero.animate("swing" if attack_time>0 else ("run" if moving else "stance"),dt)
	if moving and attack_time<=0:
		hero.sync_walk(step_elapsed/step_duration)
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
			loot_gold=0
			enemy_pos=Vector2(HUNT)
			enemy.state="stance"
	enemy.position=iso(enemy_pos)
	if hero.hp<=0:
		hero.hp=hero.max_hp
		pos=Vector2(START)
		step_from=pos
		step_to=pos
		step_duration=WALK_SECONDS
		step_elapsed=WALK_SECONDS
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
	assert(urban_count==3)
	assert(not valid(Vector2i(19,43)))
	assert(valid(Vector2i(24,38)))
	assert(path(START,HUNT).size()>0)
	assert(hero.textures.size()==28)
	assert(enemy.textures.has("goblin"))
	var previous: int=gold
	damage_enemy()
	damage_enemy()
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
