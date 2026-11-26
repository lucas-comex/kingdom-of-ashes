# Kingdom of Ashes — Roadmap 15–25 (96 requests)
The public root remains the stable 14.9 game. The /preview/ directory is the experimental build; its saves are independent. stable-v14.9 is a recovery branch. Do not promote preview until browser tests and manual playtesting pass.
## Status legend
Implemented = code exists and tested in simulation; browser acceptance remains required. Partial = initial functionality or improvement exists; not the full requested scope. Planned = not delivered in 15.0.
## 15 — graphics and technical foundations
1 Partial — improved humanoid sprite details, not full reconstruction.
2 Partial — original isometric stylized art, not AoE II realism.
3 Implemented — eight directions, cached four walking frames per direction.
4 Planned — distinct weapon-specific attack animations.
5 Implemented — short falling/fading monster death animation (normal quality).
6 Partial — stronger contact shadows, existing day/night lighting, storm tint; no full dynamic lighting.
7 Implemented — rain, fog and storm cycles with visual effects and reduced-motion option.
8 Partial — previous trees and rocks; further vegetation work planned.
9 Planned — smooth terrain transitions.
10 Partial — armor, sword, shield, boots and ring visual accents; not every item has a unique sprite.
11 Planned — additional special combat skills.
12 Implemented — editable 1–9 quickslots for existing commands.
13–20 Planned — ranged combat, bows, offensive spells, status effects, resistances, dodge/block, improved AI, aggro territories.
21 Partial — existing Tibia-inspired HUD; further redesign planned.
22 Planned — drag-and-drop inventory.
23 Implemented — draggable existing windows with CSS resizing in preview.
24–30 Planned — item tooltips, gear comparison, XP bar, minimap zoom, custom markers, combat log, UI personalization.
31–40 Planned — world expansion, towns, castles, dense forests, desert, snow, swamps/caves, interiors, walking NPCs, random events.
41–48 Planned — classes, skill tree, attributes, specialization, weapon skills, appearance customization, achievements, reputation.
49 Partial — existing rare weapons/armor; expanded catalogue planned.
50–58 Planned — hundreds of items, upgrades, durability, enchanting, sets, merchant inventories, commerce, mining/smithing, personal storage.
59–67 Planned — sleep, temperature, wounds, disease, fishing, farming, shelter building, cooking, storm shelter.
68 Partial — skeletons and crypt knight already implemented; more species planned.
69 Planned — multi-floor dungeons.
70 Partial — existing crypt king attack frequency changes below half HP.
71–76 Planned — rare spawns, invasions, secret dungeons, traps/puzzles, spawn settings, dragons.
77–86 Planned — full story, intro, dialogue, sidequests, consequences, factions, books, richer journal, music, realistic environmental audio; existing initial quest, journal and synthetic audio are starting points.
87 Partial — GitHub Actions Playwright browser smoke test extended to preview; actual run must be verified.
88 Ongoing — cache, bounded animation effects, lightweight weather overlay, performance checks.
89 Implemented — stable root, preview route, stable recovery branch and isolated preview save.
90–92 Planned — multiple profiles, save import/export, complete mobile support.
93 Implemented (initial) — low/medium/high weather and effects options; broader renderer configuration planned.
94 Planned — fullscreen improvements.
95 Partial — new systems module; remaining monolithic game/UI code to be migrated.
96 Future — multiplayer needs separate authoritative server, authentication and synchronization.
## Release order
15 graphics/foundation; 16 combat; 17 UI; 18 world; 19 progression; 20 economy; 21 survival; 22 dungeons; 23 narrative/audio; 24 polish/compatibility; 25 beta. Multiplayer after single-player validation.
## Release gate
Check old saves, eight-direction movement, route following, combat, dungeon transitions, loot, UI, browser errors, performance on modest hardware, and stable/preview save isolation. No forced publication of untested preview to stable.
