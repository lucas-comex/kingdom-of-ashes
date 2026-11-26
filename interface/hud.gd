extends CanvasLayer
var world
var life: ProgressBar
var label: Label
var details: Label
var mini: TextureRect
var dot: ColorRect
var status: Label

func panel_style() -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color=Color("#1b1814")
	s.border_color=Color("#8b7149")
	s.set_border_width_all(2)
	s.set_corner_radius_all(5)
	s.content_margin_left=12
	s.content_margin_right=12
	s.content_margin_top=8
	s.content_margin_bottom=8
	return s

func make_label(text: String, size: int=15) -> Label:
	var l := Label.new()
	l.text=text
	l.add_theme_font_size_override("font_size",size)
	l.add_theme_color_override("font_color",Color("#e5cea0"))
	return l

func build(w) -> void:
	world=w
	var root:=Control.new()
	add_child(root)
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var top:=PanelContainer.new()
	root.add_child(top)
	top.position=Vector2(16,16)
	top.add_theme_stylebox_override("panel",panel_style())
	var title:=make_label("KINGDOM OF ASHES  /  REBORN",18)
	top.add_child(title)
	var side:=PanelContainer.new()
	root.add_child(side)
	side.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	side.offset_left=-209
	side.offset_right=-16
	side.offset_top=16
	side.add_theme_stylebox_override("panel",panel_style())
	var col:=VBoxContainer.new()
	side.add_child(col)
	col.add_child(make_label("POSTO DE ASHES",16))
	mini=TextureRect.new()
	mini.texture=world.image("res://assets/imported/minimap.webp")
	mini.custom_minimum_size=Vector2(165,100)
	mini.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	mini.stretch_mode=TextureRect.STRETCH_SCALE
	mini.mouse_filter=Control.MOUSE_FILTER_IGNORE
	col.add_child(mini)
	dot=ColorRect.new()
	dot.color=Color("#f0d083")
	dot.size=Vector2(5,5)
	dot.mouse_filter=Control.MOUSE_FILTER_IGNORE
	mini.add_child(dot)
	details=make_label("Equipamento",14)
	col.add_child(details)
	var e:=Button.new()
	e.text="Equipar / retirar [E]"
	e.pressed.connect(world.toggle_equipment)
	col.add_child(e)
	var g:=Button.new()
	g.text="Personagem [G]"
	g.pressed.connect(world.toggle_gender)
	col.add_child(g)
	var bottom:=PanelContainer.new()
	root.add_child(bottom)
	bottom.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	bottom.offset_left=16
	bottom.offset_right=-16
	bottom.offset_top=-111
	bottom.offset_bottom=-16
	bottom.add_theme_stylebox_override("panel",panel_style())
	var box:=VBoxContainer.new()
	bottom.add_child(box)
	var line:=HBoxContainer.new()
	box.add_child(line)
	label=make_label("VANEZ BLANE",18)
	line.add_child(label)
	life=ProgressBar.new()
	life.max_value=100
	life.show_percentage=false
	life.custom_minimum_size=Vector2(200,20)
	var fill:=StyleBoxFlat.new()
	fill.bg_color=Color("#9d302b")
	fill.set_corner_radius_all(3)
	life.add_theme_stylebox_override("fill",fill)
	line.add_child(life)
	var spacer:=Control.new()
	spacer.size_flags_horizontal=Control.SIZE_EXPAND_FILL
	line.add_child(spacer)
	status=make_label("",14)
	line.add_child(status)
	var help:=make_label("WASD / clique: mover  •  Espaço / clique no inimigo: atacar  •  E: armadura  •  G: personagem",13)
	box.add_child(help)
	update_view()

func update_view() -> void:
	if not is_instance_valid(life):
		return
	life.value=world.hero.hp
	label.text="VIDA  %d/100    "%world.hero.hp
	status.text="%s    |    Ouro: %d  •  Abates: %d"%[world.message,world.gold,world.kills]
	details.text="Aço equipado" if world.hero.equipment else "Traje de tecido"
	dot.position=Vector2(world.pos.x/64.0*mini.size.x,world.pos.y/64.0*mini.size.y)
