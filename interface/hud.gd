extends CanvasLayer
var world
var life: ProgressBar
var label: Label
var details: Label
var mini: TextureRect
var dot: ColorRect
var status: Label
var login: Control
var bag: PanelContainer
var bag_text: Label

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
	var title:=make_label("KINGDOM OF ASHES  /  REBORN 0.3",18)
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
	var help:=make_label("WASD: mover  •  Espaço: atacar  •  F: interagir  •  I: mochila  •  J: poção  •  Scroll: zoom",13)
	box.add_child(help)
	bag=PanelContainer.new()
	root.add_child(bag)
	bag.position=Vector2(16,76)
	bag.custom_minimum_size=Vector2(250,120)
	bag.add_theme_stylebox_override("panel",panel_style())
	bag_text=make_label("",15)
	bag.add_child(bag_text)
	bag.hide()
	build_login(root)
	update_view()

func toggle_bag() -> void:
	bag.visible = not bag.visible
	update_view()

func close_login() -> void:
	if is_instance_valid(login):
		login.hide()

func build_login(root: Control) -> void:
	login=Control.new()
	root.add_child(login)
	login.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var bg:=TextureRect.new()
	login.add_child(bg)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.texture=load("res://assets/kingdom-dark.webp")
	bg.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED
	var shade:=ColorRect.new()
	login.add_child(shade)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.color=Color(0.02,0.025,0.03,.35)
	var center:=CenterContainer.new()
	login.add_child(center)
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var panel:=PanelContainer.new()
	panel.custom_minimum_size=Vector2(390,310)
	panel.add_theme_stylebox_override("panel",panel_style())
	center.add_child(panel)
	var col:=VBoxContainer.new()
	col.add_theme_constant_override("separation",12)
	panel.add_child(col)
	col.add_child(make_label("KINGDOM OF ASHES",28))
	col.add_child(make_label("REBORN • Entre no reino",16))
	var user:=LineEdit.new()
	user.placeholder_text="Login (opcional)"
	col.add_child(user)
	var pass_field:=LineEdit.new()
	pass_field.placeholder_text="Senha (não use uma senha real)"
	pass_field.secret=true
	col.add_child(pass_field)
	var enter:=Button.new()
	enter.text="ENTRAR"
	col.add_child(enter)
	enter.pressed.connect(func(): user.clear(); pass_field.clear(); world.start_game())
	var signup:=Button.new()
	signup.text="Criar conta"
	col.add_child(signup)
	var note:=make_label("Acesso de visitante. Sem autenticação.",13)
	col.add_child(note)
	signup.pressed.connect(func(): note.text="Cadastro online ainda em desenvolvimento.")

func update_view() -> void:
	if not is_instance_valid(life):
		return
	life.value=world.hero.hp
	label.text="VIDA  %d/100    "%world.hero.hp
	status.text="%s | Nv. %d · Ouro: %d · Abates: %d"%[world.message,world.level,world.gold,world.kills]
	if is_instance_valid(bag_text):
		bag_text.text="MOCHILA\nOuro: %d\nPoções: %d [J]\nXP: %d\nContrato: %d/3" % [world.gold,world.potions,world.xp,mini(world.kills,3)]
	details.text="Aço equipado" if world.hero.equipment else "Traje de tecido"
	dot.position=Vector2(world.pos.x/64.0*mini.size.x,world.pos.y/64.0*mini.size.y)
