# Tower Design Overview

This document summarizes tower functionality and tactical roles in **Defend London**.

## Tower Design Matrix

| Tower (Image + Name) | Cost | Range | Damage | Fire Rate (frames/shot) | Core Function | Best Use Cases |
|---|---:|---:|---:|---:|---|---|
| ![Basic Tower](../game/assets/tower_basic.png)<br>**Basic Tower** (`basic`) | 60 | 150 | 15 | 55 | Reliable all-round single-target DPS | Early setup, flexible filler, stable lane coverage |
| ![Slow Tower](../game/assets/tower_slow.png)<br>**Slow Tower** (`slow`) | 85 | 140 | 12 | 70 | Applies slow on hit (`slowEffect = 0.45`, `duration = 100`) | Containing fast units and enabling kill-zone uptime |
| ![Area Tower](../game/assets/tower_area_fire.png)<br>**Area Tower** (`area`) | 130 | 200 | 13 | 85 | Pulse-based AoE damage to all enemies in range | Dense waves, summon swarms, mid-late crowd control |
| ![Crystal Tower](../game/assets/tower3.png)<br>**Crystal Tower** (`crystal`) | 120 | 160 | 15 | 150 | Aura support: buffs nearby towers (damage + fire-rate, capped) | Building high-value tower clusters and anchor zones |
| ![Steam Cannon](../game/assets/tower_steam.png)<br>**Steam Cannon** (`steam`) | 180 | 220 | 55 | 200 | Piercing impact (up to 3 targets) + charge stacking on repeated focus | Breaking tank lines and punishing grouped enemies |
| ![Alchemist Tower](../game/assets/tower_alchemist.png)<br>**Alchemist Tower** (`alchemist`) | 150 | 170 | 20 | 70 | Random potion effects: explosion, poison, freeze, weaken | Mixed waves, utility pressure, boss prep and control |

## Design Intent

- Towers are designed as a complementary toolkit, not isolated DPS options.
- Core decisions revolve around timing and placement trade-offs under coin constraints.
- Synergy (slow + AoE, crystal + core DPS, utility + burst) is encouraged to reward strategy depth.
