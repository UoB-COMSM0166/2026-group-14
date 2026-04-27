# Enemy Design Overview

This document summarizes enemy differentiation in **Defend London**.

## Enemy Design Matrix

| Enemy (Image + Name) | Role | Core Stats (HP / Speed) | Skill Mechanics (Trigger) | Gameplay Pressure |
|---|---|---|---|---|
| ![Guard](../game/assets/enemy_guard.png)<br>**Guard** (`basic`) | Standard unit | 100 / 2.0 | No special skill | Establishes baseline pacing and economy loop |
| ![Pigeon](../game/assets/enemy_pigeon.png)<br>**Pigeon** (`fast`) | Speed runner | 60 / 3.0 | No active skill (high base speed) | Punishes weak coverage and reaction delay |
| ![Hedgehog](../game/assets/enemy_hedgehog.png)<br>**Hedgehog** (`tank`) | Frontline tank | 300 / 1.0 | No active skill (high HP) | Absorbs damage and stalls defense lines |
| ![Knight](../game/assets/monster1.png)<br>**Knight** (`knight`) | Mid-game pressure unit | 180 / 1.6 | **Charge**: at HP <= 40%, gains 2.5x speed for 120 frames | Breaks timing expectations with sudden rush |
| ![Archer](../game/assets/monster2.png)<br>**Archer** (`archer`) | Evasive harasser | 90 / 2.2 | **Dodge**: 25% chance to evade incoming damage | Reduces consistency of single-target burst |
| ![Giant](../game/assets/monster3.png)<br>**Giant** (`giant`) | Heavy siege unit | 500 / 0.9 | **Leap**: every 300 frames, jumps forward along path | Skips part of kill zone time and disrupts focus fire |
| ![Goblin Bomber](../game/assets/goblin_bomber.png)<br>**Goblin Bomber** (`goblinBomber`) | Disruption specialist | 120 / 2.2 | **Explode on death**: disables towers within radius for 180 frames | Forces spacing and recovery planning |
| ![Diving Lizard](../game/assets/diving_lizard.png)<br>**Diving Lizard** (`divingLizard`) | Infiltration threat | 150 / 3.3 | **Dive cycle** (after HP < 80%): becomes untargetable/undamageable during dive windows | Creates damage downtime and leak risk |
| ![Treant Mage](../game/assets/treant_mage.png)<br>**Treant Mage** (`treantMage`) | Support healer | 200 / 1.2 | **Heal pulse**: every 180 frames, heals nearby enemies for 5% max HP | Extends wave endurance and amplifies group value |
| ![Gentleman Bug](../game/assets/gentleman_bug.png)<br>**Gentleman Bug** (`gentlemanBug`) | Multi-phase boss | 2500 / 0.8 | **Boss kit**: Phase 2 (<= 60% HP) gains 50% damage reduction; Phase 3 (<= 30% HP) enrages (2x speed) and becomes slow-immune; periodically summons minions and applies global taunt debuff to towers | Tests sustained DPS, control resilience, and adaptation under stacked mechanics |

## Design Intent

- Enemy progression evolves from pure stat pressure to mechanic-based pressure.
- Late-game encounters combine mobility, survivability, and disruption to force strategic adaptation.
- Boss design emphasizes phase transitions and multi-system stress rather than raw HP only.
