extends Node2D

var frames: Dictionary = {}
var textures: Dictionary = {}
var gender: String = "male"
var direction: int = 7
var state: String = "stance"
var frame: int = 0
var age: float = 0.0
var equipment: bool = true
var gear: Dictionary = {}
var kind: String = "hero"
var npc_name: String = ""
var actor_label: String = ""
var hp: int = 100
var max_hp: int = 100

func face(delta: Vector2) -> void:
	if delta.length_squared() < 0.001:
		return
	var angle: float = atan2(delta.y, delta.x)
	var octant: int = posmod(roundi(angle / (PI / 4.0)), 8)
	var next_direction: int = [5, 6, 7, 0, 1, 2, 3, 4][octant]
	if direction!=next_direction:
		direction=next_direction
		queue_redraw()

func animate(next_state: String, dt: float) -> void:
	var changed: bool = state != next_state
	if changed:
		state = next_state
		age = 0.0
	age += dt
	var n: int = 4 if state == "run" or state == "swing" else (3 if state == "die" else 1)
	var cadence: float = .095 if state == "run" else .12
	var new_frame: int = mini(n - 1, int(age / cadence)) if state == "swing" or state == "die" else int(age / cadence) % n
	if new_frame != frame or changed:
		frame = new_frame
		queue_redraw()

func sync_walk(progress: float) -> void:
	var changed: bool = state != "run"
	state="run"
	var next_frame: int = clampi(int(progress*4.0),0,3)
	if frame != next_frame or changed:
		frame = next_frame
		queue_redraw()

func layer(name: String) -> void:
	var key: String = gender + "-" + name
	var rows: Array = frames[key].get(state, frames[key]["stance"])
	var row: Array = rows[mini(frame, rows.size() - 1)]
	if int(row[1]) & (1 << direction):
		draw_texture_rect_region(textures[key], Rect2(-48, -82, 96, 96), Rect2(direction * 96, int(row[0]) * 96, 96, 96))

func _draw() -> void:
	if hp > 0:
		draw_set_transform(Vector2.ZERO,0.0,Vector2(1.0,.28))
		draw_circle(Vector2.ZERO,17.0,Color(0.04,0.045,0.03,.23))
		draw_circle(Vector2.ZERO,11.0,Color(0.04,0.045,0.03,.20))
		draw_set_transform(Vector2.ZERO)
	if kind == "hero":
		if textures.is_empty():
			return
		if gear.has("sword") and direction <= 2:
			layer("blade")
		if gear.has("shield") and direction >= 4 and direction <= 6:
			layer("shield")
		layer("boots" if gear.has("boots") else "feet")
		layer("legs" if gear.has("legs") else "pants")
		layer("armor" if gear.has("armor") else "shirt")
		layer("helmet" if gear.has("helmet") else "head")
		if gear.has("sword") and direction > 2:
			layer("blade")
		layer("hands")
		if gear.has("shield") and (direction < 4 or direction == 7):
			layer("shield")
	elif kind == "goblin":
		if not textures.has("goblin"):
			return
		var rows: Array = frames.get(state, frames["stance"])
		var row: int = int(rows[mini(frame, rows.size()-1)])
		draw_texture_rect_region(textures["goblin"], Rect2(-48,-82,96,96), Rect2(direction*96,row*96,96,96))
	elif kind == "npc":
		if not textures.has(npc_name):
			return
		var row: Array = frames[npc_name][7]
		for candidate in frames[npc_name]:
			if int(candidate[0]) == (frame if state=="run" else 0) and int(candidate[1]) == direction:
				row = candidate
				break
		var sz: Vector2 = Vector2(row[4],row[5]) * 0.44
		draw_texture_rect_region(textures[npc_name], Rect2(-Vector2(row[6],row[7])*0.44,sz),Rect2(row[2],row[3],row[4],row[5]))
	if hp > 0 and kind != "hero":
		var font: Font = ThemeDB.fallback_font
		var w: float = font.get_string_size(actor_label, HORIZONTAL_ALIGNMENT_LEFT, -1, 12).x
		draw_string_outline(font,Vector2(-w/2,-71),actor_label,HORIZONTAL_ALIGNMENT_LEFT,-1,12,4,Color("#161713"))
		draw_string(font,Vector2(-w/2,-71),actor_label,HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("#e4d4af"))
		if kind == "goblin":
			draw_rect(Rect2(-20,-66,40,4),Color("#241710"))
			draw_rect(Rect2(-20,-66,40.0*hp/max_hp,4),Color("#b04436"))
