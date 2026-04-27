# Initial Game Design Discussion (January 20, 2026)

## I. Analysis of Alternative Game Genres
We discussed four main game genre directions and conducted a feasibility assessment for each.

### 1. Action-Reaction Games
**Representative Game:** Pong (Classic Ping Pong)

#### Core Gameplay
- Two paddles move up and down, bouncing the ball.
- Points are scored when the opponent misses a shot.
- The focus is on adjusting the bounce angle and the feel of the controls.

#### Possible Innovations
- **Spin/Cut Mechanism:** Adding a curved trajectory to the ball at the moment of impact based on the paddle's movement direction.
- **Skill System:** Releasing short-term buffs by accumulating energy (expanding the paddle, slowing the ball, creating clone paddles), while maintaining the simplicity of 1v1 gameplay.

#### Technical Challenges
- **Stability of Collisions and Rebounds:** Handling issues such as high-speed ball penetration, abnormal edge bounce angles, and balls sticking to the paddles.
- **Difficulty Curve Design:** AI strength, ball speed limit, and turn rhythm need fine-tuning to avoid extremes like "too easy" or "inevitable loss."

**Suitability Rating:** 6/10

---

### 2. Puzzle-Based Games
**Representative Game:** Tetris

#### Core Gameplay
- Blocks continuously fall; players can rotate and move them left and right.
- Score is awarded for clearing a complete row after a block lands.
- The speed gradually increases, testing spatial planning skills and stress tolerance.

#### Possible Innovations
- **Gravity Direction Mechanism:** After clearing N rows, the gravity direction changes (left/right or upward), but the grid rules are maintained.
- **Special Function Blocks:** Special blocks are designed to clear two rows, create explosion zones, and freeze speeds; their number is strictly controlled to avoid an overabundance of items.

#### Technical Challenges
- **Rotation and Collision Judgment:** Accurate judgment of wall-mounted rotation, blocking judgment, and block landing timing.
- **Optimized Operation Experience:** Refining details such as soft/hard drop, lock-on delay, next block preview, and operation error tolerance.

**Suitability Rating:** 5/10

---

### 3. Strategy Management Game (Tower Defense)
**Representative Work:** Carrot Fantasy

#### Core Gameplay
- Place defensive towers on fixed routes.
- Resist waves of enemy attacks.
- Upgrade or replenish defensive towers after obtaining coins.
- The core lies in layout planning and resource management.

#### Possible Innovations
- **Terrain Attribute System:** Swamps slow down enemies, ruins prevent construction, and augment tiles increase firing rate, making each game's layout unique.
- **Overheat Mechanism:** Continuous tower output reduces efficiency, requiring players to rotate and combine towers, offering more strategic depth than simply stacking stats.

#### Technical Challenges
- **Path and Target Selection:** Enemy movement along path points, corner handling, and tower target selection logic (nearest/frontmost/weakest).
- **Numerical Balance:** Tower price/damage/range/attack speed, enemy wave strength, player economy curve, etc., can easily lead to a "single optimal solution" problem.

**Suitability Rating:** 8/10

---

### 4. Exploration and Growth Games
**Representative Work:** Zelda-like (Zelda-like top-down dungeon crawler)

#### Core Gameplay
- Room exploration + simple combat/puzzle solving
- Obtaining keys and items to unlock new areas
- Final boss challenge
- The core driving force is the sense of progression from exploration.

#### Possible Innovations
- **Abilities as Map Language:** For example, obtaining a grappling hook is necessary to recognize or traverse certain terrain types; using a few key abilities to design levels.
- **Room Rearrangement Mechanism:** After obtaining key items, the connections between some rooms change, creating surprises but requiring controlled scale.

#### Technical Challenges
- **Room/Map Management:** Screen switching logic, door and key status, and consistency in rewinding to prevent players from getting lost or experiencing status confusion.
- **Combat Feel and Judgment:** Invincibility frames upon being hit, collision boxes, and simple yet readable behavior design for enemy AI.

**Suitability Rating:** 7/10

---

## II. Advantages of Tower Defense
After discussion, the team favored tower defense games as the primary development direction, mainly based on the following considerations:

### Comprehensive Advantages
Tower defense games integrate the advantages of other genres—unlike other games that primarily control a single object, tower defense emphasizes global control and macro-level decision-making. Completing levels avoids boredom due to repetition, and each game offers high variability.

### Large Innovation Space
While retaining the core gameplay of tower defense, it's easy to add innovative elements for differentiation. Modern tower defense games often emphasize "creative fusion," forming a long-term operational model. There are also cases that break the tradition of "fixed path tower placement," using mechanisms like "paintbrushes" to change the course of battle. This can even be expanded to include reforms that allow for both offense and defense, demonstrating the vast potential of tower defense systems.

### Team Collaboration Advantages
The tower defense system can be clearly broken down into parallel modules, making it ideal for 6-player teams:

- Path/Monster Movement System (waypoints)
- Tower Target Selection and Attack Logic
- Wave Generation and Difficulty Curve
- Economy and Upgrade System
- UI (Tower Building, Upgrades, Health, Wave Hints, Pause/Speed Up)

These modules have clear interfaces, reducing the probability of conflicts arising from multiple people modifying the same code block, and each module can independently demonstrate its progress.
