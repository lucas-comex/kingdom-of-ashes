# Kingdom of Ashes Reborn 0.5
Godot 4.4.1 Compatibility. Branch independent from main (web 24.1). No original saves overwritten.
Controls: WASD continuous tile steps, mouse selects only, Space attacks, F interacts/loots, I opens bag, J uses potion, wheel zooms, E toggles equipment, G toggles gender.
Guest login uses the approved original artwork. FLARE licensed map and sprites remain the initial art benchmark (credits in assets). This is an early playable prototype, not a migration of all web content. No multiplayer or real authentication. Horse, broader original world, new creatures, persistent progression and full inventory still pending.
GitHub Actions imports, smoke-tests, captures a screenshot and exports the Web build. Download the artifact; its web folder requires HTTP hosting, not file://. Native project can be opened in Godot.

0.3: the approved atlas is used for three new buildings with blocked footprints; movement animation is synchronized to each tile step. The workflow stores a validated browser export under web-build for separate Pages publication; the old game remains intact.

0.4: ten atlas-based new buildings, 13 named residents, dialogue and explicit merchant purchase. All new building entrances have a tested route from spawn. A custom monumental castle asset is still pending.

0.5: provisional capital district adapted from the CC BY-SA FLARE Black Oak City map, safe spawn without gear/items, commerce, two connected zones, culling, HUD throttling, fixed 960x600 internal resolution. Castle-specific original art and complete inventory are pending. F at west gate of capital or travel post of outpost changes zone.

0.5.1: explicit eight-way mapping, arrows and keypad 7/9/1/3 as backup; no diagonal wall clipping, safe fallback, leftover physics time retained. Smoke tests all eight directions on both maps.

0.6: mouse left click/hold movement, click selects target, QWER aimed skills (press then left click, Esc/right cancels), Space selected basic attack, right click interaction, K equipment, NPC roaming, passive shield defense. No doors/stairs/sewers beyond existing zone gates yet.

0.7: six individually purchasable/equippable slots with original item atlas icons, passive attack and defense, explicit shop, local persistent progress with manual and 20-second autosave. Saves are local to browser; position and login are not persisted. Doors and interiors remain pending.

0.8: multiple independent creatures, goblins, skeletons, minotaur and wyvern using licensed FLARE frames. Area skills hit all legal targets; trophies and bestiary saved locally. Original castle, wolves, mounts and additional biomes pending.

0.9: performance pass, fixed browser canvas resolution (480/640/800/960 widths), no device pixel ratio inflation, default 640x400, 30 Hz physics, lazy hero textures, reachable-cell routing and visibility bounds, fewer HUD updates. Original content preserved. FPS gain must be measured on the player's machine.
