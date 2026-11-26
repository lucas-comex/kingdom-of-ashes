# Roadmap 188 — Kingdom of Ashes
Baseline: stable 14.9 at the site root; experimental 15.4 at /preview/. Preserve the original 14.9 recovery branch. The following ranges refer to the user's numbered list of 188 improvements submitted after 15.3.
**Status**: I = implemented in preview code (browser acceptance still required); P = partial; R = remaining; F = existing foundation from earlier releases, still requires enhancement. All unspecified items remain R. Do not mark an entire release complete based on partial work.
## 15.4 — Inventory, item interactions and UI foundations
- 50 I: reorder existing resource-category slots, persist ordering. Not a fully general per-instance inventory.
- 51 I: drag rare equipment from collection to matching equipment slot.
- 52 I: drag owned items to scenario, drop at player's feet (distance validated).
- 53 I: recognizable item-type art on ground; not yet individual artwork for every equipment ID.
- 54 I: exact quantity dialog, validates available count.
- 55 F: matching ground stacks combine, resource inventory aggregated.
- 56 P: partial quantities can be dropped, not arbitrary independent inventory stacks.
- 57–58 R: bag capacity variants, individual weight.
- 59 P: basic tooltips and rare item attributes.
- 60 I: compare special equipment bonus deltas against equipped special item in same slot.
- 61 I: automatic category order.
- 62 R: personal chests.
- 63 P: rarity-colored cards and ground accents.
- 64–65 P: existing Tibia-like HUD, wood/iron styling refinements; complete redesign pending.
- 66 P: category icons; unique artwork for every ability pending.
- 67 I: drag consumables onto quickslot.
- 68 I: quantity display.
- 69 I: current healing spell shows 25 mana; extend to future spells.
- 70 R: detailed XP bar.
- 71 I: health bar above player.
- 72 R: detailed combat/XP log.
- 73 I: character sheet with level, HP, mana, XP, speed, skills and gear bonuses.
- 74 I: window position and dimensions stored locally.
- 75 P: movable/resizable panels and quickslots; further customization pending.
- 76–77 R: zoom and user map markers.
## 15.5 — Graphic overhaul (1–15)
1–4 P: existing original procedural sprites, initial anchor fixes, full realistic reconstruction pending. 5–8 P: cached direction frames, generic death animation, visible equipment categories; improve natural motion, weapon-specific animation, creature deaths and unique gear. 9–13 P: existing shadows, torch sprites, vegetation and terrain, major upgrades pending. 14–15 R: footprints and dust.
## 16.0 — Combat (30–49)
30–34 P: existing melee, auto-attack on selected target, initial targeting; full redesign and retained manual-movement target pending. 35–43 R: bow, ranged spells, AoE player abilities, impact/blood, bleed/poison/burn, resistances, advanced crit. 44–45 P: movement-based dodge and timed block, refine. 46 R: combos. 47 I: current heavy/block cooldowns in quickslots. 48 R: status indicators. 49 P: basic chase/leash and boss mechanics, expand individual strategies.
## 17.0 — Classes (94–107)
94–107 R: warrior, archer, mage, paladin, assassin, class selection, skill trees, specialization, attributes, weapon skills, training, appearance, titles, achievements, reputation. Existing sword/defense/magic skill counters are a foundation.
## 18.0 — Capital and towns (16–29)
16 P: existing fortified capital; major keep expansion pending. 17 R: throne room. 18 P: guards pursue/return, patrol routes pending. 19–29 R: guard damage/death, player protection, invasion reinforcements, gates, barracks, tavern, temple, bank, smith, individual merchants, NPC schedules.
## 19.0 — Open world (124–138)
124–138 R: 160x160 map, towns, abandoned castles, forts, snowy mountains, deserts, swamps, dense forests, caves, waterfalls/lakes, interiors, trade roads, caravans, discovery, events. Existing 80x80 map and chunk rendering are foundations.
## 20.0 — Economy (108–123)
108–123 R: large item catalogue, weapon families, bows/staves, set bonuses, level/class requirements, durability, repairs, upgrades, enchantments, mining/smithing/crafting, commerce, separate stocks, copper/silver/gold. Existing shop and relic catalogue are foundations.
## 21.0 — Survival (139–150)
139–150 R: sleep, temperature, wounds, bandages, diseases, fishing, farming, hunting, cooking expansion, shelters, storm shelter and food/water refinements. Existing hunger/thirst and basic cooking remain.
## 22.0 — Dungeons (78–93)
78–90 R: sewer expansion, multiple entrances/floors, bats/spiders, goblins/orcs, trolls/ogres, dragons, ghosts, giant rat, difficulty zones, keys/doors, traps, puzzles/secret passages. 91 P: existing king attack frequency below half health; more phases pending. 92–93 R: rare spawns and invasions.
## 23.0 — Narrative and audio (151–163)
151–163 R: full narrative, cinematic opening, interactive dialogue, side/daily quests, choices, factions, lore, hunt contracts expansion, original music, realistic combat/region sounds, dawn/dusk bells. Existing first quest, contract and synthesized sound are foundations.
## 24.0 — Quality (177–188)
177–181 P: existing low-FX, chunk cache, optional GPU and quality presets; continue optimization and profiling. 182 P: Playwright smoke coverage extended for 15.4; verify actual runs. 183 R: save export/import. 184–185 P: touch controls/fullscreen exist, further work pending. 186 P: new inventory.js module alongside systems.js; remaining modularization pending. 187–188 R: bug reporting and developer panel.
## 25.0 — Single-player beta
Release only after performance, compatibility and regression tests on real hardware.
## 30.0 — Multiplayer (164–176)
164–176 R: shared authoritative server, registration/login, multiple characters, synchronization, chats, ground pickup by other players, trade, parties, guilds, cooperative dungeons, regional PvP, duplication protection and administration. GitHub Pages is static hosting; backend service and persistence are required. Never expose server credentials in frontend. The current local item system does not synchronize players or enforce server authority.
## Validation gate
Test normal/safe/preview browser modes, movement at different frame rates, loot and inventory conservation, dungeon transitions, UI interactions including mobile alternatives, save migration, console errors, measured rendering performance. Keep stable root untouched while testing preview.
