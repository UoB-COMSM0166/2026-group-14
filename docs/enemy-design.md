# Enemy Design Overview

This document summarizes enemy differentiation in **Defend London**.

## Enemy Design Matrix

| Enemy (Image + Name) | Role | HP / SPD | Skill (Trigger) | Pressure |
|---|---|---|---|---|
| <img src="../game/assets/enemy_guard.png" alt="Guard" width="56"><br><strong>Guard</strong><br><sub>`basic`</sub> | Standard | 100 / 2.0 | None | Baseline pacing |
| <img src="../game/assets/enemy_pigeon.png" alt="Pigeon" width="56"><br><strong>Pigeon</strong><br><sub>`fast`</sub> | Speed runner | 60 / 3.0 | None (high speed) | Leak pressure |
| <img src="../game/assets/enemy_hedgehog.png" alt="Hedgehog" width="56"><br><strong>Hedgehog</strong><br><sub>`tank`</sub> | Tank | 300 / 1.0 | None (high HP) | Frontline soak |
| <img src="../game/assets/monster1.png" alt="Knight" width="56"><br><strong>Knight</strong><br><sub>`knight`</sub> | Mid-game diver | 180 / 1.6 | **Charge** at <=40% HP, 2.5x speed, 120f | Sudden rush timing |
| <img src="../game/assets/monster2.png" alt="Archer" width="56"><br><strong>Archer</strong><br><sub>`archer`</sub> | Evasive | 90 / 2.2 | **Dodge** 25% hit evade | Burst inconsistency |
| <img src="../game/assets/monster3.png" alt="Giant" width="56"><br><strong>Giant</strong><br><sub>`giant`</sub> | Heavy siege | 500 / 0.9 | **Leap** every 300f | Skip kill-zone time |
| <img src="../game/assets/goblin_bomber.png" alt="Goblin Bomber" width="56"><br><strong>Goblin Bomber</strong><br><sub>`goblinBomber`</sub> | Disruptor | 120 / 2.2 | **Death explode**: disable towers 180f | Spacing tax |
| <img src="../game/assets/diving_lizard.png" alt="Diving Lizard" width="56"><br><strong>Diving Lizard</strong><br><sub>`divingLizard`</sub> | Infiltrator | 150 / 3.3 | **Dive** after <80% HP (untargetable window) | DPS downtime |
| <img src="../game/assets/treant_mage.png" alt="Treant Mage" width="56"><br><strong>Treant Mage</strong><br><sub>`treantMage`</sub> | Support | 200 / 1.2 | **Heal pulse**: 5% max HP in 200 radius every 180f | Extends wave life |
| <img src="../game/assets/gentleman_bug.png" alt="Gentleman Bug" width="56"><br><strong>Gentleman Bug</strong><br><sub>`gentlemanBug`</sub> | Boss | 2500 / 0.8 | **P2** 50% DR (<=60% HP), **P3** 2x speed + slow immune (<=30%), summon + taunt wave | Multi-system stress |

## Design Intent

- Enemy progression evolves from pure stat pressure to mechanic-based pressure.
- Late-game encounters combine mobility, survivability, and disruption to force strategic adaptation.
- Boss design emphasizes phase transitions and multi-system stress rather than raw HP only.
