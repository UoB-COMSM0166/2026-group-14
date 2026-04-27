# 2026-group-14

## Defend London

> Protect the landmarks. Outsmart the invaders. Defend your city.

<table>
  <tr>
    <td align="center" width="50%">
      <a href="./index.html">
        <img src="./images/defend-london-cover.png" alt="Defend London cover" width="420">
      </a>
      <br>
      🎮 <a href="./index.html">Play Now</a>
    </td>
    <td align="center" width="50%">
      <a href="./demo/demo.mp4">
        <video controls width="420" src="./demo/demo.mp4">
          Your browser does not support the video tag.
        </video>
      </a>
      <br>
      📺 <a href="./demo/demo.mp4">Watch Demo</a>
    </td>
  </tr>
</table>


## Your Group

<img src="./images/group-photo.png" alt="Group photo" width="520">


## Team Members

| Name          | Email | Role | Completed Work |
|---------------|-------|------|----------------|
| Jiaxi You     | <fl25387@bristol.ac.uk> | Project Manager / Tester | Project management / Testing / Game engine setup |
| Shasha Tang   | <wj25162@bristol.ac.uk> | Gameplay Developer | Requirements / Gameplay design |
| Junjie Wang   | <da25293@bristol.ac.uk> | Combat Developer | Tower system / Combat mechanics |
| Jingjing Liu  | <bd25907@bristol.ac.uk> | Level Designer | Level design / Visual assets |
| Zejun Zhang   | <tc25992@bristol.ac.uk> | UI Developer | UI / Menu interface |
| Mingshu Zhang | <so25258@bristol.ac.uk> | Systems Developer | Grid system / Gameplay systems / Integration |


## Project Report

### Introduction

#### What is Defend London?

A tower defense game where players protect iconic London landmarks from waves of invading enemies.  
Build towers, manage resources, and survive increasingly challenging waves across three beautifully illustrated levels.

---

#### What Makes It Special ✨

| 🏛️ London Identity | 👾 Diverse Enemies | 🎓 Guided Experience |
|---|---|---|
| Levels based on real landmarks: outer defenses, River Thames, and the Tower of London. | 10 unique enemy types with abilities like charging, dodging, diving, and healing. | An interactive tutorial helps new players learn core mechanics step by step. |

---

### Requirements

We used a GitHub Kanban board to track requirement progress and development tasks:  
https://github.com/orgs/UoB-COMSM0166/projects/168

#### 1) Ideation Summary

Our team compared game genres using three criteria: uniqueness, strategic depth, and implementation clarity.

| Genre | Pros | Cons | Decision |
|---|---|---|---|
| Action | High moment-to-moment excitement | Complex AI reactions and timing-heavy design | Rejected |
| Puzzle | Strong potential for narrative depth | Story and hint design too time-consuming | Rejected |
| Shooting | Familiar and easy to start | Overused by past groups | Rejected |
| **Tower Defense** | Modular systems and strategic choice | No major blocking risk | **Selected** |

**Why Tower Defense?**
- Fewer past teams explored this genre, so it stayed distinctive.
- Enemy behavior is rule-based and easier to validate.
- Players can build personal strategies through tower combinations.

#### 2) Stakeholders

We identified stakeholders using an onion model:

![Onion model](./images/onion_model.png)

Primary stakeholders are players (casual and strategic), while secondary stakeholders include developers and designers maintaining and extending the game.

#### 3) User Requirements

![Use Case Diagram](./images/use_case.png)

| Flow | Steps |
|---|---|
| Main | Start game -> Waves begin -> Select tower -> Place tower -> Defend landmark |
| Alternative | Open settings -> Adjust BGM/volume |

| Role | Story | Value |
|---|---|---|
| Casual Player | I want auto-collect resources. | I can focus on strategy instead of repetitive clicking. |
| Strategic Player | I want to preview tower range before placement. | I can optimize layout without trial-and-error. |
| Strategic Player | I want a next-wave preview. | I can prepare for enemy abilities in advance. |

#### 4) Development Epics

| Epic | Description | Key Acceptance Criteria |
|---|---|---|
| Enemy Wave System | Handles spawning, path traversal, and scaling difficulty. | 3+ enemy archetypes; enemies move from spawn to landmark via path. |
| Tower System | Supports placement, targeting, and extension of tower types. | Place only on valid tiles; towers auto-target enemies in range. |
| Game Interface | Provides real-time status and interaction controls. | HUD updates health/coins/waves; settings menu works during play. |
| Audio System | Improves feedback and immersion through music and SFX. | Core action SFX implemented; players can select different BGM tracks. |
| Map and Environment | Defines tactical map structure and visual identity. | Path/buildable areas clearly separated; themed environmental assets used. |

#### 5) Brief Reflection

This phase showed us that epics express product-level value, while user stories convert that value into implementable tasks.  
The "As a..., I want..., so that..." format kept us user-focused, and acceptance criteria aligned the team on what "done" means before coding.

### Design

#### 1) Design Overview

Defend London follows a modular architecture where each subsystem owns one responsibility and `GameManager` coordinates gameplay flow.

```mermaid
flowchart TD
    GM[GameManager<br/>state + level flow]
    LV[Level System<br/>map, waves, entities]
    EN[Enemy System<br/>movement + abilities]
    TW[Tower System<br/>targeting + attacks]
    CB[Combat System<br/>damage, effects, status]
    EC[Economy System<br/>costs + rewards]
    UI[UI/HUD System<br/>feedback + panels]

    GM --> LV
    LV --> EN
    LV --> TW
    EN --> CB
    TW --> CB
    CB --> EC
    LV --> UI
    EC --> UI
    GM --> UI
```

---

#### 2) Paper Prototypes

Before implementation, we compared two paper prototypes to validate gameplay direction and teamwork fit.

<table>
<tr>
<td align="center" width="50%">
<img src="./images/paper-prototype-ezgif.com-video-to-gif-converter.gif" width="320" alt="Prototype A Defend London">
<br><b>Prototype A: Defend London</b>
</td>
<td align="center" width="50%">
<img src="./images/paper-prototype2-ezgif.com-video-to-gif-converter.gif" width="320" alt="Prototype B Double Steal">
<br><b>Prototype B: Double Steal</b>
</td>
</tr>
</table>

| Aspect | Defend London | Double Steal |
|---|---|---|
| Genre | Tower Defense | Action Platformer |
| Engineering fit | Clear modular split across systems | Tighter coupling between mechanics |
| Team decision | Selected | Rejected |

Defend London was selected because its system boundaries supported clearer ownership, testing, and integration.

---

#### 3) Core Systems Design

### 🗼 Tower System

Tower balance is data-driven through `TOWER_TYPES`, so iteration can happen quickly while preserving behavior consistency.

| Tower | Cost | Damage | Special Ability |
|---|---:|---:|---|
| <img src="../game/assets/tower_basic.png" width="34"> **Basic Tower** | 60 | 15 | Balanced baseline |
| <img src="../game/assets/tower_slow.png" width="34"> **Slow Tower** | 85 | 12 | 45% slow effect |
| <img src="../game/assets/tower_area.png" width="34"> **Area Tower** | 130 | 13 | Pulsing AoE damage |
| <img src="../game/assets/tower3.png" width="34"> **Crystal Tower** | 120 | 15 | +25% nearby tower damage |
| <img src="../game/assets/tower_steam.png" width="34"> **Steam Cannon** | 180 | 55 | Piercing up to 3 targets |
| <img src="../game/assets/tower_alchemist.png" width="34"> **Alchemist Tower** | 150 | 20 | Random potion effects |

> **Design Philosophy:** Towers are trade-offs, not strict upgrades.

### 👾 Enemy System

Enemy behavior is defined in `ENEMY_STATS`, with complexity increasing by level.

| Level | Enemies | Key Abilities |
|---|---|---|
| 1: Basics | <img src="../game/assets/enemy_guard.png" width="22"> Guard, <img src="../game/assets/enemy_pigeon.png" width="22"> Pigeon, <img src="../game/assets/enemy_hedgehog.png" width="22"> Hedgehog | Speed and tank variation |
| 2: Abilities | <img src="../game/assets/monster1.png" width="22"> Knight, <img src="../game/assets/monster2.png" width="22"> Archer, <img src="../game/assets/monster3.png" width="22"> Giant | Charge, dodge, leap |
| 3: Counter-play | <img src="../game/assets/goblin_bomber.png" width="22"> Bomber, <img src="../game/assets/diving_lizard.png" width="22"> Lizard, <img src="../game/assets/treant_mage.png" width="22"> Mage, <img src="../game/assets/gentleman_bug.png" width="22"> Boss | Explosion, dive, heal, multi-phase |

> **Design Philosophy:** Enemies are puzzles that force adaptation, not simple stat inflation.

### ⚔️ Combat Loop

Each frame follows the same loop: `WaveManager` spawns enemies, enemies move, towers attack, and combat resolves status effects and damage.  
Rewarded gold then feeds back into tower placement, creating a repeatable strategy cycle.

---

#### 4) UML Diagrams

### Class Diagram

![Class Diagram](./images/class-diagram.png)
`GameManager` controls state flow, `Level` aggregates active systems, and `Tower`/`Enemy` interactions drive combat updates.

### Sequence Diagram

![Sequence Diagram](./images/sequence-diagram.png)
The runtime loop is frame-based: update level, spawn enemies, move enemies, execute tower attacks, then evaluate economy/UI and win-lose conditions.

---

#### 5) Key Design Decisions

| Decision | Why it matters |
|---|---|
| **Centralized gameplay config (`TOWER_TYPES`, `ENEMY_STATS`)** | Enables rapid balancing with low regression risk |
| **Modular subsystem boundaries** | Supports parallel development and cleaner debugging |
| **Progressive enemy ability rollout by level** | Builds player learning curve while preserving challenge |

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

After developing a deliverable prototype of the game, it was important to evaluate its functionality and playability in order to identify potential flaws at an early stage. To assess the overall quality of the game and develop a comprehensive vision for future improvements, we used both quantitative and qualitative testing methods.

#### Qualitative evaluation
For the Qualitative evaluation, we first explored potential issues through a Think Aloud study conducted with two participants from another project group. The main objective of this method was to have the users’ first gameplay experience. Through this process, we aimed to gain a fundamental understanding of the game’s quality and identify early indicators for future improvements.

#### Think Aloud Evaluation 1: 15/03/2026
- **Positive**: The game interface is visually appealing and clean, allowing players to quickly understand how to operate the game. The rules are simple and clear, making the game easy to learn and play.
- **Negative**: Some monsters’ UI occasionally disappears, making them difficult to see.

#### Think Aloud Evaluation 2: 15/03/2026
- **Positive**: The game provides effective interactive feedback. The click sounds are clear, and there are appropriate sound effects for events such as monster deaths, tower placement, and losing HP. When a tower is placed in an invalid location, the game immediately provides a warning.
- **Negative**: The font size for monster and tower information is a bit small, which affects readability.The game lacks flexibility, as the music volume and brightness cannot be adjusted.

The feedback mainly focused on the UI design and scalability of the game. To further investigate these issues in a more systematic and detailed manner, we applied a heuristic evaluation method. This approach allows evaluators to assess the game based on established usability principles from different perspectives.

The heuristic evaluation was conducted by the team members, as this method requires a deeper understanding of the game’s design and underlying technical implementation in order to identify issues more precisely. After analysing the results from the Think Aloud evaluation and conducting additional testing, we developed the following Heuristic Evaluation Table.

#### Heuristic Evaluation
| Category | Issue | Heuristic | Frequency | Impact | Persistence | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Enemy** | diving enemies could still be targeted while they were underwater | Error prevention | 3 | 2 | 2 | 2.33 |
| **Enemy** | Missing information on monster waves | Help and documentation | 2 | 2 | 3 | 2.33 |
| **Tower** | lack of detailed stats and functional explanations for towers| Recognition rather than recall | 2 | 2 | 1 | 1.67 |
| **Game** | No options to adjust volume, brightness, or select different background music (BGM). | User control and freedom | 3 | 4 | 3 | 3.33 |
| **Settings** |The settings UI on the main menu does not scale properly to screen size  | Consistency and standards | 3 | 2 | 2 | 2.33 |
| **Settings** |The settings menu UI is inconsistent between the main menu and the in-game interface.| Consistency and standards| 1 | 2 | 3 | 2 |
| **Enemy** | Visual bug where certain monster images occasionally fail to render. | Consistency and standards | 3 | 2 | 1 | 2 |
| **Menu** | Font size is too small, making it difficult to read game information comfortably. | UAesthetic and minimalist design | 2 | 3 | 2 | 2.33 |

#### Development Focus
Based on the results, our next development focus will be concentrated on the following aspects:
- Fixing critical bugs to prevent game crashes and ensure stable gameplay
- Improving UI readability and ensuring consistent rendering across different devices
- Enhancing game flexibility by adding more background music options and a volume control system
- Providing clear and accessible information about game mechanics

#### Quantitative evaluation

For quantitative evaluation, we used the NASA-TLX method together with a structured test plan documented in a dedicated Tower Defense Game Test Document. The test document provided a systematic basis for evaluating the game’s functional behaviour and the players’ perceived workload.

The Tower Defense Game Test Document began with an overview of purpose and scope, stating that it is used to systematically test the tower defense game developed with p5.js and verify whether functions, combat logic, UI interaction, boundary performance, and compatibility meet expected design requirements.

The quantitative evaluation was executed in a controlled environment:

- Browsers: Chrome, Edge, Firefox (latest versions)
- Framework: p5.js
- Devices: PC (Windows/macOS, standard screen resolution)
- Tools: browser developer tools for checking localStorage, frame rate, and error logs

The test process included 24 specific cases across five core modules: Functional Testing, Combat & Balancing Testing, UI & UX Testing, Boundary & Robustness Testing, and Compatibility & Performance Testing.

The test module summary is shown below:

| Test Module | Number of Cases | Focus Area |
| --- | --- | --- |
| Functional Testing | 6 | Core gameplay interactions and build mechanics |
| Combat & Balancing Testing | 6 | Tower-enemy interaction, targeting logic, and balance |
| UI & UX Testing | 6 | Menu flow, settings controls, save/load, and interface feedback |
| Boundary & Robustness Testing | 4 | Stability under edge cases, click handling, and game over logic |
| Compatibility & Performance Testing | 2 | Browser compatibility and high-load frame rate behaviour |

Key quantitative methods were:

- **NASA-TLX**: players completed the NASA Task Load Index questionnaire after each play session to quantify cognitive workload, effort, frustration, and overall task difficulty.
- **Task Completion Rate**: recording whether key tasks such as tower placement, wave progression, and level completion were successful.
- **Error Rate**: logging incorrect behaviours such as invalid placement, blocked actions, save/load failures, and unintended game responses.
- **Performance Testing**: observing frame rate stability and browser compatibility during late high-pressure waves.

The NASA-TLX evaluation involved 10 players, including 5 with prior tower defense experience and 5 without. The average scores for each dimension are shown below:

| Evaluation Dimension | Overall Average Score | Load Level |
| --- | --- | --- |
| Mental Demand | 40.4 | Medium |
| Physical Demand | 22.0 | Low |
| Temporal Demand | 37.7 | Medium |
| Performance | 29.7 | Low |
| Effort | 35.5 | Medium |
| Frustration | 24.0 | Low |
| Overall Task Load | 31.6 | Low-Medium |

Key quantitative observations from the test document:

- the core interactions such as tower placement and wave progression behaved as expected in most cases
- the save system preserved progress across browser refreshes when the same nickname was used
- compatibility tests confirmed normal behaviour in Chrome, Edge, and Firefox
- performance tests showed stable frame rate and no obvious lag during later waves with many enemies and towers

These quantitative measures gave us concrete evidence that the game’s systems were functioning correctly, and NASA-TLX provided a structured way to compare player workload before and after the usability improvements.

#### Description of how code was tested

We tested the code at three levels:

- **Manual functional testing**: played the game directly to verify core interactions such as tower placement, enemy movement, wave progression, and level completion.
- **Heuristic review**: the team inspected interface flows and interaction design using usability principles, checking for consistency, error prevention, and clear feedback.
- **Technical validation**: used the in-game debug overlay and map tools to confirm that enemy pathing matched the visible map, that buildable tiles aligned correctly, and that tower targeting logic responded appropriately after tuning range and cooldown values.

Our testing approach was deliberately hands-on. By replaying the game after each fix and checking the reported issues, we confirmed that each change improved usability without introducing new regressions.

#### Summary of outcomes

##### Positive observations

- The core tower defense loop is clear: players can choose towers, place them on a grid, and see enemies move along defined London-themed paths.
- The audio and feedback system works well for basic events: tower placement, enemy death, and landmark damage are all clearly communicated.
- The balance model created for gold income and enemy pressure produced a sense of tension while still allowing players to recover through good strategy.

##### Key issues identified

1. **UI readability and information clarity**
   - Some tower and enemy statistics were too small or hard to read during active gameplay.
   - Monster icons and status labels were not always visible, especially when many enemies appeared at once.

2. **Settings and control flexibility**
   - Players could not adjust volume or brightness in-game, which reduced accessibility and personalization.
   - The settings panel appeared inconsistent between the main menu and the in-game interface.

3. **Usability gaps**
   - A lack of explicit wave-preview detail made some waves feel unexpectedly hard.
   - The menu and tutorial flow could better explain the difference between support towers and direct-damage towers.

4. **Rendering and consistency bugs**
   - Some enemy images occasionally failed to render or disappeared during fast movement.
   - Buildable grid cells and the background visuals were sometimes misaligned on edge cases, making it unclear where towers could be placed.

#### Improvements to implement

Based on evaluation, the next development cycle should focus on:

- improving HUD readability with larger text and clearer iconography
- adding music/volume controls and a consistent settings experience
- giving players better wave preview and tower information before placement
- fixing rendering glitches for enemies and ensuring grid alignment stays consistent across all levels

#### Testing notes

- The Think Aloud study highlighted user-facing problems quickly, especially around the tutorial and information density.
- Heuristic review by the team was effective for catching issues that testers did not explicitly mention, such as consistency in menu layout and error prevention during tower placement.
- The debug overlay and map grid tooling proved valuable for ensuring pathing and tower placement logic matched the player-visible environment.

### Process

#### Team collaboration

Our game development process was organised around regular team coordination, shared documentation, and a common project board.

- We used the GitHub project board as our primary task tracker. The board captured feature progress, bug fixes, and design tasks, which helped the team keep a shared sense of priority.
- Design work and decisions were documented in the `/docs` folder, including the use case model, class diagrams, and sequence diagrams.
- We held frequent group discussions to decide the game direction, with an early focus on choosing a genre that was both playable and technically achievable.

#### Role distribution and workflow

The team divided the work into major subsystems:

- **Game mechanics and balance**: wave manager, enemy statistics, tower effects, and the balance formula that guided difficulty tuning.
- **UI and interaction**: menu flow, HUD, settings, and feedback for tower placement.
- **Level design and assets**: map layouts, enemy paths, and London-themed environment details.
- **Quality and debugging**: buildable-grid alignment, rendering stability, and playable prototype testing.

Although individual roles were flexible, this structure helped each member focus on a specific area while still collaborating across the whole game.

#### Process timeline

We followed a four-phase development path:

1. **Prototype**: built the core loop with a single enemy type, one basic tower, and a playable grid map.
2. **Foundation**: added level progression, the economy system, and basic win/lose conditions.
3. **Content and balance**: introduced multiple enemy types, additional towers, and enemy abilities, while tuning difficulty across levels.
4. **Polish**: improved menus, added sound and music, implemented tutorial guidance, and refined HUD feedback.

#### Challenges and adaptation

- At first, the team needed a stronger shared language for balancing the game. We solved this by defining a simple firepower-versus-pressure formula that made tuning discussions more objective.
- Communication and task handoff were not perfect early on; some features overlapped and required repeated integration checks. Using the project board and more frequent mini-demos helped the team stay aligned.
- The map grid alignment issue was a technical bottleneck. We adapted by building a debug overlay tool, which reduced uncertainty and made level adjustments much faster.

#### Reflection

Overall, our process combined creative design with practical engineering. We learned that good collaboration requires both a clear roadmap and flexible iteration. The team improved most when we turned vague problems into concrete tasks: a UI bug became a settings refinement task, and an unfair level became a balance formula adjustment.

The process also taught us that documentation matters. Writing user stories, epics, and diagrams helped the team agree on what to build, while evaluation notes gave us a better basis for prioritising improvements.

## Sustainability, Ethics and Accessibility

### Overall Approach

In this project, we understood sustainability as the ability of the game system to retain its value, stability and adaptability throughout long-term use, maintenance and future extension. Because Defend London is a browser-based tower defense game, the most relevant sustainability issues include resource loading, local data storage, player experience, code structure and future extensibility. Based on the Sustainability Awareness Framework (SusAF), our group considered sustainability across five dimensions: social, individual, environmental, economic and technical sustainability.

| Sustainability Dimension | Relevant Topics for Defend London |
|---|---|
| Social | London-themed representation, player trust, fair gameplay |
| Individual | Player comfort, learning support, privacy, accessibility |
| Environmental | Resource loading, browser performance, energy use |
| Economic | Low-cost development, no server cost, future maintenance |
| Technical | Modular code, maintainability, extensibility |

### SusAD Diagram

We used a SusAD diagram to show both positive opportunities and negative risks across the five sustainability dimensions. The diagram helps show how small design decisions can create wider effects. For example, local browser saving can reduce server infrastructure, nickname-only saving can reduce privacy risk, and modular code can lower future maintenance cost. It also highlights possible risks, such as large image/audio assets increasing resource use, mouse or colour-based interaction reducing accessibility, and repeated configuration values increasing maintenance cost.
![SusAD](./images/SusAD.png)
**Figure: SusAD diagram showing positive opportunities and negative risks across the five sustainability dimensions for Defend London.**

---

## Social

Our group designed Defend London with a clear London-themed identity, including recognisable landmarks and city-inspired levels. This gives the game a stronger identity than a generic fantasy tower defense game and adds some cultural value. However, because we use a real city as the theme, we also need to avoid careless or stereotypical representations of London, its people or its culture.

We also think social sustainability is connected to player trust. Players should be able to understand the game rules clearly, including enemy paths, tower functions and why they win or lose. In future development, we could improve tower descriptions, enemy ability explanations and level guidance so that players can understand the game more fairly.

---

## Individual

From an individual perspective, our group supports players through the tutorial, pause screen, level selection, continue option, try again button and win/lose screens. These features reduce confusion and make the game easier for first-time players to learn.

We also included music volume, music selection and brightness settings, allowing players to adjust the experience according to their comfort. However, our current accessibility is still limited because the game mainly relies on mouse input and visual judgement. This may make the game harder to use for players who have difficulty with mouse control or colour-based information. In future development, we could add keyboard controls, clearer text labels, high-contrast UI options, colour-blind friendly visual indicators and text feedback for important sound events.

Ethically, our group tried to avoid unnecessary personal data collection. Players only need to enter a nickname, with no email address, password, real name or external account required. This supports data minimisation. However, we should explain more clearly that progress is stored locally in the browser and add a “delete save data” option, so players have more control over their information.

---

## Environmental

We designed Defend London as a browser-based game that can run locally. Player progress is saved using `localStorage`, so the basic progression system does not need a remote account server or database. This reduces unnecessary infrastructure and network communication.

The game also uses wave-based enemy spawning instead of creating all enemies at once. This reduces the number of active objects the browser needs to update at the same time, which helps reduce browser workload. However, the game uses many image and audio assets, so large files may increase loading time, memory use and CPU usage. Future work should include compressing assets, removing unused files, and measuring loading time, memory use and CPU usage.

---

## Economic

Our group used accessible web technologies to develop Defend London. The project does not require paid infrastructure, a custom backend or platform-specific deployment. This makes it suitable for a student group project and avoids unnecessary cost.

The modular code structure also helps reduce future maintenance cost. Since enemies, towers, economy, waves, map data and paths are handled separately, future developers can update one part of the game without rewriting the whole system. However, repeated configuration values could make future updates harder, so they should be reduced or centralised.

---

## Technical

We divided the game into multiple modules instead of writing it as one large file. `GameManager.js` coordinates the overall game state and level flow, while other files manage enemies, towers, economy, waves, map data and paths. This makes the project easier to understand, debug and extend.

The separation between `MapData.js` and `Path.js` also improves maintainability because buildable areas and enemy movement paths can be changed independently. In future development, we could further centralise repeated configuration values, document important functions and add tests for tower placement, enemy movement and wave progression.

---

## Future Actions

| Area | Future Improvement |
|---|---|
| Privacy | Explain local saving and add a “delete save data” option |
| Accessibility | Add keyboard controls, high-contrast mode and clearer text labels |
| Environmental | Compress image/audio assets and measure performance |
| Technical | Improve documentation and reduce repeated configuration |
| Social | Make tower rules, enemy abilities and level guidance clearer |

Overall, we think Defend London already has a reasonable foundation for sustainability, ethics and accessibility, but it is not fully complete yet. The main future improvements are clearer privacy communication, better accessibility support, asset optimisation, stronger documentation and more measurable performance testing.

### Conclusion

Overall, Defend London started as a simple London-themed tower defense idea and developed into a playable browser game with multiple levels, enemy waves, towers, economy, UI, sound feedback, local saving, and a clear visual style. This project showed us that game development is not just about adding features; the harder part is making different systems work together so that the player experience feels clear, fair, and enjoyable, while creating a useful, usable, maintainable, and responsible system for real users.

One important lesson we learned was the value of iterative and agile development. Our plan changed as the game developed. Some ideas seemed straightforward at the beginning, but became more complicated during implementation, especially grid alignment, enemy pathing, wave balance, and UI readability. Instead of following one fixed plan, we improved the game through repeated testing, discussion, feedback, and small adjustments. The GitHub project board and regular team communication helped us keep track of progress and decide what needed to be improved next.

Epics and user stories were also useful because they helped us turn a broad idea into clearer development tasks. They made us think from the player’s perspective, such as whether tower placement was clear, whether waves felt fair, and whether the interface gave enough feedback. This helped the team divide the work more clearly and focus on the gameplay experience rather than only technical implementation.

The class diagram and sequence diagram helped us understand the structure and behaviour of the game before and during implementation. They made the relationships between enemies, towers, waves, the economy system, paths, map data, UI, and game state easier to discuss. In practice, this supported our modular structure and made the project easier to debug and extend.

Testing changed how we looked at the game because it showed us the difference between a game that works from a developer’s perspective and a game that feels clear and comfortable from a player’s perspective. Think Aloud testing and heuristic evaluation showed problems that we had started to ignore as developers, such as small text, unclear feedback, limited settings, and missing wave information. NASA-TLX also gave us another way to check whether the game felt too demanding or frustrating for players. These evaluations made us realise that a game can be technically working, but still need improvement in usability, accessibility, feedback, and player comfort.

We also used SusAF to reflect on sustainability, ethics, and accessibility. This helped us think beyond immediate gameplay and consider wider effects such as privacy, resource use, maintainability, and inclusiveness. Our current design has some good foundations, including local browser saving, nickname-only progress storage, modular code, and lightweight web deployment. However, there are still risks, such as large image and audio assets, mouse or colour-based interaction, and repeated configuration values.

If we continued developing the current game, we would focus on improving accessibility, polishing the interface, compressing assets, adding clearer wave previews, and explaining local saving more clearly. We would also improve documentation so that future developers could understand the code structure, configuration files, and debugging tools more easily. If we had the chance to make a sequel, we would expand the London theme with more landmarks, more enemy routes, richer enemy abilities, and a deeper progression system.

Overall, this project taught us that game development depends on much more than coding. Iteration, teamwork, requirements, design, testing, sustainability, and privacy all affected whether our final game became playable, understandable, and maintainable.

### Contribution Statement

| Contributor | Contribution |
|---|---|
| Jiaxi You | 1 |
| Shasha Tang | 1 |
| Junjie Wang | 1 |
| Jingjing Liu | 1 |
| Zejun Zhang | 1 |
| Mingshu Zhang | 1 |

### Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.
- **Documentation** of code (5% of report grade)
  - Organise your code so that it could easily be picked up by another team in the future and developed further.
  - Is your repo clearly organised? Is code well commented throughout?
