# Tower Design Overview

This document summarizes tower functionality and tactical roles in **Defend London**.

## Tower Design Matrix

| Tower (Image + Name) | Cost | Range | DMG | FR (f/shot) | Core Function | Best Use |
|---|---:|---:|---:|---:|---|---|
| <img src="../game/assets/tower_basic.png" alt="Basic Tower" width="56"><br><strong>Basic Tower</strong><br><sub>`basic`</sub> | 60 | 150 | 15 | 55 | Reliable single-target DPS | Early core coverage |
| <img src="../game/assets/tower_slow.png" alt="Slow Tower" width="56"><br><strong>Slow Tower</strong><br><sub>`slow`</sub> | 85 | 140 | 12 | 70 | On-hit slow (`0.45`, 100f) | Catch fast lanes |
| <img src="../game/assets/tower_area_fire.png" alt="Area Tower" width="56"><br><strong>Area Tower</strong><br><sub>`area`</sub> | 130 | 200 | 13 | 85 | Pulse AoE in range | Dense wave clear |
| <img src="../game/assets/tower3.png" alt="Crystal Tower" width="56"><br><strong>Crystal Tower</strong><br><sub>`crystal`</sub> | 120 | 160 | 15 | 150 | Aura buff (damage + fire-rate, capped) | Build tower clusters |
| <img src="../game/assets/tower_steam.png" alt="Steam Cannon" width="56"><br><strong>Steam Cannon</strong><br><sub>`steam`</sub> | 180 | 220 | 55 | 200 | Pierce (up to 3) + charge stacks | Break tank packs |
| <img src="../game/assets/tower_alchemist.png" alt="Alchemist Tower" width="56"><br><strong>Alchemist Tower</strong><br><sub>`alchemist`</sub> | 150 | 170 | 20 | 70 | Random potion effects (explode/poison/freeze/weaken) | Mixed-wave control |

## Design Intent

- Towers are designed as a complementary toolkit, not isolated DPS options.
- Core decisions revolve around timing and placement trade-offs under coin constraints.
- Synergy (slow + AoE, crystal + core DPS, utility + burst) is encouraged to reward strategy depth.
