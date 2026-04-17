# 2026-group-14
2026 COMSM0166 group 14

# COMSM0166 Project Template
A project template for the Software Engineering Discipline and Practice module (COMSM0166).

## Info

This is the template for your group project repo/report. We'll be setting up your repo and assigning you to it after the group forming activity. You can delete this info section, but please keep the rest of the repo structure intact.

You will be developing your game using [P5.js](https://p5js.org) a javascript library that provides you will all the tools you need to make your game. However, we won't be teaching you javascript, this is a chance for you and your team to learn a (friendly) new language and framework quickly, something you will almost certainly have to do with your summer project and in future. There is a lot of documentation online, you can start with:

- [P5.js tutorials](https://p5js.org/tutorials/) 
- [Coding Train P5.js](https://thecodingtrain.com/tracks/code-programming-with-p5-js) course - go here for enthusiastic video tutorials from Dan Shiffman (recommended!)

## Your Game (change to title of your game)

STRAPLINE. Add an exciting one sentence description of your game here.

IMAGE. Add an image of your game here, keep this updated with a snapshot of your latest development.

LINK. Add a link here to your deployed game, you can also make the image above link to your game if you wish. Your game lives in the [/docs](/docs) folder, and is published using Github pages. 

VIDEO. Include a demo video of your game here (you don't have to wait until the end, you can insert a work in progress video)

## Your Group

![Group photo](./images/group-photo.png)


## Team Members

| Name          | Email | Role |
|---------------|-------|------|
| Jiaxi You     | <fl25387@bristol.ac.uk> | TBD |
| Shasha Tang   | <wj25162@bristol.ac.uk> | TBD |
| Junjie Wang   | <da25293@bristol.ac.uk> | TBD |
| Jingjing Liu  | <bd25907@bristol.ac.uk> | TBD |
| Zejun Zhang   | <tc25992@bristol.ac.uk> | TBD |
| Mingshu Zhang | <so25258@bristol.ac.uk> | TBD |


## Project Report

### Introduction

- 5% ~250 words 
- Describe your game, what is based on, what makes it novel? (what's the "twist"?) 

### Requirements 
We use a GitHub Kanban board to track our progress; you can access it via the link here.
https://github.com/orgs/UoB-COMSM0166/projects/168

- 15% ~750 words
- Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories.

Reflection:

At this stage of the project, our team has been focusing on the preparation work for developing a tower defense game. Through this process, we have gained a basic understanding of Epics, User Stories, Acceptance Criteria, and their roles in the project.

At first, we regarded Epics as broad and abstract goals, and User Stories simply as a list of scattered features. Through group discussion and practice, we gradually realized that Epics represent the core value of the game, while User Stories serve as a critical bridge to translate these high-level values into user-centered and actionable tasks.

We practiced writing User Stories using the "As a user, I want to..., so that..." template, which encouraged us to focus on player experience rather than only technical implementation. Meanwhile, the "Given-When-Then" structure of Acceptance Criteria helped us define clear and testable completion conditions for each feature, ensuring that the team shares a consistent understanding of "done" before writing any code.

In this tower defense game project, these tools helped us transform the abstract idea of "developing a strategic tower defense game" into a concrete development roadmap. By breaking down core gameplay into Epics and detailed User Stories, we aligned our project vision and created a clear plan for the upcoming development phase.

This preparation work has not only improved team collaboration and consensus but also made us deeply realize that careful requirements management is the foundation of building a successful, user-centered product.

### Design

- 15% ~750 words 
- System architecture. Class diagrams, behavioural diagrams. 

### Implementation

#### Implementation Journey

Development moved through four natural phases:

---

<table>
<tr>

<td align="center" width="25%" valign="top">

##### Phase 1 · Prototype

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

##### Phase 2 · Foundation

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

##### Phase 3 · Content & Balance

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

##### Phase 4 · Polish

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

#### Technical Challenge 1: Balancing Difficulty for Engaging Combat

**Challenge.** The experience we wanted was specific: players should feel they *nearly* lost but just barely won. Early playtests revealed wild swings — some waves trivially easy, others immediately unwinnable. Worse, the team had no shared language for diagnosing why a wave felt unfair.

**Technical Difficulty.** Without a principled framework, tuning becomes guesswork. A value that feels fair in wave 1 can cascade into an unwinnable state by wave 3. We needed a diagnostic tool that could express difficulty as a comparable quantity.

**Solution.** We derived a working balance formula:

> **Player Firepower** = towers × damage × attack duration  
> **Enemy Pressure** = enemies per wave × individual HP

The target was rough parity, tilting slightly toward enemies to maintain tension. This formula gave us a common language — when someone proposed buffing an enemy, we could immediately estimate how much additional firepower players would need.

Concretely, Level 1 opens with 400 gold, enough for five or six basic towers before the first wave. The 60-gold wave bonus was calibrated so players always feel one tower short of comfortable. By wave 3, slow but durable Hedgehogs arrive, forcing players to have already scaled their defences. Each leaked enemy deals significant landmark damage — five uncontested breaches end a run — making every placement decision feel consequential.

Verification required real playtesting. When Level 2's boss wave proved consistently overwhelming, we reduced the boss count and extended the preparation window. These cycles — always returning to the formula as a diagnostic anchor — produced a difficulty curve that testers described as challenging but fair.

**Design Value.** The formula transformed subjective debates ("this feels too hard") into tractable discussions ("enemy pressure exceeds firepower by 40% — where should we adjust?").

#### Technical Challenge 2: Diverse Abilities That Reward Adaptive Strategy

**Challenge.** Tower defence risks monotony if each level simply sends more enemies. We wanted every level to introduce mechanics requiring genuinely new strategies, not just more towers.

**Technical Difficulty.** With six tower types and ten enemy types, interactions multiply rapidly. An ability balanced in isolation might break the game in combination. We needed a system where any stat could be adjusted in one place without touching unrelated logic.

**Solution.** We centralised all statistics in configuration tables, making iterative tuning fast and safe. More importantly, we designed abilities around strategic trade-offs rather than raw difficulty increases.

Level 1 introduces only basic enemies and towers, letting players master fundamentals. Level 2 unlocks the Crystal Tower — a support unit that boosts nearby towers rather than attacking directly. This forces a genuine decision: does boosting existing towers outperform simply adding more firepower? The level also introduces enemies with active abilities: Knights that charge when wounded, Archers that evade projectiles, Giants that leap past defensive lines.

Level 3 escalates further with abilities designed to counter established strategies. The Treant Mage heals nearby enemies, threatening to undo damage already dealt — forcing players to prioritise targets. The Goblin Bomber explodes on death, disabling nearby towers and punishing overly clustered defences. The final boss, Gentleman Bug, progresses through three phases: summoning minions, taunting towers to reduce their damage, and gaining resistance as it weakens.

When playtesting revealed the Treant Mage's healing outpaced realistic player damage, a single configuration change resolved the issue instantly — demonstrating how centralised tuning enabled rapid iteration.

**Design Value.** Each ability was designed as a puzzle rewarding adaptive thinking, not an arbitrary difficulty spike.

#### Technical Challenge 3: Grid Alignment and Debug Tooling

**Challenge.** Each level's invisible tile grid must align precisely with its visual background. A boundary offset by even a few pixels could block a visually open area from building, or allow towers to clip into enemy paths — both confusing to players and nearly impossible to diagnose by eye.

**Solution.** We built a debug mode that overlays the tile grid directly on screen, colour-coding buildable versus blocked cells, and printing coordinates to the console. Arrow keys adjust grid offsets in real time; a path visualisation confirms that enemy waypoints trace the intended route exactly.

This tooling transformed hours of guesswork into minutes of precise adjustment. If we were to start over, we would build it in the first week rather than the third.

#### Conclusion

Implementing *Defend Britain* taught us that building mechanics is only part of the work — making them *feel right* demands equal attention. The balance formula gave us a shared diagnostic language; centralised configuration made iteration safe; visual debug tooling made precise alignment tractable. More broadly, this project showed that "feel" is not a vague quality but something that can be diagnosed systematically. These practices — principled frameworks, single-source configuration, purpose-built tooling — will transfer directly to future projects.

### Evaluation

- 15% ~750 words

- One qualitative evaluation (of your choice) 

- One quantitative evaluation (of your choice) 

- Description of how code was tested. 

### Process 

- 15% ~750 words

- Teamwork. How did you work together, what tools and methods did you use? Did you define team roles? Reflection on how you worked together. Be honest, we want to hear about what didn't work as well as what did work, and importantly how your team adapted throughout the project.

### Conclusion

- 10% ~500 words

- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

### Contribution Statement

- Provide a table of everyone's contribution, which *may* be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

### Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.
- **Documentation** of code (5% of report grade)
  - Organise your code so that it could easily be picked up by another team in the future and developed further.
  - Is your repo clearly organised? Is code well commented throughout?
