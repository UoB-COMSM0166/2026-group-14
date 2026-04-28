# Implementation

## Implementation Journey

Development moved through four natural phases:

---

<table>
<tr>

<td align="center" width="25%" valign="top">

### Phase 1 · Prototype

**Core game loop**

- Tile-based grid map
- Single enemy type following a fixed waypoint path
- One basic tower with projectile shooting
- Enemies spawn → move → take damage → die or reach landmark

<br>

![Early prototype: plain grid with Lv1 towers](images/early-prototype.png)
*Early engine: green grid, placeholder towers, no art*

</td>

<td align="center" valign="middle" width="2%">➜</td>

<td align="center" width="25%" valign="top">

### Phase 2 · Foundation

**Levels, economy & systems**

- Three distinct map layouts with per-level grid configs
- `WaveManager` wave-state machine (waiting → spawning → active)
- `Economy` gold system and `Landmark` HP tracking
- Win / lose conditions wired into `GameManager`
- Path edit and map paint debug tooling built

<br>

![Path edit mode with numbered waypoints overlay](images/path-edit-debug.png)
*Path edit mode: numbered waypoints, green/red tile overlay, live console export*

</td>

<td align="center" valign="middle" width="2%">➜</td>

<td align="center" width="25%" valign="top">

### Phase 3 · Content & Balance

**Enemies, towers & tuning**

- 10 enemy types with distinct abilities (charge, leap, heal, taunt…)
- 6 tower types including support (Crystal) and AoE (Steam, Area)
- 3-phase final boss — Gentleman Bug
- Balance formula applied across all three levels
- Repeated playtesting cycles; stats adjusted via `TOWER_TYPES` / `ENEMY_STATS`

<br>

![Monster encyclopaedia showing all 10 enemy types with stats](images/enemy-encyclopedia.png)
*In-game encyclopaedia: all 10 enemy types with HP, speed, reward and ability summary*

</td>

<td align="center" valign="middle" width="2%">➜</td>

<td align="center" width="25%" valign="top">

### Phase 4 · Polish

**Feel & accessibility**

- Main menu, level-select screen, pause and settings panels
- In-game tutorial with step-by-step highlights
- Background music and per-event sound effects (`SoundManager`)
- Monster encyclopaedia with flavour text
- HUD refinements: wave bonus display, placement error feedback

<br>

![Level select screen with illustrated London map](images/level-select.png)
*Level select: illustrated London map with three landmarks and star ratings*

</td>

</tr>
</table>

---

## Technical Challenge 1: Balancing Difficulty for Engaging Combat

**Problem.** We wanted battles to feel tense but fair: players should feel under pressure, not helpless. Early playtests swung between easy waves and sudden difficulty spikes, and the team had no shared way to explain why a wave felt wrong.

**Technical difficulty.** Balance decisions were tightly coupled: a small change in one wave could break later waves. Without a common metric, tuning relied too much on intuition.

**Solution.** We introduced a simple balancing model as a design-time diagnostic:

> **Player Firepower** = towers × damage × attack duration  
> **Enemy Pressure** = enemies per wave × individual HP

The target was rough parity, with a slight enemy advantage to preserve tension. This gave the team a shared language: when enemy stats changed, we could estimate the corresponding player firepower needed.

Concretely, Level 1 opens with 400 gold, enough for five or six basic towers. The 60-gold wave bonus keeps players slightly resource-constrained, so placement choices still matter. Later waves add durable enemies (for example, Hedgehogs) that require players to scale damage in advance.  

We validated every pass with playtesting. When Level 3 boss waves were consistently overwhelming, we reduced boss count and increased preparation time. Repeating this loop with the same model produced a curve testers described as challenging but fair.

**Result.** Balance reviews became specific and actionable: the team could discuss where pressure exceeded expected firepower and tune the exact source.

## Technical Challenge 2: Diverse Abilities That Reward Adaptive Strategy

By Week 5, testers told us Level 2 felt "too easy, then suddenly impossible." That feedback exposed a pacing problem across the level.

In Week 6, we created a balancing spreadsheet to estimate whether HP growth, gold rewards, and tower costs were scaling together. The formulas were simple, but they gave the team a shared reference point when discussions became subjective.

In Week 7, we shipped tuned values based on that pass and reran playtests. Feedback shifted from broad frustration to specific comments such as "Wave 4 is hard but fair," which made iteration much faster.

These formulas were never perfect, but they gave us a common language for balance decisions and reduced argument by intuition alone.

## Technical Challenge 3: Grid Alignment and Debug Tooling

**Problem.** The logical tile grid must match hand-drawn map art exactly. Even a small offset can make buildable areas look blocked, or let towers overlap enemy routes.

**Technical difficulty.** Misalignment issues are hard to diagnose by eye, especially when pathing, placement, and UI boundaries interact.

**Solution.** We added a debug mode that overlays buildable/blocked cells, prints coordinates, and visualizes enemy waypoints. Offsets can be adjusted in real time, so map alignment and path correction are immediately visible.

**Result.** A process that previously took hours of trial and error dropped to minutes. This tooling became part of our normal iteration workflow and reduced late-stage map bugs.

## Conclusion

Implementing *Defend London* taught us that building mechanics and making them *feel right* both demand equal attention. The balance formula gave us a shared diagnostic language; centralised configuration made iteration safe; visual debug tooling made precise alignment tractable. More broadly, this project showed that "feel" is a quality we can diagnose systematically. These practices — principled frameworks, single-source configuration, purpose-built tooling — will transfer directly to future projects.